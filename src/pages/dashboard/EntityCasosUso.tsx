import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, TrendingDown, Target, Zap, BarChart3, Building2, DollarSign, FolderKanban, Briefcase, Users, CheckCircle2, Activity, PauseCircle, ExternalLink, Calendar, User, AlertCircle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import CasoUso from '@/components/casos-uso/CasoUso';
import Papa from 'papaparse';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Entidad {
  id_nombre: string;
  descripcion: string;
  logo_url: string;
  color: string;
}

interface CasoUsoCSV {
  Entidad: string;
  Proyecto: string;
  Etapa: string;
  Estado: string;
  Subtarea?: string;
  PROJECT_ID?: string;
  'Tipo Proyecto'?: string;
  DS1?: string;
  DS2?: string;
  DE?: string;
  MDS?: string;
  Maintance?: string;
  Tallaje?: string;
  Observaciones?: string;
  'Fecha de Inicio'?: string;
  'Fecha de Entrega'?: string;
  Mantenimiento?: string;
  'DS Entidad'?: string;
  'Nivel Impacto Financiero'?: string;
  'Unidad del Impacto Financiero'?: string;
  'Impacto Financiero'?: string;
  'Financiero Aval Digital Labs'?: string;
  'Financiero Entidad'?: string;
  Sponsor?: string;
  'Main Contact'?: string;
  Sandbox?: string;
  'Sharepoint Link'?: string;
  'Sharepoint Actividades'?: string;
  'Jira Link'?: string;
  'Confluence Link'?: string;
}

