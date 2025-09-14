import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, CheckCircle, Users, Target } from 'lucide-react';
import { Pie, ResponsiveContainer, Tooltip } from 'recharts';
import Papa from 'papaparse';

interface EstadoMetricsOverviewProps {
  className?: string;
}

const EstadoMetricsOverview: React.FC<EstadoMetricsOverviewProps> = ({ className }) => {
  const [casosUsoData, setCasosUsoData] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [estadoMetrics, setEstadoMetrics] = useState<Record<string, any>>({});

  // Load casos_uso.csv data and compute state-based metrics
  useEffect(() => {
    const cargarCasosUso = async () => {
      try {
        const base = (import.meta as any)?.env?.BASE_URL || '/';
        const res = await fetch(`${base}casos_uso.csv`);
        if (!res.ok) return;
        const text = await res.text();
        const parsed = Papa.parse(text, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true
        });

        const data = parsed.data as any[];
        setCasosUsoData(data);

        // Compute state-based metrics
        const estadoMap = new Map<string, number>();
        const entityEstadoMap = new Map<string, Map<string, number>>();

        data.forEach((row) => {
          const estado = row.Estado?.trim();
          const entidad = row.Entidad?.trim();

          if (estado) {
            // General count by estado
            estadoMap.set(estado, (estadoMap.get(estado) || 0) + 1);

            // Entity-specific count by estado
            if (entidad) {
              if (!entityEstadoMap.has(entidad)) {
                entityEstadoMap.set(entidad, new Map());
              }
              const entityMap = entityEstadoMap.get(entidad)!;
              entityMap.set(estado, (entityMap.get(estado) || 0) + 1);
            }
          }
        });

        // Convert to object format for easier use
        const estadoMetricsObj: Record<string, any> = {};
        estadoMap.forEach((count, estado) => {
          estadoMetricsObj[estado] = { count, percentage: 0 };
        });

        const totalCasos = data.length;
        Object.keys(estadoMetricsObj).forEach(estado => {
          estadoMetricsObj[estado].percentage = (estadoMetricsObj[estado].count / totalCasos) * 100;
        });

        // Entity-specific metrics
        const entityMetrics: Record<string, any> = {};
        entityEstadoMap.forEach((estadoMap, entidad) => {
          const entityTotal = Array.from(estadoMap.values()).reduce((sum, count) => sum + count, 0);
          const entityEstados: Record<string, any> = {};
          estadoMap.forEach((count, estado) => {
            entityEstados[estado] = {
              count,
              percentage: (count / entityTotal) * 100
            };
          });
          entityMetrics[entidad] = {
            total: entityTotal,
            estados: entityEstados
          };
        });

        setEstadoMetrics({
          general: estadoMetricsObj,
          entities: entityMetrics,
          totalCasos,
          uniqueEntities: Array.from(entityEstadoMap.keys()).sort(),
          uniqueEstados: Array.from(estadoMap.keys()).sort()
        });

      } catch (e) {
        console.error('Error loading casos_uso.csv:', e);
      }
    };

    cargarCasosUso();
  }, []);

  if (!estadoMetrics.totalCasos) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            <div className="text-sm text-muted-foreground">Cargando métricas de estado...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Estado de Casos de Uso
        </CardTitle>
        <CardDescription>
          Distribución de {estadoMetrics.totalCasos} casos por estado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Entity Selection */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800">Vista:</span>
            <Button
              variant={selectedEntity === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedEntity(null)}
              className="text-xs"
            >
              General
            </Button>
            <Button
              variant={selectedEntity !== null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedEntity(estadoMetrics.uniqueEntities?.[0] || null)}
              className="text-xs"
            >
              Por Entidad
            </Button>
          </div>

          {selectedEntity !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800">Entidad:</span>
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estadoMetrics.uniqueEntities?.map((entity: string) => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* State Metrics Display */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedEntity === null
            ? // General view - aggregated by estado
              Object.entries(estadoMetrics.general || {}).map(([estado, data]: [string, any]) => (
                <Card key={estado} className="bg-white/50 border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-gray-900">{data.count}</div>
                        <div className="text-sm text-gray-700 truncate" title={estado}>
                          {estado.length > 20 ? `${estado.substring(0, 20)}...` : estado}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {data.percentage.toFixed(1)}% del total
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : // Entity-specific view
              Object.entries(estadoMetrics.entities?.[selectedEntity]?.estados || {}).map(([estado, data]: [string, any]) => (
                <Card key={estado} className="bg-white/50 border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-gray-900">{data.count}</div>
                        <div className="text-sm text-gray-700 truncate" title={estado}>
                          {estado.length > 20 ? `${estado.substring(0, 20)}...` : estado}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {data.percentage.toFixed(1)}% de {selectedEntity}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          }
        </div>

        {/* Visual Chart */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución por Estado
            </CardTitle>
            <CardDescription>
              {selectedEntity === null ? 'Vista general de todos los casos' : `Distribución para ${selectedEntity}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={
                    selectedEntity === null
                      ? Object.entries(estadoMetrics.general || {}).map(([estado, data]: [string, any], index: number) => ({
                          name: estado.length > 25 ? `${estado.substring(0, 25)}...` : estado,
                          value: data.count,
                          fullName: estado,
                          fill: [
                            '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
                            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
                          ][index % 10]
                        }))
                      : Object.entries(estadoMetrics.entities?.[selectedEntity]?.estados || {}).map(([estado, data]: [string, any], index: number) => ({
                          name: estado.length > 25 ? `${estado.substring(0, 25)}...` : estado,
                          value: data.count,
                          fullName: estado,
                          fill: [
                            '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
                            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
                          ][index % 10]
                        }))
                  }
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                />
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} casos (${((props.payload as any)?.percent * 100).toFixed(1)}%)`,
                    (props.payload as any)?.payload?.fullName || name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-lg font-bold text-green-900">
                    {selectedEntity === null
                      ? Object.values(estadoMetrics.general || {}).filter((data: any) => data.count > 0).length
                      : Object.values(estadoMetrics.entities?.[selectedEntity]?.estados || {}).filter((data: any) => data.count > 0).length
                    }
                  </div>
                  <div className="text-sm text-green-700">Estados Activos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-lg font-bold text-blue-900">
                    {selectedEntity === null ? estadoMetrics.totalCasos : estadoMetrics.entities?.[selectedEntity]?.total || 0}
                  </div>
                  <div className="text-sm text-blue-700">
                    {selectedEntity === null ? 'Total Casos' : `Casos en ${selectedEntity}`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-lg font-bold text-purple-900">
                    {selectedEntity === null
                      ? (Object.values(estadoMetrics.general || {}) as any[]).reduce((max: number, data: any) => Math.max(max, data.percentage), 0).toFixed(1) + '%'
                      : (Object.values(estadoMetrics.entities?.[selectedEntity]?.estados || {}) as any[]).reduce((max: number, data: any) => Math.max(max, data.percentage), 0).toFixed(1) + '%'
                    }
                  </div>
                  <div className="text-sm text-purple-700">Estado Mayoritario</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstadoMetricsOverview;