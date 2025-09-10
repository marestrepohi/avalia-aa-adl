import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Users, Activity, Building2, AlertCircle, CheckCircle2, DollarSign, FolderKanban } from 'lucide-react';
import { loadCasosUsoCsv, CasoUsoCsvRecord } from '@/lib/parseCasosUsoCsv';
import { supabase } from '@/integrations/supabase/client';
import { useDashboard } from '@/contexts/DashboardContext';

interface Entidad {
  id_nombre: string;
  descripcion: string;
  logo_url: string;
  color: string;
}

interface CasoUso {
  PROJECT_ID: number;
  'Tipo Proyecto': string;
  Estado: string;
  id_nombre: string;
  Proyecto: string;
  Etapa: string;
}

const CasosUso = () => {
  const { setActiveView } = useDashboard();
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [casosUso, setCasosUso] = useState<CasoUso[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvRecords, setCsvRecords] = useState<CasoUsoCsvRecord[]>([]);
  const [csvSummaries, setCsvSummaries] = useState<Record<string, {
    total: number;
    activos: number; // ahora: Finalizado - con uso
    desarrollo: number; // estados en desarrollo / implementación
    alertas: number;
    impactoTotal: number;
    ds: number; // científicos de datos únicos derivados del CSV
  }>>({});
  const [globalSummary, setGlobalSummary] = useState<{
    total: number;
    activos: number;
    inactivos: number;
    desarrollo: number;
    impactoTotal: number;
  }>({ total: 0, activos: 0, inactivos: 0, desarrollo: 0, impactoTotal: 0 });

  useEffect(() => {
  const fetchData = async () => {
      try {
        // Cargar entidades
        const { data: entidadesData, error: entidadesError } = await supabase
          .from('entidades')
          .select('*');

        if (entidadesError) throw entidadesError;

        // Cargar casos de uso
        const { data: casosData, error: casosError } = await supabase
          .from('casos_uso')
          .select('*');

        if (casosError) throw casosError;

        setEntidades(entidadesData || []);
        setCasosUso(casosData || []);

        // Cargar CSV (solo una vez)
    try {
          const { records } = await loadCasosUsoCsv('/casos_uso.csv');
            setCsvRecords(records);
            // Construir summaries por entidad
            const summaries: Record<string, { total:number; activos:number; desarrollo:number; alertas:number; impactoTotal:number; ds:number; }> = {};
            const parseMonto = (v?: string) => {
              if (!v) return 0;
              let s = v.replace(/[^0-9,.-]/g,'').trim();
              if ((s.match(/,/g) || []).length > 1 && s.includes('.')) {
                s = s.replace(/\./g,'').replace(/,/g,'.');
              } else if (s.includes('.') && s.includes(',')) {
                if (/\d+\.\d{3},\d+/.test(s)) {
                  s = s.replace(/\./g,'').replace(/,/g,'.');
                } else if (/\d+,\d{3}\.\d+/.test(s)) {
                  s = s.replace(/,/g,'');
                }
              } else {
                s = s.replace(/,(?=\d{3}(?:\D|$))/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'');
              }
              const num = parseFloat(s);
              return isNaN(num) ? 0 : num;
            };
            const alertRegex = /finalizado\s*-?\s*sin\s*uso|entregado\s*-?\s*sin\s*uso|deprecad/i;
            const dsColumns = ['DS1','DS2','DE','MDS','DS Entidad'];
            for (const r of records) {
              const ent = r.Entidad?.trim();
              if (!ent) continue;
              if (!summaries[ent]) summaries[ent] = { total:0, activos:0, desarrollo:0, alertas:0, impactoTotal:0, ds:0 };
              const s = summaries[ent];
              s.total++;
              const estadoLc = (r.Estado || '').toLowerCase();
              // Activo definido como 'Finalizado - con uso'
      if (/(finalizado|entregado)\s*-?\s*con\s*uso/i.test(estadoLc) || /en\s*producci[óo]n|\bactivo\b/.test(estadoLc)) s.activos++;
              // En desarrollo / implementación
              if (/(en\s*desarr|\bdesarrollo\b|implementaci[óo]n|en\s*implementaci[óo]n)/i.test(estadoLc)) s.desarrollo++;
              if (alertRegex.test(estadoLc)) s.alertas++;
              s.impactoTotal += parseMonto(r['Impacto Financiero']);

              // Contar científicos únicos por entidad
              const dsSetKey = `__dsSet_${ent}`;
              // @ts-ignore attach temp set
              if (!summaries[dsSetKey]) {
                // @ts-ignore
                summaries[dsSetKey] = new Set<string>();
              }
              // @ts-ignore
              const dsSet: Set<string> = summaries[dsSetKey];
              for (const col of dsColumns) {
                const raw = (r as any)[col];
                if (!raw) continue;
                const parts = String(raw).split(/[;,/]| y | e /i);
                for (let p of parts) {
                  p = p.trim();
                  if (!p) continue;
                  if (p === '-' || /n\/?a/i.test(p)) continue;
                  // Normalizar capitalización
                  const norm = p.replace(/\s+/g,' ').toLowerCase();
                  dsSet.add(norm);
                }
              }
              s.ds = dsSet.size;
            }
            // Limpiar sets auxiliares
            Object.keys(summaries).forEach(k => {
              if (k.startsWith('__dsSet_')) delete (summaries as any)[k];
            });
            setCsvSummaries(summaries);

            // Resumen global
            const global = records.reduce((acc, r) => {
              const estadoLc = (r.Estado || '').toLowerCase();
              acc.total += 1;
              if (/(finalizado|entregado)\s*-?\s*con\s*uso/i.test(estadoLc) || /en\s*producci[óo]n|\bactivo\b/.test(estadoLc)) acc.activos += 1;
              if (/(deprecad|finalizado\s*-?\s*sin\s*uso|entregado\s*-?\s*sin\s*uso)/i.test(estadoLc)) acc.inactivos += 1;
              if (/(en\s*desarr|\bdesarrollo\b|implementaci[óo]n|en\s*implementaci[óo]n|pilotaje)/i.test(estadoLc)) acc.desarrollo += 1;
              acc.impactoTotal += parseMonto(r['Impacto Financiero']);
              return acc;
            }, { total: 0, activos: 0, inactivos: 0, desarrollo: 0, impactoTotal: 0 });
            setGlobalSummary(global);
        } catch (e) {
          console.warn('CSV casos_uso.csv no disponible o error parseando', e);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCasosUsoByEntity = (entidad: string) => casosUso.filter(caso => caso.id_nombre === entidad);
  const getCasosActivos = (entidad: string) => getCasosUsoByEntity(entidad).filter(caso => 
    caso.Estado === 'Activo' || caso.Estado === 'En producción'
  ).length;

  const handleEntityClick = (entidad: Entidad) => {
    // Guardar la entidad seleccionada en localStorage para la vista de detalle
    localStorage.setItem('selectedEntity', JSON.stringify(entidad));
    setActiveView('entityCasosUso');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Casos de Uso por Entidad</h1>
        <p className="text-muted-foreground">
          Selecciona una entidad para ver y gestionar sus casos de uso de IA
        </p>
      </div>

      {/* Resumen global desde CSV */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 dark:from-blue-950/50 dark:to-blue-900/30 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Casos</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{globalSummary.total}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 dark:from-green-950/50 dark:to-green-900/30 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400">Casos Activos</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{globalSummary.activos}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 dark:from-red-950/50 dark:to-red-900/30 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600 dark:text-red-400">Casos Inactivos</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{globalSummary.inactivos}</p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 dark:from-orange-950/50 dark:to-orange-900/30 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">En Desarrollo</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{globalSummary.desarrollo}</p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 dark:from-emerald-950/50 dark:to-emerald-900/30 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Impacto Total</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{new Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:1}).format(globalSummary.impactoTotal)}</p>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...entidades].sort((a,b)=>a.id_nombre.localeCompare(b.id_nombre,'es',{sensitivity:'base'})).map((entidad) => {
          const csvSummary = csvSummaries[entidad.id_nombre];
          const casosActivos = csvSummary ? csvSummary.activos : getCasosActivos(entidad.id_nombre);
          const totalCasos = csvSummary ? csvSummary.total : getCasosUsoByEntity(entidad.id_nombre).length;
          const cientificos = csvSummary ? csvSummary.ds : 0;
          const enDesarrollo = csvSummary ? csvSummary.desarrollo : 0;

          return (
            <Card 
              key={entidad.id_nombre} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
              onClick={() => handleEntityClick(entidad)}
            >
              <CardHeader className="space-y-2 pb-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-12 h-12 rounded-md flex items-center justify-center p-1 shrink-0 bg-white border shadow-sm"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      {entidad.logo_url ? (
                        <img 
                          src={entidad.logo_url} 
                          alt={`Logo ${entidad.id_nombre}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) nextElement.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <Building2 
                        className="w-7 h-7" 
                        style={{ 
                          color: entidad.color,
                          display: entidad.logo_url ? 'none' : 'flex'
                        }} 
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <CardTitle className="text-lg font-semibold truncate max-w-xs">
                          {entidad.id_nombre}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs truncate max-w-sm">
                        {entidad.descripcion}
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Brain className="w-4 h-4 text-primary mr-1" />
                      <span className="text-lg font-semibold">{casosActivos}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Activos</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary mr-1" />
                      <span className="text-lg font-semibold">{totalCasos}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary mr-1" />
                      <span className="text-lg font-semibold">{cientificos}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Científicos</p>
                  </div>
                </div>

                {csvSummary && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="flex flex-col items-center rounded-md border p-2 bg-background/60">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">En desarrollo</span>
                      <span className="text-sm font-semibold flex items-center gap-1">{enDesarrollo}</span>
                    </div>
                    <div className={`flex flex-col items-center rounded-md border p-2 ${csvSummary.alertas>0 ? 'bg-red-50 border-red-200' : 'bg-background/60'}`}> 
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Alertas</span>
                      <span className="text-sm font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{csvSummary.alertas}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-md border p-2 bg-background/60">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Impacto Total</span>
                      <span className="text-sm font-semibold flex items-center gap-1"><DollarSign className="w-3 h-3" />{new Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:1}).format(csvSummary.impactoTotal)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {casosActivos > 0 && (
                      <Badge variant="default" className="text-xs">
                        {casosActivos} Activos
                      </Badge>
                    )}
                    {totalCasos === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Sin casos
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs group-hover:bg-primary/10"
                  >
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {entidades.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No hay entidades configuradas</h3>
              <p className="text-muted-foreground">
                Configura entidades para comenzar a gestionar casos de uso de IA
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CasosUso;