import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, TrendingDown, Target, Zap, BarChart3, Building2, DollarSign, FolderKanban, Briefcase, Users, CheckCircle2, Activity, PauseCircle, ExternalLink, Calendar, User, AlertCircle, Network } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import CasoUso from '@/components/casos-uso/CasoUso';
import Papa from 'papaparse';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import TechnicalMetricsBacktesting from '@/components/ui/dashboard/TechnicalMetricsBacktesting';

interface Entidad {
  id: string;
  id_nombre: string;
  casos: number;
  estado: { implementados: number; total: number };
  cobertura: number;
  roi: number;
}

interface CasoUsoCSV {
  PROJECT_ID?: string;
  Proyecto?: string;
  Estado?: string;
  'Tipo Proyecto'?: string;
  Etapa?: string;
  'DS1'?: string;
  'DS2'?: string;
  'DE'?: string;
  'Inicio Proyecto'?: string;
  'Fin Proyecto'?: string;
  'Sharepoint Link'?: string;
  'Jira Link'?: string;
  'Confluence Link'?: string;
  'Duración estimada (meses)'?: number;
  'Meses Invertidos'?: number;
  entidad?: string;
  kpi1?: string;
  kpi2?: string;
  observaciones?: string;
  // ... otros campos
}

interface EntityCasosUsoProps {
  entidad: Entidad;
  onSelectCaso?: (tipo: string, titulo?: string) => void;
}

