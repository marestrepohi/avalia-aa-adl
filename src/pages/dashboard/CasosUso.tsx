import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Users, Activity, Building2 } from 'lucide-react';
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
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCasosUsoByEntity = (entidad: string) => {
    return casosUso.filter(caso => caso.id_nombre === entidad);
  };

  const getCasosActivos = (entidad: string) => {
    return getCasosUsoByEntity(entidad).filter(caso => 
      caso.Estado === 'Activo' || caso.Estado === 'En producción'
    ).length;
  };

  // Simular datos de científicos por entidad
  const getCientificos = (entidad: string) => {
    const cientificosPorEntidad = {
      'Corfi': 3,
      'Mathilde': 5,
      'Tuplus': 2,
      'Porvenir': 4,
      'Metrocuadrado': 2
    };
    return cientificosPorEntidad[entidad] || 1;
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entidades.map((entidad) => {
          const casosActivos = getCasosActivos(entidad.id_nombre);
          const totalCasos = getCasosUsoByEntity(entidad.id_nombre).length;
          const cientificos = getCientificos(entidad.id_nombre);

          return (
            <Card 
              key={entidad.id_nombre} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
              onClick={() => handleEntityClick(entidad)}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center p-2"
                    style={{ backgroundColor: `${entidad.color}20` }}
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
                      className="w-8 h-8" 
                      style={{ 
                        color: entidad.color,
                        display: entidad.logo_url ? 'none' : 'flex'
                      }} 
                    />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <CardTitle className="text-xl">{entidad.id_nombre}</CardTitle>
                  <CardDescription className="text-sm">
                    {entidad.descripcion}
                  </CardDescription>
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