const EntityCasosUso = () => {
  const { setActiveView } = useDashboard();
  const [entidad, setEntidad] = useState<Entidad | null>(null);
  const [casosUso, setCasosUso] = useState<CasoUsoCSV[]>([]);
  const [selectedCaso, setSelectedCaso] = useState<string | null>(null);
  const [selectedCasoTitulo, setSelectedCasoTitulo] = useState<string | null>(null);
  const [selectedCasoRecord, setSelectedCasoRecord] = useState<CasoUsoCSV | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selectedEntityData = localStorage.getItem('selectedEntity');
    if (selectedEntityData) {
      const entidadData = JSON.parse(selectedEntityData);
      setEntidad(entidadData);
      loadCasosUso(entidadData.id_nombre);
    }
  }, []);

  const loadCasosUso = async (entidadNombre: string) => {
    try {
      setLoading(true);
      const response = await fetch('/casos_uso.csv');
      const csvText = await response.text();
      
      Papa.parse<CasoUsoCSV>(csvText, {
        header: true,
        delimiter: ';',
        skipEmptyLines: 'greedy',
        transformHeader: (h) => h.replace(/\uFEFF/g, '').trim(),
        transform: (value) => typeof value === 'string' ? value.trim() : value,
        complete: (results) => {
          const allCasos = results.data || [];
          const entidadCasos = allCasos.filter(caso => 
            caso.Entidad && caso.Entidad.trim() === entidadNombre
          );
          setCasosUso(entidadCasos);
          setLoading(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error loading CSV:', error);
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setActiveView('casosUso');
  };

  const handleCasoClick = (casoId: string, titulo?: string, record?: CasoUsoCSV) => {
    setSelectedCaso(casoId);
    if (titulo) setSelectedCasoTitulo(titulo);
    if (record) setSelectedCasoRecord(record);
  };

  const getEstadoBadge = (estado: string) => {
    const estadoLower = estado?.toLowerCase() || '';
    if (estadoLower.includes('entregado') && estadoLower.includes('con uso')) {
      return { variant: 'default' as const, label: 'Activo', color: 'bg-green-100 text-green-700 border-green-300' };
    }
    if (estadoLower.includes('finalizado') && estadoLower.includes('con uso')) {
      return { variant: 'default' as const, label: 'Activo', color: 'bg-green-100 text-green-700 border-green-300' };
    }
    if (estadoLower.includes('desarrollo') || estadoLower.includes('pilotaje')) {
      return { variant: 'secondary' as const, label: 'En Desarrollo', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    }
    if (estadoLower.includes('deprecado') || (estadoLower.includes('sin uso'))) {
      return { variant: 'destructive' as const, label: 'Inactivo', color: 'bg-red-100 text-red-700 border-red-300' };
    }
    return { variant: 'outline' as const, label: estado || 'N/D', color: 'bg-gray-100 text-gray-700 border-gray-300' };
  };

  const getCasoIcon = (proyecto: string) => {
    const proyectoLower = proyecto?.toLowerCase() || '';
    if (proyectoLower.includes('churn')) return TrendingDown;
    if (proyectoLower.includes('top') || proyectoLower.includes('customer')) return Target;
    if (proyectoLower.includes('next') || proyectoLower.includes('action') || proyectoLower.includes('nba')) return Zap;
    if (proyectoLower.includes('aumento') || proyectoLower.includes('uso')) return BarChart3;
    return Brain;
  };

  const classifyCasoTipo = (proyecto: string): string => {
    const proyectoLower = proyecto?.toLowerCase() || '';
    if (proyectoLower.includes('churn')) return 'churn';
    if (proyectoLower.includes('top') || proyectoLower.includes('customer')) return 'tc';
    if (proyectoLower.includes('next') || proyectoLower.includes('action') || proyectoLower.includes('nba')) return 'nba';
    if (proyectoLower.includes('aumento') || proyectoLower.includes('uso')) return 'aumento-uso';
    return 'generico';
  };

  const getMetricasResumen = () => {
    const total = casosUso.length;
    const activos = casosUso.filter(caso => {
      const estado = caso.Estado?.toLowerCase() || '';
      return (estado.includes('entregado') && estado.includes('con uso')) || 
             (estado.includes('finalizado') && estado.includes('con uso'));
    }).length;
    
    const enDesarrollo = casosUso.filter(caso => {
      const estado = caso.Estado?.toLowerCase() || '';
      return estado.includes('desarrollo') || estado.includes('pilotaje');
    }).length;

    const inactivos = casosUso.filter(caso => {
      const estado = caso.Estado?.toLowerCase() || '';
      return estado.includes('deprecado') || estado.includes('sin uso');
    }).length;

    const cientificos = new Set();
    casosUso.forEach(caso => {
      if (caso.DS1) cientificos.add(caso.DS1);
      if (caso.DS2) cientificos.add(caso.DS2);
    });

    const conImpacto = casosUso.filter(caso => 
      caso['Impacto Financiero'] && 
      caso['Impacto Financiero'] !== '' && 
      !caso['Impacto Financiero'].toLowerCase().includes('dimensionamiento')
    ).length;

    return {
      total,
      activos,
      enDesarrollo,
      inactivos,
      cientificos: cientificos.size,
      conImpacto,
      porcentajeActivos: total > 0 ? Math.round((activos / total) * 100) : 0
    };
  };

  if (!entidad) {
    return (
      <div className="p-6 text-center">
        <p>No se encontró información de la entidad</p>
        <Button onClick={handleBackClick} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  if (selectedCaso) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => { setSelectedCaso(null); setSelectedCasoTitulo(null); setSelectedCasoRecord(null); }} className="p-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a {entidad?.id_nombre}
          </Button>
          
          {selectedCasoTitulo && (
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {selectedCasoTitulo}
                </h1>
                <p className="text-muted-foreground text-lg">Métricas y análisis del caso de uso</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* SharePoint */}
                {selectedCasoRecord?.['Sharepoint Link'] ? (
                  <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs hover:bg-blue-50 hover:border-blue-300">
                    <a href={selectedCasoRecord['Sharepoint Link']} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1.5" />SharePoint
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs" disabled>
                    <ExternalLink className="w-3 h-3 mr-1.5" />SharePoint
                  </Button>
                )}
                {/* Jira */}
                {selectedCasoRecord?.['Jira Link'] ? (
                  <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs hover:bg-indigo-50 hover:border-indigo-300">
                    <a href={selectedCasoRecord['Jira Link']} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1.5" />Jira
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs" disabled>
                    <ExternalLink className="w-3 h-3 mr-1.5" />Jira
                  </Button>
                )}
                {/* Confluence */}
                {selectedCasoRecord?.['Confluence Link'] ? (
                  <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs hover:bg-purple-50 hover:border-purple-300">
                    <a href={selectedCasoRecord['Confluence Link']} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1.5" />Confluence
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs" disabled>
                    <ExternalLink className="w-3 h-3 mr-1.5" />Confluence
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
  <CasoUso tipo={selectedCaso as any} displayTitle={selectedCasoTitulo || undefined} csvRecord={selectedCasoRecord as any} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-48"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metricas = getMetricasResumen();

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBackClick} className="p-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Casos de Uso
        </Button>
        
        <div className="flex items-center space-x-4">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center p-3 border shadow-sm bg-gradient-to-br from-background to-muted/50"
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
              className="w-8 h-8 text-black" 
              style={{ 
                display: entidad.logo_url ? 'none' : 'flex'
              }} 
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {entidad.id_nombre}
            </h1>
            <p className="text-muted-foreground text-lg">{entidad.descripcion}</p>
          </div>
        </div>
      </div>

  {/* Métricas Resumen */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 dark:from-blue-950/50 dark:to-blue-900/30 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Casos</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{metricas.total}</p>
                <p className="text-xs text-blue-600/70 mt-1">Proyectos registrados</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 dark:from-green-950/50 dark:to-green-900/30 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Casos Activos</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{metricas.activos}</p>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-300">
                    {metricas.porcentajeActivos}%
                  </Badge>
                </div>
                <p className="text-xs text-green-600/70 mt-1">En producción activa</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 dark:from-orange-950/50 dark:to-orange-900/30 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">En Desarrollo</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{metricas.enDesarrollo}</p>
                <p className="text-xs text-orange-600/70 mt-1">Proyectos en curso</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 dark:from-red-950/50 dark:to-red-900/30 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Casos Inactivos</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">{metricas.inactivos}</p>
                <p className="text-xs text-red-600/70 mt-1">Deprecados o sin uso</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 dark:from-purple-950/50 dark:to-purple-900/30 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Científicos</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{metricas.cientificos}</p>
                <p className="text-xs text-purple-600/70 mt-1">Equipo asignado</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Casos de Uso */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Casos de Uso</h2>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {casosUso.length} {casosUso.length === 1 ? 'caso' : 'casos'}
          </Badge>
        </div>
        
        {casosUso.length === 0 ? (
          <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-dashed border-2">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No hay casos de uso disponibles</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Esta entidad aún no tiene casos de uso registrados en el sistema. Los casos aparecerán aquí una vez que sean agregados.
              </p>
              <Badge variant="secondary" className="px-4 py-2">
                Próximamente disponible
              </Badge>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {casosUso.map((caso, index) => {
              const estadoBadge = getEstadoBadge(caso.Estado || '');
              const CasoIcon = getCasoIcon(caso.Proyecto || '');
              const tipo = classifyCasoTipo(caso.Proyecto || '');

              return (
                <Card 
                  key={`${caso.PROJECT_ID}-${index}`} 
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-gradient-to-br from-background via-background to-muted/20 hover:scale-[1.02] hover:shadow-2xl"
                  onClick={() => handleCasoClick(tipo, caso.Proyecto, caso)}
                >
                  <CardHeader className="space-y-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <CasoIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Badge className={`${estadoBadge.color} shadow-sm`} variant="outline">
                            {estadoBadge.label}
                          </Badge>
                        </div>
                      </div>
                      {caso.PROJECT_ID && (
                        <Badge variant="secondary" className="text-xs font-mono bg-muted/60">
                          #{caso.PROJECT_ID}
                        </Badge>
                      )}
                    </div>
                    
                    <CardTitle className="text-lg font-bold line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors leading-tight" title={caso.Proyecto}>
                      {caso.Proyecto}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 pt-0">
                    {/* Información básica mejorada */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Etapa</p>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <p className="font-medium text-sm truncate">{caso.Etapa || 'N/D'}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</p>
                        <p className="font-medium text-sm truncate">{caso['Tipo Proyecto'] || 'Caso de Uso'}</p>
                      </div>
                    </div>

                    {/* Equipo mejorado */}
                    {(caso.DS1 || caso.DS2 || caso.DE) && (
                      <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-primary" />
                          <p className="text-sm font-semibold text-muted-foreground">Equipo Asignado</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {caso.DS1 && (
                            <div className="flex items-center space-x-2 text-xs">
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                DS Principal
                              </Badge>
                              <span className="font-medium">{caso.DS1}</span>
                            </div>
                          )}
                          {caso.DS2 && (
                            <div className="flex items-center space-x-2 text-xs">
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-300">
                                DS Apoyo
                              </Badge>
                              <span className="font-medium">{caso.DS2}</span>
                            </div>
                          )}
                          {caso.DE && (
                            <div className="flex items-center space-x-2 text-xs">
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                                Ingeniero
                              </Badge>
                              <span className="font-medium">{caso.DE}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Impacto Financiero mejorado */}
                    {caso['Impacto Financiero'] && !caso['Impacto Financiero'].toLowerCase().includes('dimensionamiento') && (
                      <div className="space-y-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-semibold text-green-800 dark:text-green-200">Impacto Financiero</p>
                        </div>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">
                          {caso['Impacto Financiero']} {caso['Unidad del Impacto Financiero'] || ''}
                        </p>
                        {caso['Nivel Impacto Financiero'] && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                            Nivel: {caso['Nivel Impacto Financiero']}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Fechas mejoradas */}
                    {(caso['Fecha de Inicio'] || caso['Fecha de Entrega']) && (
                      <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cronograma</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {caso['Fecha de Inicio'] && (
                            <div className="space-y-1">
                              <p className="text-muted-foreground font-medium">Inicio</p>
                              <p className="font-semibold bg-white dark:bg-slate-800 px-2 py-1 rounded border">{caso['Fecha de Inicio']}</p>
                            </div>
                          )}
                          {caso['Fecha de Entrega'] && (
                            <div className="space-y-1">
                              <p className="text-muted-foreground font-medium">Entrega</p>
                              <p className="font-semibold bg-white dark:bg-slate-800 px-2 py-1 rounded border">{caso['Fecha de Entrega']}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Observaciones mejoradas */}
                    {caso.Observaciones && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">Notas del Proyecto</p>
                        <ScrollArea className="h-20 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                            {caso.Observaciones.slice(0, 200)}
                            {caso.Observaciones.length > 200 && '...'}
                          </p>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Enlaces mejorados */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-muted/50">
                      {caso['Sharepoint Link'] && (
                        <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors">
                          <a href={caso['Sharepoint Link']} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="w-3 h-3 mr-1.5" />SharePoint
                          </a>
                        </Button>
                      )}
                      {caso['Jira Link'] && (
                        <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                          <a href={caso['Jira Link']} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="w-3 h-3 mr-1.5" />Jira
                          </a>
                        </Button>
                      )}
                      {caso['Confluence Link'] && (
                        <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs hover:bg-purple-50 hover:border-purple-300 transition-colors">
                          <a href={caso['Confluence Link']} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="w-3 h-3 mr-1.5" />Confluence
                          </a>
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="sm" className="ml-auto h-8 px-3 text-xs bg-primary/5 hover:bg-primary/10 text-primary font-medium">
                        Ver Métricas →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityCasosUso;