import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Cpu, BarChart3, Zap, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CasoUsoProps {
  tipo: 'churn' | 'tc' | 'nba';
}

const CasoUso: React.FC<CasoUsoProps> = ({ tipo }) => {
  const casosInfo = {
    churn: {
      nombre: 'Churn Prediction',
      descripcion: 'Predicción de abandono de clientes',
      color: 'bg-red-500'
    },
    tc: {
      nombre: 'Top Customers',
      descripcion: 'Identificación de mejores clientes',
      color: 'bg-green-500'
    },
    nba: {
      nombre: 'Next Best Action',
      descripcion: 'Próxima mejor acción comercial',
      color: 'bg-blue-500'
    }
  };

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

  // Datos para gráficos de series de tiempo
  const seriesTemporales = [
    { fecha: 'Ene', precision: 92.1, latencia: 48, roi: 320 },
    { fecha: 'Feb', precision: 93.5, latencia: 46, roi: 335 },
    { fecha: 'Mar', precision: 94.2, latencia: 45, roi: 342 },
    { fecha: 'Abr', precision: 93.8, latencia: 44, roi: 338 },
    { fecha: 'May', precision: 94.5, latencia: 43, roi: 348 },
    { fecha: 'Jun', precision: 95.1, latencia: 42, roi: 355 }
  ];

  // Datos para gráfico de barras
  const datosBarras = [
    { mes: 'Ene', predicciones: 1850, correctas: 1702 },
    { mes: 'Feb', predicciones: 2100, correctas: 1963 },
    { mes: 'Mar', predicciones: 2350, correctas: 2214 },
    { mes: 'Abr', predicciones: 2200, correctas: 2064 },
    { mes: 'May', predicciones: 2500, correctas: 2363 },
    { mes: 'Jun', predicciones: 2700, correctas: 2568 }
  ];

  // Datos para pie chart
  const datosPie = [
    { name: 'Precisas', value: 94.2, color: '#10b981' },
    { name: 'Falsos Positivos', value: 3.8, color: '#f59e0b' },
    { name: 'Falsos Negativos', value: 2.0, color: '#ef4444' }
  ];

  // Datos para tabla de rendimiento
  const datosTabla = [
    { metrica: 'Accuracy', valor: '94.2%', benchmark: '90.0%', estado: 'Excelente' },
    { metrica: 'Precision', valor: '92.8%', benchmark: '88.0%', estado: 'Bueno' },
    { metrica: 'Recall', valor: '89.4%', benchmark: '85.0%', estado: 'Bueno' },
    { metrica: 'F1-Score', valor: '91.0%', benchmark: '86.5%', estado: 'Excelente' },
    { metrica: 'AUC-ROC', valor: '0.952', benchmark: '0.900', estado: 'Excelente' }
  ];

  const renderMetricas = (tipo: 'financieras' | 'negocio' | 'tecnicas') => {
    return (
      <div className="space-y-6">
        {/* KPIs principales */}
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

        {/* Gráficos según el tipo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tipo === 'financieras' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>ROI Evolutivo</CardTitle>
                  <CardDescription>Retorno de inversión por mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={seriesTemporales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="roi" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Costos</CardTitle>
                  <CardDescription>Desglose de inversión</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Infraestructura', value: 35, color: '#3b82f6' },
                          { name: 'Desarrollo', value: 45, color: '#10b981' },
                          { name: 'Mantenimiento', value: 20, color: '#f59e0b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {[
                          { name: 'Infraestructura', value: 35, color: '#3b82f6' },
                          { name: 'Desarrollo', value: 45, color: '#10b981' },
                          { name: 'Mantenimiento', value: 20, color: '#f59e0b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {tipo === 'negocio' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Precisión del Modelo</CardTitle>
                  <CardDescription>Evolución mensual de la precisión</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={seriesTemporales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis domain={[90, 96]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Predicciones vs Correctas</CardTitle>
                  <CardDescription>Comparación mensual</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosBarras}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="predicciones" fill="#3b82f6" name="Total Predicciones" />
                      <Bar dataKey="correctas" fill="#10b981" name="Predicciones Correctas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {tipo === 'tecnicas' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Latencia API</CardTitle>
                  <CardDescription>Tiempo de respuesta promedio</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={seriesTemporales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis domain={[40, 50]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="latencia" stroke="#ef4444" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Predicciones</CardTitle>
                  <CardDescription>Exactitud del modelo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={datosPie}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {datosPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Tabla de métricas detalladas */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas Detalladas</CardTitle>
            <CardDescription>Comparación con benchmarks de la industria</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Métrica</TableHead>
                  <TableHead>Valor Actual</TableHead>
                  <TableHead>Benchmark</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datosTabla.map((fila, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{fila.metrica}</TableCell>
                    <TableCell>{fila.valor}</TableCell>
                    <TableCell>{fila.benchmark}</TableCell>
                    <TableCell>
                      <Badge variant={fila.estado === 'Excelente' ? 'default' : 'secondary'}>
                        {fila.estado === 'Excelente' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {fila.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const casoInfo = casosInfo[tipo];

  return (
    <div className="container mx-auto p-6 space-y-6 h-full">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className={`w-4 h-4 rounded-full ${casoInfo.color}`} />
          <div>
            <h1 className="text-3xl font-bold">{casoInfo.nombre}</h1>
            <p className="text-muted-foreground">{casoInfo.descripcion}</p>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600 ml-auto">
            Activo
          </Badge>
        </div>

        {/* Métricas por Pestañas - Ocupando todo el espacio */}
        <div className="flex-1">
          <Tabs defaultValue="financieras" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="financieras">Métricas Financieras</TabsTrigger>
              <TabsTrigger value="negocio">Métricas de Negocio</TabsTrigger>
              <TabsTrigger value="tecnicas">Métricas Técnicas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="financieras" className="space-y-4 mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Impacto Financiero</h3>
                <p className="text-muted-foreground">
                  Métricas relacionadas con el retorno de inversión y beneficios económicos
                </p>
              </div>
              {renderMetricas('financieras')}
            </TabsContent>
            
            <TabsContent value="negocio" className="space-y-4 mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Métricas de Negocio</h3>
                <p className="text-muted-foreground">
                  Indicadores de rendimiento del negocio y satisfacción del cliente
                </p>
              </div>
              {renderMetricas('negocio')}
            </TabsContent>
            
            <TabsContent value="tecnicas" className="space-y-4 mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Métricas Técnicas</h3>
                <p className="text-muted-foreground">
                  Rendimiento técnico del modelo y métricas de machine learning
                </p>
              </div>
              {renderMetricas('tecnicas')}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CasoUso;