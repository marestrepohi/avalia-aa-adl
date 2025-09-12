import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, Target, Users, DollarSign, Percent, Info, Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';

interface BacktestingRecord {
  decil_probabilidad: number;
  marca_bueno_evidente: number;
  clientes: number;
  respuesta: number;
  tasa_buenos: number;
  distribucion: number;
  lift: number;
  saldo_total: number;
  sum_pagos_3m_total: number;
  sum_pagos_1m_total: number;
  sum_pagos_2m_total: number;
  sum_pagos_3m_acum: number;
  sum_pagos_1m_acum: number;
  sum_pagos_2m_acum: number;
  tasa_recu_3m_acum: number;
  tasa_recu_1m_acum: number;
  tasa_recu_2m_acum: number;
  buenos_acumulados: number;
  psi: number;
  ks: number;
  roc: number;
  fecha: string;
  segmento: string;
}

interface FieldDescription {
  variable: string;
  descripcion: string;
}

const TechnicalMetricsBacktesting: React.FC = () => {
  const [backtestingData, setBacktestingData] = useState<BacktestingRecord[]>([]);
  const [fieldDescriptions, setFieldDescriptions] = useState<FieldDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedDecil, setSelectedDecil] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('modelo');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar datos de backtesting
        const backtestingResponse = await fetch('/backtesting_Cobranzas Cartera Castigada BdB.csv');
        const backtestingCsv = await backtestingResponse.text();
        
        Papa.parse<BacktestingRecord>(backtestingCsv, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            setBacktestingData(results.data.filter(row => row.decil_probabilidad !== undefined));
          }
        });

        // Cargar descripciones de campos
        const fieldsResponse = await fetch('/campos_backtestig_Cobranzas Cartera Castigada BdB.csv');
        const fieldsCsv = await fieldsResponse.text();
        
        Papa.parse<FieldDescription>(fieldsCsv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setFieldDescriptions(results.data);
          }
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getFieldDescription = (fieldName: string): string => {
    const field = fieldDescriptions.find(f => f.variable === fieldName);
    return field?.descripcion || 'Descripción no disponible';
  };

  const filteredData = useMemo(() => {
    let data = backtestingData;
    
    if (selectedSegment !== 'all') {
      data = data.filter(row => row.segmento === selectedSegment);
    }
    
    if (selectedDecil !== 'all') {
      data = data.filter(row => row.decil_probabilidad.toString() === selectedDecil);
    }
    
    return data;
  }, [backtestingData, selectedSegment, selectedDecil]);

  const segments = useMemo(() => {
    const uniqueSegments = [...new Set(backtestingData.map(row => row.segmento))].sort();
    return uniqueSegments;
  }, [backtestingData]);

  const deciles = useMemo(() => {
    const uniqueDeciles = [...new Set(backtestingData.map(row => row.decil_probabilidad))].sort((a, b) => a - b);
    return uniqueDeciles;
  }, [backtestingData]);

  // Análisis por segmentos
  const segmentAnalysis = useMemo(() => {
    const analysis = segments.map(segment => {
      const segmentData = backtestingData.filter(row => row.segmento === segment);
      const totalClientes = segmentData.reduce((sum, row) => sum + (row.clientes || 0), 0);
      const totalRespuesta = segmentData.reduce((sum, row) => sum + (row.respuesta || 0), 0);
      const totalSaldo = segmentData.reduce((sum, row) => sum + (row.saldo_total || 0), 0);
      const totalPagos3m = segmentData.reduce((sum, row) => sum + (row.sum_pagos_3m_total || 0), 0);
      const avgKS = segmentData.reduce((sum, row) => sum + (row.ks || 0), 0) / segmentData.length;
      const avgROC = segmentData.reduce((sum, row) => sum + (row.roc || 0), 0) / segmentData.length;
      
      return {
        segmento: segment,
        clientes: totalClientes,
        respuesta: totalRespuesta,
        tasa_respuesta: totalClientes > 0 ? (totalRespuesta / totalClientes) * 100 : 0,
        saldo_total: totalSaldo,
        pagos_3m: totalPagos3m,
        tasa_recuperacion: totalSaldo > 0 ? (totalPagos3m / totalSaldo) * 100 : 0,
        ks: avgKS,
        roc: avgROC
      };
    });
    
    return analysis.sort((a, b) => b.tasa_recuperacion - a.tasa_recuperacion);
  }, [backtestingData, segments]);

  // Datos para gráficas por deciles
  const decilesData = useMemo(() => {
    const decilGroups = deciles.map(decil => {
      const decilData = filteredData.filter(row => row.decil_probabilidad === decil);
      const totalClientes = decilData.reduce((sum, row) => sum + (row.clientes || 0), 0);
      const totalRespuesta = decilData.reduce((sum, row) => sum + (row.respuesta || 0), 0);
      const totalSaldo = decilData.reduce((sum, row) => sum + (row.saldo_total || 0), 0);
      const totalPagos3m = decilData.reduce((sum, row) => sum + (row.sum_pagos_3m_total || 0), 0);
      const avgLift = decilData.reduce((sum, row) => sum + (row.lift || 0), 0) / (decilData.length || 1);
      
      return {
        decil: `D${decil}`,
        clientes: totalClientes,
        respuesta: totalRespuesta,
        tasa_respuesta: totalClientes > 0 ? (totalRespuesta / totalClientes) * 100 : 0,
        saldo_total: totalSaldo,
        pagos_3m: totalPagos3m,
        tasa_recuperacion: totalSaldo > 0 ? (totalPagos3m / totalSaldo) * 100 : 0,
        lift: avgLift
      };
    });
    
    return decilGroups;
  }, [filteredData, deciles]);

  // Métricas principales del modelo
  const modelMetrics = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const totalClientes = filteredData.reduce((sum, row) => sum + (row.clientes || 0), 0);
    const totalRespuesta = filteredData.reduce((sum, row) => sum + (row.respuesta || 0), 0);
    const totalSaldo = filteredData.reduce((sum, row) => sum + (row.saldo_total || 0), 0);
    const totalPagos3m = filteredData.reduce((sum, row) => sum + (row.sum_pagos_3m_total || 0), 0);
    const avgKS = filteredData.reduce((sum, row) => sum + (row.ks || 0), 0) / filteredData.length;
    const avgROC = filteredData.reduce((sum, row) => sum + (row.roc || 0), 0) / filteredData.length;
    const avgPSI = filteredData.reduce((sum, row) => sum + (row.psi || 0), 0) / filteredData.length;
    
    return {
      totalClientes,
      totalRespuesta,
      tasaRespuesta: (totalRespuesta / totalClientes) * 100,
      totalSaldo,
      totalPagos3m,
      tasaRecuperacion: (totalPagos3m / totalSaldo) * 100,
      ks: avgKS,
      roc: avgROC,
      psi: avgPSI
    };
  }, [filteredData]);

  const exportData = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backtesting_cobranzas_${selectedSegment}_${selectedDecil}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando métricas técnicas...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Filtros y controles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Métricas Técnicas - Modelo Cobranzas Cartera Castigada BdB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-auto">
                <TabsList>
                  <TabsTrigger value="modelo">Métricas del Modelo</TabsTrigger>
                  <TabsTrigger value="backtesting">Resultados Backtesting</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Seleccionar segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los segmentos</SelectItem>
                  {segments.map(segment => (
                    <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDecil} onValueChange={setSelectedDecil}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Seleccionar decil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los deciles</SelectItem>
                  {deciles.map(decil => (
                    <SelectItem key={decil} value={decil.toString()}>Decil {decil}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
          <TabsContent value="modelo">
            {/* Métricas principales del modelo */}
            {modelMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-help">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Clientes</p>
                          <p className="text-2xl font-bold">{modelMetrics.totalClientes.toLocaleString()}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getFieldDescription('clientes')}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-help">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tasa de Respuesta</p>
                          <p className="text-2xl font-bold">{modelMetrics.tasaRespuesta.toFixed(2)}%</p>
                        </div>
                        <Target className="h-8 w-8 text-green-600" />
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getFieldDescription('tasa_buenos')}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-help">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tasa Recuperación 3M</p>
                          <p className="text-2xl font-bold">{modelMetrics.tasaRecuperacion.toFixed(2)}%</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-emerald-600" />
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Porcentaje de saldo recuperado en 3 meses</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-help">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">KS Score</p>
                          <p className="text-2xl font-bold">{modelMetrics.ks.toFixed(1)}%</p>
                          <Badge variant={modelMetrics.ks > 30 ? "default" : modelMetrics.ks > 20 ? "secondary" : "destructive"} className="text-xs">
                            {modelMetrics.ks > 30 ? "Excelente" : modelMetrics.ks > 20 ? "Bueno" : "Deficiente"}
                          </Badge>
                        </div>
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getFieldDescription('ks')}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-help">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">ROC (AUC)</p>
                          <p className="text-2xl font-bold">{modelMetrics.roc.toFixed(3)}</p>
                          <Badge variant={modelMetrics.roc > 0.7 ? "default" : modelMetrics.roc > 0.6 ? "secondary" : "destructive"} className="text-xs">
                            {modelMetrics.roc > 0.7 ? "Excelente" : modelMetrics.roc > 0.6 ? "Bueno" : "Deficiente"}
                          </Badge>
                        </div>
                        <LineChartIcon className="h-8 w-8 text-orange-600" />
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getFieldDescription('roc')}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-help">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">PSI</p>
                          <p className="text-2xl font-bold">{modelMetrics.psi.toFixed(3)}</p>
                          <Badge variant={modelMetrics.psi < 0.1 ? "default" : modelMetrics.psi < 0.25 ? "secondary" : "destructive"} className="text-xs">
                            {modelMetrics.psi < 0.1 ? "Estable" : modelMetrics.psi < 0.25 ? "Cambio Moderado" : "Cambio Significativo"}
                          </Badge>
                        </div>
                        <TrendingUp className="h-8 w-8 text-red-600" />
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getFieldDescription('psi')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Análisis por segmentos */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Análisis por Segmentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Tasa de Recuperación por Segmento</h4>
                    <ChartContainer
                      config={{
                        tasa_recuperacion: {
                          label: "Tasa de Recuperación (%)",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={segmentAnalysis}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="segmento" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={10}
                          />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="tasa_recuperacion" fill="var(--color-tasa_recuperacion)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4">Distribución de Clientes por Segmento</h4>
                    <ChartContainer
                      config={{
                        clientes: {
                          label: "Clientes",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={segmentAnalysis}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="clientes"
                            label={(entry) => `${entry.segmento}: ${entry.clientes.toLocaleString()}`}
                          >
                            {segmentAnalysis.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>

                {/* Tabla resumen por segmentos */}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-2 text-left">Segmento</th>
                        <th className="border border-border p-2 text-right">Clientes</th>
                        <th className="border border-border p-2 text-right">Respuesta</th>
                        <th className="border border-border p-2 text-right">Tasa Respuesta (%)</th>
                        <th className="border border-border p-2 text-right">Saldo Total</th>
                        <th className="border border-border p-2 text-right">Tasa Recuperación (%)</th>
                        <th className="border border-border p-2 text-right">KS</th>
                        <th className="border border-border p-2 text-right">ROC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {segmentAnalysis.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                          <td className="border border-border p-2 font-medium">{row.segmento}</td>
                          <td className="border border-border p-2 text-right">{row.clientes.toLocaleString()}</td>
                          <td className="border border-border p-2 text-right">{row.respuesta.toLocaleString()}</td>
                          <td className="border border-border p-2 text-right">{row.tasa_respuesta.toFixed(2)}%</td>
                          <td className="border border-border p-2 text-right">${(row.saldo_total / 1000000).toFixed(1)}M</td>
                          <td className="border border-border p-2 text-right">{row.tasa_recuperacion.toFixed(2)}%</td>
                          <td className="border border-border p-2 text-right">{row.ks.toFixed(1)}%</td>
                          <td className="border border-border p-2 text-right">{row.roc.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backtesting">
            {/* Análisis por deciles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tasa de Respuesta por Decil</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      tasa_respuesta: {
                        label: "Tasa de Respuesta (%)",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={decilesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="decil" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="tasa_respuesta" 
                          stroke="var(--color-tasa_respuesta)" 
                          strokeWidth={3}
                          dot={{ fill: "var(--color-tasa_respuesta)", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lift por Decil</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      lift: {
                        label: "Lift",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={decilesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="decil" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="lift" fill="var(--color-lift)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Saldos vs Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      saldo_total: {
                        label: "Saldo Total (Millones)",
                        color: "hsl(var(--chart-5))",
                      },
                      pagos_3m: {
                        label: "Pagos 3M (Millones)",
                        color: "hsl(var(--chart-6))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={decilesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          dataKey="saldo_total" 
                          domain={['dataMin', 'dataMax']}
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                          name="Saldo Total"
                        />
                        <YAxis 
                          type="number" 
                          dataKey="pagos_3m"
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                          name="Pagos 3M"
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value, name) => [
                            `$${((value as number) / 1000000).toFixed(1)}M`,
                            name
                          ]}
                        />
                        <Scatter 
                          dataKey="pagos_3m" 
                          fill="var(--color-pagos_3m)"
                          name="Pagos vs Saldos"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Clientes por Decil</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      clientes: {
                        label: "Clientes",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={decilesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="decil" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="clientes" fill="var(--color-clientes)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabla detallada por deciles */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tabla Detallada por Deciles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-2 text-left">Decil</th>
                        <th className="border border-border p-2 text-right">Clientes</th>
                        <th className="border border-border p-2 text-right">Respuesta</th>
                        <th className="border border-border p-2 text-right">Tasa Respuesta (%)</th>
                        <th className="border border-border p-2 text-right">Saldo Total (M)</th>
                        <th className="border border-border p-2 text-right">Pagos 3M (M)</th>
                        <th className="border border-border p-2 text-right">Tasa Recuperación (%)</th>
                        <th className="border border-border p-2 text-right">Lift</th>
                      </tr>
                    </thead>
                    <tbody>
                      {decilesData.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                          <td className="border border-border p-2 font-medium">{row.decil}</td>
                          <td className="border border-border p-2 text-right">{row.clientes.toLocaleString()}</td>
                          <td className="border border-border p-2 text-right">{row.respuesta.toLocaleString()}</td>
                          <td className="border border-border p-2 text-right">{row.tasa_respuesta.toFixed(2)}%</td>
                          <td className="border border-border p-2 text-right">${(row.saldo_total / 1000000).toFixed(1)}</td>
                          <td className="border border-border p-2 text-right">${(row.pagos_3m / 1000000).toFixed(1)}</td>
                          <td className="border border-border p-2 text-right">{row.tasa_recuperacion.toFixed(2)}%</td>
                          <td className="border border-border p-2 text-right">{row.lift.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default TechnicalMetricsBacktesting;