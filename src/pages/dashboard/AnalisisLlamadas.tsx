
import React, { useState } from "react";
import { BarChart as ChartBar, Smile, Meh, Frown, Filter, Download, Users, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import DataTable from "../../components/ui/dashboard/DataTable";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

// Nuevo tipo de agente
type TipoAgente = "Humano" | "Bot";

// Datos de ejemplo para llamadas extendidos con tipo de agente
const llamadasData = [
  {
    id: 1,
    fecha: new Date("2023-03-15T10:23:00"),
    agente: "Laura Santos",
    tipoAgente: "Humano" as TipoAgente,
    cliente: "Martín Gutiérrez",
    empresa: "Informática Global",
    duracion: "05:42",
    resultado: "Convertido",
    sentimiento: "Positivo"
  },
  {
    id: 2,
    fecha: new Date("2023-03-15T11:05:00"),
    agente: "Call Bot",
    tipoAgente: "Bot" as TipoAgente,
    cliente: "Ana Belén Torres",
    empresa: "Consultoría Estratégica",
    duracion: "03:18",
    resultado: "Seguimiento",
    sentimiento: "Neutro"
  },
  {
    id: 3,
    fecha: new Date("2023-03-15T12:30:00"),
    agente: "Elena Jiménez",
    tipoAgente: "Humano" as TipoAgente,
    cliente: "Roberto Fernández",
    empresa: "Construcciones Modernas",
    duracion: "07:55",
    resultado: "Convertido",
    sentimiento: "Positivo"
  },
  {
    id: 4,
    fecha: new Date("2023-03-15T14:15:00"),
    agente: "Bot Express",
    tipoAgente: "Bot" as TipoAgente,
    cliente: "Sandra López",
    empresa: "Distribuciones Este",
    duracion: "02:47",
    resultado: "No interesado",
    sentimiento: "Negativo"
  },
  {
    id: 5,
    fecha: new Date("2023-03-15T15:50:00"),
    agente: "Laura Santos",
    tipoAgente: "Humano" as TipoAgente,
    cliente: "Javier García",
    empresa: "Textiles del Norte",
    duracion: "04:12",
    resultado: "Seguimiento",
    sentimiento: "Neutro"
  }
];

// Filtros disponibles
const filters = [
  { label: "Todos", value: "all" },
  { label: "Humanos", value: "Humano" },
  { label: "Bots", value: "Bot" },
];

// KPIs de sentimientos: se calculan dinámicamente según el filtro
function getSentimentStats(data: typeof llamadasData) {
  const total = data.length;
  const positivos = data.filter(l => l.sentimiento === "Positivo").length;
  const neutros = data.filter(l => l.sentimiento === "Neutro").length;
  const negativos = data.filter(l => l.sentimiento === "Negativo").length;
  return {
    positivos,
    neutros,
    negativos,
    total,
    pctPositivos: total ? Math.round((positivos / total) * 100) : 0,
    pctNeutros: total ? Math.round((neutros / total) * 100) : 0,
    pctNegativos: total ? Math.round((negativos / total) * 100) : 0,
  };
}

// Columnas para la tabla de llamadas actualizada
const columnasLlamadas = [
  {
    key: "fecha",
    header: "Fecha y Hora",
    render: (value: Date) => format(value, "dd/MM/yyyy HH:mm"),
  },
  {
    key: "agente",
    header: "Agente/Asistente",
  },
  {
    key: "tipoAgente",
    header: "Tipo",
    render: (value: string) => (
      <span className={`badge ${value === "Humano" ? "badge-success" : "badge-neutral"}`}>{value}</span>
    ),
  },
  {
    key: "cliente",
    header: "Cliente",
    render: (value: string, row: any) => (
      <div>
        <div className="font-medium">{value}</div>
        <div className="text-xs text-muted-foreground">{row.empresa}</div>
      </div>
    ),
  },
  {
    key: "duracion",
    header: "Duración",
  },
  {
    key: "sentimiento",
    header: "Sentimiento",
    render: (value: string) => {
      let badgeClass = "badge-neutral";
      let Icon = Meh;
      if (value === "Positivo") {
        badgeClass = "badge-success";
        Icon = Smile;
      }
      if (value === "Negativo") {
        badgeClass = "badge-danger";
        Icon = Frown;
      }
      if (value === "Neutro") {
        badgeClass = "badge-secondary";
        Icon = Meh;
      }
      return (
        <span className={`inline-flex items-center gap-1 badge ${badgeClass}`}>
          <Icon className="h-4 w-4" />
          {value}
        </span>
      );
    },
  },
  {
    key: "resultado",
    header: "Resultado",
    render: (value: string) => {
      let badgeClass = "badge-neutral";
      if (value === "Convertido") badgeClass = "badge-success";
      if (value === "No interesado") badgeClass = "badge-danger";
      return <span className={`badge ${badgeClass}`}>{value}</span>;
    },
  },
  {
    key: "actions",
    header: "Acciones",
    render: (_: any, row: any) => (
      <button className="btn-secondary flex items-center gap-2 py-1 px-2 text-xs">
        <MessageSquare className="h-3 w-3" />
        <span>Transcripción</span>
      </button>
    ),
  },
];

const AnalisisLlamadas: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  // Filtro de tipo de agente (all | Humano | Bot)
  const [tipoAgenteFiltro, setTipoAgenteFiltro] = useState<string>("all");

  // Filtrar los datos según filtro seleccionado
  const llamadasFiltradas = tipoAgenteFiltro === "all"
    ? llamadasData
    : llamadasData.filter(l => l.tipoAgente === tipoAgenteFiltro);

  const sentimentStats = getSentimentStats(llamadasFiltradas);

  return (
    <div>
      {/* Título y Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Análisis de Sentimientos en Llamadas</h1>
          <p className="text-muted-foreground text-sm">
            Visualiza la satisfacción de los clientes según el tipo de agente (humano o bot).
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Selector de tipo de agente */}
          <div className="flex gap-2">
            {filters.map(f => (
              <Button
                key={f.value}
                variant={tipoAgenteFiltro === f.value ? "default" : "outline"}
                onClick={() => setTipoAgenteFiltro(f.value)}
                className={tipoAgenteFiltro === f.value ? "" : "bg-white"}
              >
                {f.label}
              </Button>
            ))}
          </div>
          {/* Elimina el botón calendario y solo deja exportar */}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      {/* Dashboard de Sentimientos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Sentimiento Positivo */}
        <div className="flex flex-col justify-center items-center bg-white rounded-lg shadow-card p-5">
          <Smile className="h-10 w-10 text-green-500 mb-2" />
          <div className="text-3xl font-semibold text-green-600">{sentimentStats.pctPositivos}%</div>
          <div className="text-sm text-muted-foreground mt-1">Positivas</div>
          <div className="mt-1 font-mono">{sentimentStats.positivos} llamadas</div>
        </div>
        {/* Sentimiento Neutro */}
        <div className="flex flex-col justify-center items-center bg-white rounded-lg shadow-card p-5">
          <Meh className="h-10 w-10 text-yellow-500 mb-2" />
          <div className="text-3xl font-semibold text-yellow-600">{sentimentStats.pctNeutros}%</div>
          <div className="text-sm text-muted-foreground mt-1">Neutras</div>
          <div className="mt-1 font-mono">{sentimentStats.neutros} llamadas</div>
        </div>
        {/* Sentimiento Negativo */}
        <div className="flex flex-col justify-center items-center bg-white rounded-lg shadow-card p-5">
          <Frown className="h-10 w-10 text-red-500 mb-2" />
          <div className="text-3xl font-semibold text-red-600">{sentimentStats.pctNegativos}%</div>
          <div className="text-sm text-muted-foreground mt-1">Negativas</div>
          <div className="mt-1 font-mono">{sentimentStats.negativos} llamadas</div>
        </div>
      </div>

      {/* Gráficos de tendencias de sentimientos (ejemplo simple con barras horizontales) */}
      <div className="mb-8 bg-white rounded-lg shadow-card p-6">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <ChartBar className="h-5 w-5" /> Distribución de Sentimientos
        </h2>
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-green-500" />
            <div className="w-full bg-green-100 h-4 rounded">
              <div
                className="bg-green-500 h-4 rounded"
                style={{ width: `${sentimentStats.pctPositivos}%` }}
              ></div>
            </div>
            <span className="ml-2 font-mono text-green-700">{sentimentStats.positivos}</span>
          </div>
          <div className="flex items-center gap-2">
            <Meh className="h-5 w-5 text-yellow-500" />
            <div className="w-full bg-yellow-100 h-4 rounded">
              <div
                className="bg-yellow-400 h-4 rounded"
                style={{ width: `${sentimentStats.pctNeutros}%` }}
              ></div>
            </div>
            <span className="ml-2 font-mono text-yellow-700">{sentimentStats.neutros}</span>
          </div>
          <div className="flex items-center gap-2">
            <Frown className="h-5 w-5 text-red-500" />
            <div className="w-full bg-red-100 h-4 rounded">
              <div
                className="bg-red-500 h-4 rounded"
                style={{ width: `${sentimentStats.pctNegativos}%` }}
              ></div>
            </div>
            <span className="ml-2 font-mono text-red-700">{sentimentStats.negativos}</span>
          </div>
        </div>
      </div>

      {/* Tabla Detallada de Llamadas */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Detalle de Llamadas ({filters.find(f => f.value === tipoAgenteFiltro)?.label})</h2>
          <div className="flex items-center gap-2">
            <input 
              type="text"
              placeholder="Buscar llamadas..."
              className="input-field text-sm py-1 px-3 h-9"
            />
            <button className="icon-button group">
              <Filter className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              <span className="tooltip -bottom-8">Filtrar</span>
            </button>
          </div>
        </div>
        <DataTable 
          columns={columnasLlamadas}
          data={llamadasFiltradas}
        />
      </div>
    </div>
  );
};

export default AnalisisLlamadas;