const EntityCasosUso: React.FC<EntityCasosUsoProps> = ({ entidad, onSelectCaso }) => {
  const { } = useDashboard();
  const [casosUso, setCasosUso] = useState<CasoUsoCSV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para casos específicos
  const [casoSeleccionado, setCasoSeleccionado] = useState<string | null>(null);
  const [casoRecord, setCasoRecord] = useState<CasoUsoCSV | null>(null);
  const [showBusinessMetrics, setShowBusinessMetrics] = useState(false);
  const [showTechnicalMetrics, setShowTechnicalMetrics] = useState(false);

  useEffect(() => {
    const loadCasosUso = async () => {
      try {
        const response = await fetch('/casos_uso.csv');
        const csvText = await response.text();
        
        Papa.parse<CasoUsoCSV>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const filteredData = results.data.filter(row => {
              const proyectoEntidad = row.entidad?.toLowerCase().trim();
              const entidadName = entidad.id_nombre.toLowerCase().trim();
              return proyectoEntidad === entidadName;
            });
            
            setCasosUso(filteredData);
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setError('Error al cargar los casos de uso');
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('Error loading CSV:', err);
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    loadCasosUso();
  }, [entidad]);

  const handleBack = () => {
    // Navigate back logic can be implemented here
    window.history.back();
  };

  // Función para obtener el badge de estado
  const getEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'implementado':
        return { label: 'Implementado', color: 'bg-green-100 text-green-700 border-green-300' };
      case 'en desarrollo':
        return { label: 'En Desarrollo', color: 'bg-blue-100 text-blue-700 border-blue-300' };
      case 'en pausa':
        return { label: 'En Pausa', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
      case 'cancelado':
        return { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-300' };
      case 'por implementar':
        return { label: 'Por Implementar', color: 'bg-gray-100 text-gray-700 border-gray-300' };
      default:
        return { label: 'Sin Estado', color: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
  };

  // Función para obtener el icono del caso
  const getCasoIcon = (proyecto: string) => {
    const proyectoLower = proyecto?.toLowerCase() || '';
    
    if (proyectoLower.includes('churn') || proyectoLower.includes('abandono')) {
      return TrendingDown;
    }
    if (proyectoLower.includes('next best') || proyectoLower.includes('recomend')) {
      return Target;
    }
    if (proyectoLower.includes('aumento') || proyectoLower.includes('incremento')) {
      return Zap;
    }
    if (proyectoLower.includes('análisis') || proyectoLower.includes('analisis')) {
      return BarChart3;
    }
    if (proyectoLower.includes('red') || proyectoLower.includes('flujo')) {
      return Network;
    }
    
    return FolderKanban; // Icono por defecto
  };

  // Función para clasificar el tipo de caso
  const classifyCasoTipo = (proyecto: string) => {
    const proyectoLower = proyecto?.toLowerCase() || '';
    
    if (proyectoLower.includes('redes') && proyectoLower.includes('dinero')) {
      return 'redes-flujos-dinero';
    }
    
    if (proyectoLower.includes('cobranzas') && proyectoLower.includes('cartera') && proyectoLower.includes('castigada')) {
      return 'cobranzas-cartera-castigada';
    }
    
    if (proyectoLower.includes('churn')) {
      return 'churn';
    }
    if (proyectoLower.includes('next best')) {
      return 'next-best-action';
    }
    if (proyectoLower.includes('aumento')) {
      return 'aumento-uso';
    }
    
    return 'generico';
  };

  // Calcular métricas del resumen
  const summary = React.useMemo(() => {
    const total = casosUso.length;
    const implementados = casosUso.filter(caso => caso.Estado?.toLowerCase() === 'implementado').length;
    const enDesarrollo = casosUso.filter(caso => caso.Estado?.toLowerCase() === 'en desarrollo').length;
    const enPausa = casosUso.filter(caso => caso.Estado?.toLowerCase() === 'en pausa').length;
    const porImplementar = casosUso.filter(caso => caso.Estado?.toLowerCase() === 'por implementar').length;

    return {
      total,
      implementados,
      enDesarrollo,
      enPausa,
      porImplementar,
      porcentajeImplementados: total > 0 ? Math.round((implementados / total) * 100) : 0,
      porcentajeEnDesarrollo: total > 0 ? Math.round((enDesarrollo / total) * 100) : 0
    };
  }, [casosUso]);

  // Manejar casos específicos
  const handleCasoClick = (tipo: string, titulo?: string, record?: CasoUsoCSV) => {
    if (tipo === 'redes-flujos-dinero') {
      setCasoSeleccionado(titulo || tipo);
      setCasoRecord(record || null);
      setShowBusinessMetrics(true);
    } else if (tipo === 'cobranzas-cartera-castigada') {
      setCasoSeleccionado(titulo || tipo);
      setCasoRecord(record || null);
      setShowTechnicalMetrics(true);
    } else {
      onSelectCaso?.(tipo, titulo);
    }
  };

  const onBack = () => {
    setShowBusinessMetrics(false);
    setShowTechnicalMetrics(false);
    setCasoSeleccionado(null);
    setCasoRecord(null);
  };

  // Si está en vista de métricas de negocio
  if (showBusinessMetrics && casoSeleccionado) {
    return (
      <RedesFlujosDineroView 
        entidad={entidad}
        casoTitulo={casoSeleccionado}
        casoRecord={casoRecord}
        onBack={onBack}
      />
    );
  }

  // Si está en vista de métricas técnicas
  if (showTechnicalMetrics && casoSeleccionado) {
    return (
      <CobranzasCarteraCastigadaView 
        entidad={entidad}
        casoTitulo={casoSeleccionado}
        casoRecord={casoRecord}
        onBack={onBack}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando casos de uso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Error al cargar datos</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header con botón de volver */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Button>
      </div>

      {/* Header de la entidad */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {entidad.id_nombre}
          </h1>
          <p className="text-muted-foreground text-lg">Casos de uso y proyectos de la entidad</p>
        </div>

        {/* Cards de resumen mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Casos</p>
                  <p className="text-2xl font-bold text-blue-900">{summary.total}</p>
                </div>
                <FolderKanban className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Implementados</p>
                  <p className="text-2xl font-bold text-green-900">{summary.implementados}</p>
                  <p className="text-xs text-green-600">{summary.porcentajeImplementados}% del total</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">En Desarrollo</p>
                  <p className="text-2xl font-bold text-blue-900">{summary.enDesarrollo}</p>
                  <p className="text-xs text-blue-600">{summary.porcentajeEnDesarrollo}% del total</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">En Pausa</p>
                  <p className="text-2xl font-bold text-yellow-900">{summary.enPausa}</p>
                </div>
                <PauseCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Por Implementar</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.porImplementar}</p>
                </div>
                <Users className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de casos de uso */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Casos de Uso</h2>
          <Badge variant="secondary" className="px-3 py-1">
            {casosUso.length} casos encontrados
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
                              <span className="font-medium truncate">{caso.DS1}</span>
                            </div>
                          )}
                          {caso.DS2 && (
                            <div className="flex items-center space-x-2 text-xs">
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-300">
                                DS Apoyo
                              </Badge>
                              <span className="font-medium truncate">{caso.DS2}</span>
                            </div>
                          )}
                          {caso.DE && (
                            <div className="flex items-center space-x-2 text-xs">
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                                DE
                              </Badge>
                              <span className="font-medium truncate">{caso.DE}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fechas mejoradas */}
                    {(caso['Inicio Proyecto'] || caso['Fin Proyecto']) && (
                      <div className="space-y-2 p-3 bg-accent/5 rounded-lg border border-accent/20">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-accent-foreground" />
                          <p className="text-sm font-semibold text-accent-foreground">Cronograma</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                          {caso['Inicio Proyecto'] && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Inicio:</span>
                              <span className="font-medium">{caso['Inicio Proyecto']}</span>
                            </div>
                          )}
                          {caso['Fin Proyecto'] && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fin:</span>
                              <span className="font-medium">{caso['Fin Proyecto']}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Progreso mejorado */}
                    {(caso['Duración estimada (meses)'] || caso['Meses Invertidos']) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="font-medium">
                            {caso['Meses Invertidos'] || 0} / {caso['Duración estimada (meses)'] || 0} meses
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(100, ((caso['Meses Invertidos'] || 0) / (caso['Duración estimada (meses)'] || 1)) * 100)}%` 
                            }}
                          />
                        </div>
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

// Componente específico para Redes flujos de Dinero
const RedesFlujosDineroView = ({ entidad, casoTitulo, casoRecord, onBack }: {
  entidad: Entidad;
  casoTitulo: string | null;
  casoRecord: CasoUsoCSV | null;
  onBack: () => void;
}) => {
  const form = useForm({
    defaultValues: {
      usuariosIniciales: '',
      usuariosContactables: '',
      usuariosCompra: '',
      efectividad: '',
      cpaPromedio: '',
      ventasGeneradas: '',
      impactoFinanciero: '',
      observaciones: ''
    }
  });

  const onSubmit = (data: any) => {
    console.log('Métricas de negocio enviadas:', data);
    // Aquí se procesarían los datos del formulario
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a {entidad?.id_nombre}
        </Button>
        
        {casoTitulo && (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {casoTitulo}
              </h1>
              <p className="text-muted-foreground text-lg">Análisis de redes y flujos financieros</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {casoRecord?.['Sharepoint Link'] ? (
                <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs hover:bg-blue-50 hover:border-blue-300">
                  <a href={casoRecord['Sharepoint Link']} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1.5" />SharePoint
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs" disabled>
                  <ExternalLink className="w-3 h-3 mr-1.5" />SharePoint
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="metricas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metricas">Métricas y Análisis</TabsTrigger>
          <TabsTrigger value="formulario">Formulario de Métricas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metricas" className="space-y-6">
          <CasoUso tipo="generico" displayTitle={casoTitulo || undefined} csvRecord={casoRecord as any} />
        </TabsContent>
        
        <TabsContent value="formulario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Formulario de Métricas de Negocio
              </CardTitle>
              <CardDescription>
                Complete los campos para registrar las métricas de negocio del caso de uso Redes flujos de Dinero
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="usuariosIniciales"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuarios Iniciales</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: 10,000" 
                              type="number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="usuariosContactables"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuarios Contactables</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: 8,500" 
                              type="number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="usuariosCompra"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuarios con Compra</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: 1,200" 
                              type="number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="efectividad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Efectividad (%)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: 14.1" 
                              type="number" 
                              step="0.1"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpaPromedio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPA Promedio</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: 15,000" 
                              type="number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ventasGeneradas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ventas Generadas</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: 1,500" 
                              type="number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="impactoFinanciero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impacto Financiero</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: $250,000,000" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observaciones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ingrese observaciones adicionales sobre las métricas..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={onBack}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Guardar Métricas
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente específico para Cobranzas Cartera Castigada BdB
const CobranzasCarteraCastigadaView = ({ entidad, casoTitulo, casoRecord, onBack }: {
  entidad: Entidad;
  casoTitulo: string | null;
  casoRecord: CasoUsoCSV | null;
  onBack: () => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a {entidad?.id_nombre}
        </Button>
        
        {casoTitulo && (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {casoTitulo}
              </h1>
              <p className="text-muted-foreground text-lg">Modelo de recuperación de cartera castigada</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {casoRecord?.['Sharepoint Link'] ? (
                <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs hover:bg-blue-50 hover:border-blue-300">
                  <a href={casoRecord['Sharepoint Link']} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1.5" />SharePoint
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs" disabled>
                  <ExternalLink className="w-3 h-3 mr-1.5" />SharePoint
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Información del Modelo</TabsTrigger>
          <TabsTrigger value="tecnicas">Métricas Técnicas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-6">
          <CasoUso tipo="generico" displayTitle={casoTitulo || undefined} csvRecord={casoRecord as any} />
        </TabsContent>
        
        <TabsContent value="tecnicas" className="space-y-6">
          <TechnicalMetricsBacktesting />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EntityCasosUso;