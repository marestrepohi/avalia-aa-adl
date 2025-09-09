import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, TrendingDown, Target, Zap, BarChart3, Building2, Users, Clock, TrendingUp } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { supabase } from '@/integrations/supabase/client';
import CasoUso from '@/components/casos-uso/CasoUso';

interface Entidad {
  id_nombre: string;
  descripcion: string;
  logo_url: string;
  color: string;
}

interface CasoUsoData {
  PROJECT_ID: number;
  'Tipo Proyecto': string;
  Estado: string;
  id_nombre: string;
  Proyecto: string;
  Etapa: string;
  DS1?: string;
  DS2?: string;
  DE?: string;
}

const EntityCasosUso = () => {
  const { setActiveView } = useDashboard();
  const [entidad, setEntidad] = useState<Entidad | null>(null);
  const [casosUso, setCasosUso] = useState<CasoUsoData[]>([]);
  const [selectedCaso, setSelectedCaso] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mapeo de casos de uso para métricas simuladas
  const getMetricasCaso = (proyecto: string) => {
    const proyectoLower = proyecto?.toLowerCase() || '';
    
    if (proyectoLower.includes('churn')) {
      return { precision: 0.85, recall: 0.78, clientes_riesgo: 1250, ahorro_estimado: '$2.5M' };
    } else if (proyectoLower.includes('cobranza')) {
      return { precision: 0.92, recall: 0.88, efectividad: 0.65, recuperacion: '$4.2M' };
    } else if (proyectoLower.includes('fraude')) {
      return { precision: 0.94, recall: 0.82, alertas_dia: 45, fraudes_evitados: '$1.8M' };
    } else if (proyectoLower.includes('cupo') || proyectoLower.includes('empresarial')) {
      return { precision: 0.87, recall: 0.83, empresas_objetivo: 320, incremento_cupo: '$15.6M' };
    } else if (proyectoLower.includes('nba') || proyectoLower.includes('pasivos')) {
      return { precision: 0.89, recall: 0.85, conversiones: 892, ingresos: '$3.7M' };
    }
    
    return { precision: 0.86, recall: 0.81, impacto: 'Alto', valor: '$2.1M' };
  };

  useEffect(() => {
    const selectedEntityData = localStorage.getItem('selectedEntity');
    if (selectedEntityData) {
      const entidadData = JSON.parse(selectedEntityData);
      setEntidad(entidadData);
      fetchCasosUso(entidadData.id_nombre);
    }
  }, []);

  const fetchCasosUso = async (entidadNombre: string) => {
    try {
      const { data, error } = await supabase
        .from('casos_uso')
        .select('*')
        .eq('id_nombre', entidadNombre);

      if (error) throw error;
      setCasosUso(data || []);
    } catch (error) {
      console.error('Error loading casos de uso:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setActiveView('casosUso');
  };

  const handleCasoClick = (casoId: string) => {
    setSelectedCaso(casoId);
  };

  const getEstadoBadge = (estado: string) => {
    const estadoMap = {
      'Activo': { variant: 'default' as const, label: 'Activo' },
      'En producción': { variant: 'default' as const, label: 'En Producción' },
      'En desarrollo': { variant: 'secondary' as const, label: 'En Desarrollo' },
      'Pausado': { variant: 'destructive' as const, label: 'Pausado' },
    };
    return estadoMap[estado] || { variant: 'outline' as const, label: estado };
  };

  const getCasoIcon = (tipoCaso: string) => {
    const tipoLower = tipoCaso?.toLowerCase() || '';
    if (tipoLower.includes('churn')) return TrendingDown;
    if (tipoLower.includes('top') || tipoLower.includes('customer')) return Target;
    if (tipoLower.includes('next') || tipoLower.includes('action')) return Zap;
    if (tipoLower.includes('aumento') || tipoLower.includes('uso')) return BarChart3;
    return Brain;
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
          <Button variant="ghost" onClick={() => setSelectedCaso(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a {entidad.id_nombre}
          </Button>
        </div>
        <CasoUso tipo={selectedCaso as any} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackClick}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center p-2"
              style={{ backgroundColor: entidad.color }}
            >
              {entidad.logo_url ? (
                <img 
                  src={entidad.logo_url} 
                  alt={`Logo ${entidad.id_nombre}`}
                  className="w-full h-full object-contain brightness-0 invert"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) nextElement.style.display = 'flex';
                  }}
                />
              ) : null}
              <Building2 
                className="w-6 h-6 text-white" 
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
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Casos de Uso</h3>
          <p className="text-muted-foreground">
            Selecciona un caso de uso para ver sus métricas detalladas y configuración
          </p>
        </div>

        {casosUso.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {casosUso.map((caso) => {
              const IconComponent = getCasoIcon(caso['Tipo Proyecto']);
              const estadoBadge = getEstadoBadge(caso.Estado);
              const metricas = getMetricasCaso(caso.Proyecto || caso['Tipo Proyecto'] || '');

              return (
                <Card 
                  key={caso.PROJECT_ID} 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
                  onClick={() => {
                    // Determinar el tipo de caso basado en el nombre del proyecto
                    const proyecto = caso.Proyecto?.toLowerCase() || caso['Tipo Proyecto']?.toLowerCase() || '';
                    let tipoRuta = 'churn'; // default
                    
                    if (proyecto.includes('churn')) tipoRuta = 'churn';
                    else if (proyecto.includes('cobranza')) tipoRuta = 'churn';
                    else if (proyecto.includes('fraude')) tipoRuta = 'churn';
                    else if (proyecto.includes('cupo') || proyecto.includes('empresarial')) tipoRuta = 'aumento-uso';
                    else if (proyecto.includes('nba') || proyecto.includes('pasivos')) tipoRuta = 'nba';
                    else if (proyecto.includes('top') || proyecto.includes('customer')) tipoRuta = 'tc';
                    else if (proyecto.includes('aumento') || proyecto.includes('uso')) tipoRuta = 'aumento-uso';
                    
                    handleCasoClick(tipoRuta);
                  }}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight">{caso.Proyecto || caso['Tipo Proyecto']}</CardTitle>
                          <Badge {...estadoBadge} className="mt-1">{estadoBadge.label}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Métricas principales */}
                    <div className="grid grid-cols-2 gap-3 text-center bg-muted/30 rounded-lg p-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-lg font-semibold">{(metricas.precision * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Precisión</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Target className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="text-lg font-semibold">{(metricas.recall * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Recall</p>
                      </div>
                    </div>

                    {/* Información del proyecto */}
                    <div className="space-y-2 text-sm">
                      {caso.DS1 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data Scientist:</span>
                          <span className="font-medium">{caso.DS1}</span>
                        </div>
                      )}
                      {caso.Etapa && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Etapa:</span>
                          <span className="font-medium">{caso.Etapa}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Impacto:</span>
                        <span className="font-medium text-green-600">{Object.values(metricas)[3] || 'Alto'}</span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                      <Brain className="w-4 h-4 mr-2" />
                      Ver métricas completas
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No hay casos de uso configurados</h3>
                <p className="text-muted-foreground">
                  Esta entidad aún no tiene casos de uso registrados en el sistema.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EntityCasosUso;