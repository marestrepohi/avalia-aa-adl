import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Brain, TrendingDown, Target, Zap, BarChart3, Building2 } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { supabase } from '@/integrations/supabase/client';
import CasoUso from '@/components/casos-uso/CasoUso';
import CasosUsoEntidad from '@/components/casos-uso/CasosUsoEntidad';

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
  const [selectedCasoTitulo, setSelectedCasoTitulo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Casos de uso disponibles para agregar
  const casosDisponibles = [
    { id: 'churn', nombre: 'Churn Prediction', descripcion: 'Predicción de abandono de clientes', icono: TrendingDown, color: 'bg-red-500' },
    { id: 'tc', nombre: 'Top Customers', descripcion: 'Identificación de mejores clientes', icono: Target, color: 'bg-green-500' },
    { id: 'nba', nombre: 'Next Best Action', descripcion: 'Próxima mejor acción comercial', icono: Zap, color: 'bg-blue-500' },
    { id: 'aumento-uso', nombre: 'Aumento de Uso', descripcion: 'Incremento en utilización de productos', icono: BarChart3, color: 'bg-purple-500' }
  ];

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

  const handleCasoClick = (casoId: string, titulo?: string) => {
    setSelectedCaso(casoId);
    if (titulo) setSelectedCasoTitulo(titulo);
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
    <div className="p-6 space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={handleBackClick}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center p-2"
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
              className="w-6 h-6" 
              style={{ 
                color: entidad.color,
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
  <CasosUsoEntidad entidad={entidad.id_nombre} onSelectCaso={(t, titulo) => handleCasoClick(t, titulo)} />
    </div>
  );
};

export default EntityCasosUso;