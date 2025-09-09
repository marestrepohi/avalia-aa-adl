import React, { useEffect, useState, useMemo } from 'react';
import { loadCasosUsoCsv, buildKpis, classifyCasoTipo, CasoUsoCsvRecord } from '@/lib/parseCasosUsoCsv';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ExternalLink, ArrowRight, BarChart3, TrendingDown, Target, Zap, Activity, CheckCircle2, PauseCircle, DollarSign, Briefcase, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import Papa from 'papaparse';

interface Props {
  entidad?: string;
  onSelectCaso?: (tipo: string, titulo?: string) => void;
  flat?: boolean; // opcional si se quisiera forzar plano
}

const CasosUsoEntidad: React.FC<Props> = ({ entidad, onSelectCaso, flat }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<CasoUsoCsvRecord[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { records } = await loadCasosUsoCsv('/casos_uso.csv');
        if (!active) return;
        setRecords(entidad ? records.filter(r => r.Entidad === entidad) : records);
      } catch (e: any) {
        setError(e.message || 'Error cargando CSV');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [entidad]);

  const agrupado = useMemo(() => {
    const map: Record<string, CasoUsoCsvRecord[]> = {};
    for (const r of records) {
      if (!map[r.Entidad]) map[r.Entidad] = [];
      map[r.Entidad].push(r);
    }
    return Object.entries(map).sort((a,b) => b[1].length - a[1].length);
  }, [records]);

  // Utilidad para exportar los casos de una entidad a CSV (necesaria tanto en modo plano como agrupado)
  const exportEntidad = (ent: string, casos: CasoUsoCsvRecord[]) => {
    const csv = Papa.unparse(casos, { delimiter: ';' });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casos_${ent}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  // Layout plano si se pasa entidad o flat
  const flatMode = !!entidad || agrupado.length === 1 || false;
  const getEstadoColors = (estadoRaw: string) => {
    const estado = (estadoRaw || '').toLowerCase();
    if (/finalizado\s*-?\s*sin\s*uso/.test(estado)) return { badge: 'bg-red-100 text-red-700 border border-red-300', card: 'border-red-300 bg-red-50/70', icon: 'text-red-600' };
    if (/entregado\s*-?\s*sin\s*uso/.test(estado)) return { badge: 'bg-red-100 text-red-700 border border-red-300', card: 'border-red-300 bg-red-50/70', icon: 'text-red-600' };
    if (/deprecad/.test(estado)) return { badge: 'bg-red-100 text-red-700 border border-red-300', card: 'border-red-300 bg-red-50/70', icon: 'text-red-600' };
    return { badge: 'bg-slate-100 text-slate-700 border border-slate-200', card: 'border-slate-200 bg-slate-50/60', icon: 'text-slate-500' };
  };
  if (flatMode) {
    const casos = entidad ? records : agrupado[0][1];
    const noData = casos.length === 0;
    // Resumen de métricas (solo cuando hay datos)
    const summary = useMemo(() => {
      if (noData) return null;
      const total = casos.length;
      const estados = casos.reduce<Record<string, number>>((acc, c) => {
        const e = (c.Estado || 'N/D').trim();
        acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {});
      const etapas = casos.reduce<Record<string, number>>((acc, c) => {
        const e = (c.Etapa || 'N/D').trim();
        acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {});
      const impactoNivel = casos.reduce<Record<string, number>>((acc, c) => {
        const e = (c['Nivel Impacto Financiero'] || 'N/D').trim();
        acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {});
      // Parse numérico del impacto financiero
      const parseMonto = (v?: string) => {
        if (!v) return 0;
        // Eliminar símbolos, espacios y separar decimales (asumimos . como decimal si ambos . y , presentes)
        let s = v.replace(/[^0-9,.-]/g,'').trim();
        // Si tiene más de una coma y un punto, intentar dejar solo el separador decimal final
        if ((s.match(/,/g) || []).length > 1 && s.includes('.')) {
          // retirar separadores de miles comunes
          s = s.replace(/\./g,'').replace(/,/g,'.');
        } else if (s.includes('.') && s.includes(',')) {
          // heurística: si formato europeo (1.234,56)
          if (/\d+\.\d{3},\d+/.test(s)) {
            s = s.replace(/\./g,'').replace(/,/g,'.');
          } else if (/\d+,\d{3}\.\d+/.test(s)) { // formato US con coma miles y punto decimal
            s = s.replace(/,/g,'');
          }
        } else {
          // remover separadores de miles comunes
          s = s.replace(/,(?=\d{3}(?:\D|$))/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'');
        }
        const num = parseFloat(s);
        return isNaN(num) ? 0 : num;
      };
      let totalImpacto = 0;
      let conImpacto = 0;
      casos.forEach(c => {
        const val = parseMonto(c['Impacto Financiero']);
        if (val > 0) {
          totalImpacto += val;
          conImpacto++;
        }
      });
      const formatNumber = (n: number) => new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
      const activos = (estados['Activo'] || 0) + (estados['En producción'] || 0) + (estados['En Producción'] || 0);
      const enDesarrollo = (estados['En desarrollo'] || 0) + (estados['Desarrollo'] || 0);
      const pausados = (estados['Pausado'] || 0);
      const coberturaSponsor = casos.filter(c => !!c.Sponsor).length;
      const coberturaSandbox = casos.filter(c => (c.Sandbox || '').toLowerCase().includes('si') || (c.Sandbox || '').toLowerCase().includes('sí')).length;
      const conDS1 = casos.filter(c => !!c.DS1).length;
      const conDS2 = casos.filter(c => !!c.DS2).length;
      const conDE = casos.filter(c => !!c.DE).length;
      const topEtapas = Object.entries(etapas).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e.join(': ')).join(' | ');
      const topImpactoNivel = Object.entries(impactoNivel).sort((a,b)=>b[1]-a[1]).slice(0,2).map(e=>e.join(': ')).join(' | ');
      return {
        total,
        activos,
        enDesarrollo,
        pausados,
        porcentajeActivos: total ? Math.round((activos/total)*100) : 0,
        totalImpacto,
        conImpacto,
        promedioImpacto: conImpacto ? totalImpacto / conImpacto : 0,
        topEtapas,
        topImpactoNivel,
        coberturaSponsor,
        coberturaSandbox,
        conDS1, conDS2, conDE,
        estados,
      };
    }, [casos, noData]);

    const summaryCards = !noData && summary ? [
      { id:'total', label:'Total Casos', value: summary.total, icon: FolderKanban },
      { id:'impactoTotal', label:'Impacto Total', value: summary.totalImpacto ? `${new Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:1}).format(summary.totalImpacto)}` : '—', icon: DollarSign },
      { id:'impactoProm', label:'Impacto Promedio', value: summary.promedioImpacto ? new Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:1}).format(summary.promedioImpacto) : '—', icon: DollarSign },
      { id:'sponsor', label:'Con Sponsor', value: `${summary.coberturaSponsor}`, icon: Briefcase },
    ] : [];
    const fallbackCasos = [
      { id: 'churn', nombre: 'Churn Prediction', descripcion: 'Predicción de abandono de clientes', icono: TrendingDown },
      { id: 'tc', nombre: 'Top Customers', descripcion: 'Identificación de mejores clientes', icono: Target },
      { id: 'nba', nombre: 'Next Best Action', descripcion: 'Orquestación próxima mejor acción', icono: Zap },
      { id: 'aumento-uso', nombre: 'Aumento de Uso', descripcion: 'Incremento y reactivación de uso de productos', icono: BarChart3 },
    ];
    return (
      <div className="space-y-4">
        {!entidad && (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Casos de Uso</h2>
            {!noData && (
              <Button variant="outline" size="sm" onClick={() => exportEntidad(agrupado[0][0], casos)}> <Download className="w-4 h-4 mr-1" /> Exportar CSV</Button>
            )}
          </div>
        )}
        {noData && (
          <div className="rounded-md border p-4 text-sm space-y-2 bg-muted/30">
            <p className="font-medium">Esta entidad aún no tiene casos cargados desde el CSV.</p>
            <p className="text-muted-foreground">Puedes explorar casos estándar disponibles y abrir sus métricas de referencia.</p>
          </div>
        )}
        {!noData && summary && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {summaryCards.map(card => {
              const Icon = card.icon as any;
              return (
                <div key={card.id} className="border rounded-md p-3 flex flex-col bg-background/60 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</span>
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-base font-semibold leading-tight line-clamp-2" title={String(card.value)}>{card.value}</div>
                </div>
              );
            })}
          </div>
        )}
        {!noData && summary && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Estados</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
              {Object.entries(summary.estados).map(([estado, val]) => {
                const pct = summary.total ? Math.round((val/summary.total)*100) : 0;
                const estadoKey = estado.toLowerCase();
                const Icon = estadoKey.includes('paus') ? PauseCircle : estadoKey.includes('desar') ? Activity : (estadoKey.includes('prod') || estadoKey.includes('activo')) ? CheckCircle2 : Activity;
                const colors = getEstadoColors(estado);
                return (
                  <div key={estado} className={`rounded-md p-3 flex flex-col ${colors.card}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium truncate" title={estado}>{estado}</span>
                      <Icon className={`w-4 h-4 ${colors.icon}`} />
                    </div>
                    <div className="text-sm font-semibold">{val}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{pct}% del total</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {!noData && casos.map(caso => {
            const kpis = buildKpis(caso).slice(0,3);
            const tipo = classifyCasoTipo(caso);
            return (
              <Card key={`${caso.Entidad}-${caso.Proyecto}-${caso.PROJECT_ID}`} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-sm line-clamp-2" title={caso.Proyecto}>{caso.Proyecto}</CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {kpis.map(k => {
                      if (k.id === 'estado') {
                        const c = getEstadoColors(k.value);
                        return <span key={k.id} className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${c.badge}`}>{k.value}</span>;
                      }
                      return <Badge key={k.id} variant={k.variant as any} className="text-[10px] font-normal">{k.label}: {k.value}</Badge>;
                    })}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 grow">
                  <ScrollArea className="h-20 pr-2 text-xs leading-relaxed">
                    <p className="whitespace-pre-wrap break-words">{(caso.Observaciones || '').slice(0,600) || 'Sin observaciones'}</p>
                  </ScrollArea>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {caso['Sharepoint Link'] && (
                      <Button asChild variant="outline" size="sm" className="h-6 px-2 text-[10px]">
                        <a href={caso['Sharepoint Link']} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 mr-1" />Sharepoint</a>
                      </Button>
                    )}
                    {caso['Jira Link'] && (
                      <Button asChild variant="outline" size="sm" className="h-6 px-2 text-[10px]">
                        <a href={caso['Jira Link']} target="_blank" rel="noopener noreferrer">Jira</a>
                      </Button>
                    )}
                    {caso['Confluence Link'] && (
                      <Button asChild variant="outline" size="sm" className="h-6 px-2 text-[10px]">
                        <a href={caso['Confluence Link']} target="_blank" rel="noopener noreferrer">Confluence</a>
                      </Button>
                    )}
                    {onSelectCaso && (
                      <Button size="sm" variant="ghost" className="ml-auto h-6 px-2 text-[10px]" onClick={() => onSelectCaso(tipo, caso.Proyecto)}>
                        Ver métricas <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {noData && fallbackCasos.map(f => {
            const Icon = f.icono;
            return (
              <Card key={f.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-sm" title={f.nombre}>{f.nombre}</CardTitle>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-[10px]">Disponible</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 grow">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="w-4 h-4 text-primary" />
                    <span>{f.descripcion}</span>
                  </div>
                  <div className="mt-auto flex justify-end">
                    {onSelectCaso && (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => onSelectCaso(f.id, f.nombre)}>
                        Ver métricas <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback agrupado (multi-entidad)
    const renderGrid = (casos: CasoUsoCsvRecord[], ent?: string) => (
      <div className="space-y-3" key={ent || 'grid'}>
        {(!entidad || !flat) && ent && (
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> {ent}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{casos.length} casos</Badge>
              <Button size="sm" variant="outline" onClick={() => exportEntidad(ent, casos)}><Download className="w-4 h-4 mr-1" />CSV</Button>
            </div>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {casos.map(caso => {
            const kpis = buildKpis(caso).slice(0,3);
            const tipo = classifyCasoTipo(caso);
            return (
              <Card key={`${caso.Entidad}-${caso.Proyecto}-${caso.PROJECT_ID}`} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-sm line-clamp-2" title={caso.Proyecto}>{caso.Proyecto}</CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {kpis.map(k => (
                      <Badge key={k.id} variant={k.variant as any} className="text-[10px] font-normal">{k.label}: {k.value}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 grow">
                  <ScrollArea className="h-20 pr-2 text-xs leading-relaxed">
                    <p className="whitespace-pre-wrap break-words">{(caso.Observaciones || '').slice(0,600) || 'Sin observaciones'}</p>
                  </ScrollArea>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {caso['Sharepoint Link'] && (
                      <Button asChild variant="outline" size="sm" className="h-6 px-2 text-[10px]">
                        <a href={caso['Sharepoint Link']} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 mr-1" />Sharepoint</a>
                      </Button>
                    )}
                    {caso['Jira Link'] && (
                      <Button asChild variant="outline" size="sm" className="h-6 px-2 text-[10px]">
                        <a href={caso['Jira Link']} target="_blank" rel="noopener noreferrer">Jira</a>
                      </Button>
                    )}
                    {caso['Confluence Link'] && (
                      <Button asChild variant="outline" size="sm" className="h-6 px-2 text-[10px]">
                        <a href={caso['Confluence Link']} target="_blank" rel="noopener noreferrer">Confluence</a>
                      </Button>
                    )}
              {onSelectCaso && (
                <Button size="sm" variant="ghost" className="ml-auto h-6 px-2 text-[10px]" onClick={() => onSelectCaso(tipo, caso.Proyecto)}>
                        Ver métricas <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );

    const single = agrupado.length === 1;

    if (flat && single) {
      const [ent, casos] = agrupado[0];
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Casos de Uso</h2>
            <Button size="sm" variant="outline" onClick={() => exportEntidad(ent, casos)}><Download className="w-4 h-4 mr-1" />CSV</Button>
          </div>
          {renderGrid(casos, ent)}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {!entidad && (
          <div>
            <h2 className="text-xl font-semibold">Casos de Uso por Entidad</h2>
            <p className="text-sm text-muted-foreground">Fuente: CSV público (actualizado manualmente).</p>
          </div>
        )}
        <Accordion type="multiple" className="space-y-4" defaultValue={agrupado.map(([e]) => e)}>
          {agrupado.map(([ent, casos]) => (
            <AccordionItem key={ent} value={ent} className="border rounded-lg px-4">
              <AccordionTrigger className="py-4 text-left">
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" /> {ent}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{casos.length} casos</Badge>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); exportEntidad(ent, casos); }}> <Download className="w-4 h-4 mr-1" /> CSV</Button>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">Resumen de proyectos y estado actual</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {renderGrid(casos, ent)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
};

export default CasosUsoEntidad;
