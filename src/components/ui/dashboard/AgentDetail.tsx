import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import BarChart from './BarChart';

interface AgentMetric {
  id: number;
  month: string;
  llamadas: number;
  minutos: number;
  colgados: number;
  sentimiento: number;
  tasaExito: number;
}

interface AgentDetailProps {
  agentId: number;
}

const AgentDetail: React.FC<AgentDetailProps> = ({ agentId }) => {
  const [metrics, setMetrics] = useState<AgentMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/agent_metrics.csv')
      .then(res => res.text())
      .then(csv => {
        Papa.parse<AgentMetric>(csv, {
          header: true,
          dynamicTyping: true,
          complete: results => {
            const data = results.data.filter(m => m.id === agentId);
            setMetrics(data);
            setLoading(false);
          }
        });
      });
  }, [agentId]);

  if (loading) return <div className="p-4">Cargando métricas...</div>;
  if (!metrics.length) return <div className="p-4">No hay métricas disponibles</div>;

  const latest = metrics[metrics.length - 1];

  return (
    <div className="space-y-6 p-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Llamadas</span>
          <span className="font-bold text-lg">{latest.llamadas}</span>
        </div>
        <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Minutos</span>
          <span className="font-bold text-lg">{latest.minutos}</span>
        </div>
        <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Colgados</span>
          <span className="font-bold text-lg">{latest.colgados}</span>
        </div>
        <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Sentimiento (%)</span>
          <span className="font-bold text-lg">{(latest.sentimiento * 100).toFixed(0)}%</span>
        </div>
        <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Tasa de Éxito (%)</span>
          <span className="font-bold text-lg">{(latest.tasaExito * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-4 shadow h-64">
          <h4 className="font-semibold mb-2">Llamadas por Mes</h4>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="llamadas" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg p-4 shadow h-64">
          <h4 className="font-semibold mb-2">Tasa de Éxito (%)</h4>
          <BarChart
            data={metrics.map(m => ({ name: m.month, value: m.tasaExito * 100 }))}
            title=""
          />
        </div>
        <div className="bg-white rounded-lg p-4 shadow h-64">
          <h4 className="font-semibold mb-2">Sentimiento (%)</h4>
          <BarChart
            data={metrics.map(m => ({ name: m.month, value: m.sentimiento * 100 }))}
            title=""
          />
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;
