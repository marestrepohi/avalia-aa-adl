import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, TrendingDown, Target, Zap, BarChart3, Building2, DollarSign, FolderKanban, Briefcase, Users, CheckCircle2, Activity, PauseCircle, ExternalLink, Calendar, User } from 'lucide-react';
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

  const handleCasoClick = (casoId: string, titulo?: string) => {
    setSelectedCaso(casoId);
    if (titulo) setSelectedCasoTitulo(titulo);
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
      <div className="space-y-4">
        <div className="flex items-center space-x-4 p-6 pb-0">
          <Button variant="ghost" onClick={() => { setSelectedCaso(null); setSelectedCasoTitulo(null); }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a {entidad.id_nombre}
          </Button>
        </div>
        <CasoUso tipo={selectedCaso as any} displayTitle={selectedCasoTitulo || undefined} />
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
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={handleBackClick}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center p-2 border shadow-sm"
            style={{ backgroundColor: '#ffffff' }}
          >
            {entidad.logo_url ? (
              <img 
                src={entidad.logo_url} 
                alt={`Logo ${entidad.id_nombre}`}
                className="w-full h-full object-contain brightness-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = 'flex';
                }}
              />
            ) : null}
            <Building2 
              className="w-6 h-6 text-black" 
              style={{ 
                display: entidad.logo_url ? 'none' : 'flex'
              }} 
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{entidad.id_nombre}</h1>
            <p className="text-muted-foreground">{entidad.descripcion}</p>
          </div>
        </div>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Casos</p>
                <p className="text-2xl font-bold">{metricas.total}</p>
              </div>
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Casos Activos</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{metricas.activos}</p>
                  <Badge variant="secondary" className="text-xs">
                    {metricas.porcentajeActivos}%
                  </Badge>
                </div>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Desarrollo</p>
                <p className="text-2xl font-bold">{metricas.enDesarrollo}</p>
              </div>
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Científicos</p>
                <p className="text-2xl font-bold">{metricas.cientificos}</p>
              </div>
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Casos de Uso */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Casos de Uso</h2>
        
        {casosUso.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay casos de uso disponibles</h3>
              <p className="text-muted-foreground mb-4">
                Esta entidad aún no tiene casos de uso registrados en el sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {casosUso.map((caso, index) => {
              const estadoBadge = getEstadoBadge(caso.Estado || '');
              const CasoIcon = getCasoIcon(caso.Proyecto || '');
              const tipo = classifyCasoTipo(caso.Proyecto || '');

              return (
                <Card key={`${caso.PROJECT_ID}-${index}`} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                      onClick={() => handleCasoClick(tipo, caso.Proyecto)}>
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <CasoIcon className="h-5 w-5 text-primary" />
                        <Badge className={estadoBadge.color} variant="outline">
                          {estadoBadge.label}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-base line-clamp-2 min-h-[2.5rem]" title={caso.Proyecto}>
                      {caso.Proyecto}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Información básica */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Etapa</p>
                        <p className="font-medium truncate">{caso.Etapa || 'N/D'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Proyecto ID</p>
                        <p className="font-medium">{caso.PROJECT_ID || 'N/D'}</p>
                      </div>
                    </div>

                    {/* Equipo */}
                    {(caso.DS1 || caso.DS2 || caso.DE) && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Equipo</p>
                        <div className="flex flex-wrap gap-1">
                          {caso.DS1 && (
                            <Badge variant="secondary" className="text-xs">DS1: {caso.DS1}</Badge>
                          )}
                          {caso.DS2 && (
                            <Badge variant="secondary" className="text-xs">DS2: {caso.DS2}</Badge>
                          )}
                          {caso.DE && (
                            <Badge variant="secondary" className="text-xs">DE: {caso.DE}</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Impacto Financiero */}
                    {caso['Impacto Financiero'] && !caso['Impacto Financiero'].toLowerCase().includes('dimensionamiento') && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Impacto Financiero</p>
                        <p className="text-sm font-semibold text-green-600">
                          {caso['Impacto Financiero']} {caso['Unidad del Impacto Financiero'] || ''}
                        </p>
                        {caso['Nivel Impacto Financiero'] && (
                          <Badge variant="outline" className="text-xs">
                            {caso['Nivel Impacto Financiero']}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Observaciones */}
                    {caso.Observaciones && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                        <ScrollArea className="h-16">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {caso.Observaciones.slice(0, 150)}
                            {caso.Observaciones.length > 150 && '...'}
                          </p>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Fechas */}
                    {(caso['Fecha de Inicio'] || caso['Fecha de Entrega']) && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {caso['Fecha de Inicio'] && (
                          <div>
                            <p className="text-muted-foreground">Inicio</p>
                            <p className="font-medium">{caso['Fecha de Inicio']}</p>
                          </div>
                        )}
                        {caso['Fecha de Entrega'] && (
                          <div>
                            <p className="text-muted-foreground">Entrega</p>
                            <p className="font-medium">{caso['Fecha de Entrega']}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Enlaces */}
                    <div className="flex flex-wrap gap-1 pt-2 border-t">
                      {caso['Sharepoint Link'] && (
                        <Button asChild variant="outline" size="sm" className="h-6 px-2 text-xs">
                          <a href={caso['Sharepoint Link']} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="w-3 h-3 mr-1" />SharePoint
                          </a>
                        </Button>
                      )}
                      {caso['Jira Link'] && (
                        <Button asChild variant="outline" size="sm" className="h-6 px-2 text-xs">
                          <a href={caso['Jira Link']} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="w-3 h-3 mr-1" />Jira
                          </a>
                        </Button>
                      )}
                      {caso['Confluence Link'] && (
                        <Button asChild variant="outline" size="sm" className="h-6 px-2 text-xs">
                          <a href={caso['Confluence Link']} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="w-3 h-3 mr-1" />Confluence
                          </a>
                        </Button>
                      )}
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