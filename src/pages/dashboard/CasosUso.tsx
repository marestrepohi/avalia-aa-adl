import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Users, Activity, Building2, AlertCircle, CheckCircle2, DollarSign, FolderKanban } from 'lucide-react';
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
    estados: Record<string, number>;
    impactoTotal: number;
  }>({ total: 0, estados: {}, impactoTotal: 0 });

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

            // Extraer estados únicos
            const uniqueEstados = Array.from(new Set(records.map(r => r.Estado?.trim()).filter(Boolean))).sort();

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

            // Resumen global por estados individuales
            const estadoCounts: Record<string, number> = {};
            records.forEach(r => {
              const estado = r.Estado?.trim();
              if (estado) {
                estadoCounts[estado] = (estadoCounts[estado] || 0) + 1;
              }
            });

            const global = {
              total: records.length,
              estados: estadoCounts,
              impactoTotal: records.reduce((sum, r) => sum + parseMonto(r['Impacto Financiero']), 0)
            };
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

  {/* Resumen global desde CSV - 2 filas, tarjetas compactas con título y valor en línea */}
      {(() => {
        type MetricItem = {
          key: string;
          title: string;
          value: string | number;
          Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
          iconBg: string;
          titleColor: string;
        };

        const items: MetricItem[] = [
          {
            key: 'total',
            title: 'Total de Casos',
            value: globalSummary.total,
            Icon: FolderKanban,
            iconBg: 'bg-blue-100 dark:bg-blue-900/50',
            titleColor: 'text-blue-700 dark:text-blue-300',
          },
          {
            key: 'impacto',
            title: 'Impacto Total',
            value: new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 }).format(globalSummary.impactoTotal),
            Icon: DollarSign,
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
            titleColor: 'text-emerald-700 dark:text-emerald-300',
          },
          ...Object.entries(globalSummary.estados || {}).map(([estado, count], idx) => {
            const palettes = [
              { iconBg: 'bg-green-100 dark:bg-green-900/50', titleColor: 'text-green-700 dark:text-green-300' },
              { iconBg: 'bg-blue-100 dark:bg-blue-900/50', titleColor: 'text-blue-700 dark:text-blue-300' },
              { iconBg: 'bg-purple-100 dark:bg-purple-900/50', titleColor: 'text-purple-700 dark:text-purple-300' },
              { iconBg: 'bg-orange-100 dark:bg-orange-900/50', titleColor: 'text-orange-700 dark:text-orange-300' },
              { iconBg: 'bg-red-100 dark:bg-red-900/50', titleColor: 'text-red-700 dark:text-red-300' },
              { iconBg: 'bg-yellow-100 dark:bg-yellow-900/50', titleColor: 'text-yellow-700 dark:text-yellow-300' },
              { iconBg: 'bg-pink-100 dark:bg-pink-900/50', titleColor: 'text-pink-700 dark:text-pink-300' },
              { iconBg: 'bg-indigo-100 dark:bg-indigo-900/50', titleColor: 'text-indigo-700 dark:text-indigo-300' },
              { iconBg: 'bg-teal-100 dark:bg-teal-900/50', titleColor: 'text-teal-700 dark:text-teal-300' },
              { iconBg: 'bg-cyan-100 dark:bg-cyan-900/50', titleColor: 'text-cyan-700 dark:text-cyan-300' },
            ];
            const p = palettes[idx % palettes.length];
            return {
              key: `estado-${estado}`,
              title: estado,
              value: count as number,
              Icon: Activity,
              iconBg: p.iconBg,
              titleColor: p.titleColor,
            } as MetricItem;
          })
        ];

        const rows = items.length <= 7
          ? [items]
          : [items.slice(0, 7), items.slice(7)];
        const twoRows = items.length > 7;

        return (
          <div className="w-full space-y-3">
            {rows.filter(r => r.length > 0).map((row, idx) => (
              <div
                key={idx}
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${twoRows ? 7 : row.length}, minmax(0, 1fr))` }}
              >
                {row.map((item) => (
                  <Card key={item.key} className="h-[64px] overflow-hidden border bg-card">
                    <CardContent className="h-full p-2.5">
                      <div className="flex h-full items-center">
                        <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                          <span className={`text-xs font-medium ${item.titleColor} whitespace-normal break-words leading-tight`}>{item.title}</span>
                          <span className="text-xl font-bold text-foreground flex-shrink-0">{item.value}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        );
      })()}

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
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="rounded-md border p-2 h-10 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Activos</span>
                    <span className="text-sm font-semibold">{casosActivos}</span>
                  </div>
                  <div className="rounded-md border p-2 h-10 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-sm font-semibold">{totalCasos}</span>
                  </div>
                  <div className="rounded-md border p-2 h-10 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Científicos</span>
                    <span className="text-sm font-semibold">{cientificos}</span>
                  </div>
                </div>

                {csvSummary && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    <div className="rounded-md border p-2 h-10 flex items-center justify-between bg-background/60">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">En desarrollo</span>
                      <span className="text-sm font-semibold">{enDesarrollo}</span>
                    </div>
                    <div className={`rounded-md border p-2 h-10 flex items-center justify-between ${csvSummary.alertas>0 ? 'bg-red-50 border-red-200' : 'bg-background/60'}`}>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Alertas</span>
                      <span className="text-sm font-semibold">{csvSummary.alertas}</span>
                    </div>
                    <div className="rounded-md border p-2 h-10 flex items-center justify-between bg-background/60">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Impacto Total</span>
                      <span className="text-sm font-semibold">{new Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:1}).format(csvSummary.impactoTotal)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
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