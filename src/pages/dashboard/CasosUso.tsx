import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Cpu, BarChart3, Zap } from 'lucide-react';

const CasosUso = () => {
  const [selectedCaso, setSelectedCaso] = useState('churn');

  const casosDeUso = [
    {
      id: 'churn',
      nombre: 'Churn Prediction',
      descripcion: 'Predicción de abandono de clientes',
      estado: 'Activo',
      color: 'bg-red-500'
    },
    {
      id: 'tc',
      nombre: 'Top Customers',
      descripcion: 'Identificación de mejores clientes',
      estado: 'Activo',
      color: 'bg-green-500'
    },
    {
      id: 'nba',
      nombre: 'Next Best Action',
      descripcion: 'Próxima mejor acción comercial',
      estado: 'Activo',
      color: 'bg-blue-500'
    }
  ];

  const metricas = {
    financieras: [
      { titulo: 'ROI del Modelo', valor: '342%', icono: DollarSign, tendencia: 'up' },
      { titulo: 'Ahorro Anual', valor: '$2.4M', icono: TrendingUp, tendencia: 'up' },
      { titulo: 'Costo por Predicción', valor: '$0.15', icono: DollarSign, tendencia: 'down' },
      { titulo: 'Revenue Protegido', valor: '$8.7M', icono: TrendingUp, tendencia: 'up' }
    ],
    negocio: [
      { titulo: 'Precisión del Modelo', valor: '94.2%', icono: Target, tendencia: 'up' },
      { titulo: 'Clientes Retenidos', valor: '2,847', icono: Users, tendencia: 'up' },
      { titulo: 'Tasa de Conversión', valor: '67.8%', icono: TrendingUp, tendencia: 'up' },
      { titulo: 'Tiempo de Respuesta', valor: '< 2h', icono: Zap, tendencia: 'up' }
    ],
    tecnicas: [
      { titulo: 'AUC Score', valor: '0.92', icono: BarChart3, tendencia: 'up' },
      { titulo: 'F1 Score', valor: '0.89', icono: BarChart3, tendencia: 'up' },
      { titulo: 'Latencia API', valor: '45ms', icono: Cpu, tendencia: 'down' },
      { titulo: 'Uptime', valor: '99.9%', icono: Zap, tendencia: 'up' }
    ]
  };

  const renderMetricas = (tipo: 'financieras' | 'negocio' | 'tecnicas') => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas[tipo].map((metrica, index) => (
          <Card key={index} className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metrica.titulo}
                  </p>
                  <p className="text-2xl font-bold">{metrica.valor}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <metrica.icono className="h-5 w-5 text-muted-foreground" />
                  {metrica.tendencia === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Casos de Uso</h1>
          <p className="text-muted-foreground">
            Gestión y métricas de modelos de machine learning
          </p>
        </div>

        {/* Selector de Casos de Uso */}
        <div className="flex flex-wrap gap-3">
          {casosDeUso.map((caso) => (
            <Card
              key={caso.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCaso === caso.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCaso(caso.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${caso.color}`} />
                    <div>
                      <CardTitle className="text-lg">{caso.nombre}</CardTitle>
                      <CardDescription>{caso.descripcion}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {caso.estado}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Métricas por Pestañas */}
        <Card>
          <CardHeader>
            <CardTitle>
              Métricas - {casosDeUso.find(c => c.id === selectedCaso)?.nombre}
            </CardTitle>
            <CardDescription>
              Rendimiento y estadísticas del modelo seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="financieras" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="financieras">Métricas Financieras</TabsTrigger>
                <TabsTrigger value="negocio">Métricas de Negocio</TabsTrigger>
                <TabsTrigger value="tecnicas">Métricas Técnicas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="financieras" className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Impacto Financiero</h3>
                  <p className="text-muted-foreground">
                    Métricas relacionadas con el retorno de inversión y beneficios económicos
                  </p>
                </div>
                {renderMetricas('financieras')}
              </TabsContent>
              
              <TabsContent value="negocio" className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Métricas de Negocio</h3>
                  <p className="text-muted-foreground">
                    Indicadores de rendimiento del negocio y satisfacción del cliente
                  </p>
                </div>
                {renderMetricas('negocio')}
              </TabsContent>
              
              <TabsContent value="tecnicas" className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Métricas Técnicas</h3>
                  <p className="text-muted-foreground">
                    Rendimiento técnico del modelo y métricas de machine learning
                  </p>
                </div>
                {renderMetricas('tecnicas')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CasosUso;