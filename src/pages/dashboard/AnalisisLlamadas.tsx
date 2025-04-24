import React, { useState } from "react";
import { BarChart as ChartBar, Smile, Meh, Frown, Filter, Download, Users, MessageSquare, PhoneCall, PhoneOff, ListFilter, Calendar, ChevronDown, ChevronUp, Star } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import DataTable from "../../components/ui/dashboard/DataTable";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import KpiCard from "@/components/ui/dashboard/KpiCard";

// Nuevo tipo de agente
type TipoAgente = "Humano" | "Bot";

// Definición del tipo de llamada
type Llamada = {
  id: number;
  fecha: Date;
  agente: string;
  tipoAgente: TipoAgente;
  cliente: string;
  empresa: string;
  duracion: string;
  resultado: string;
  sentimiento: string;
  calificacion: number;
};

// Generador dinámico de datos de llamadas con más de 1000 entradas por agente
const agentesList = [
  { agente: "Laura Santos", tipoAgente: "Humano" as TipoAgente },
  { agente: "Elena Jiménez", tipoAgente: "Humano" as TipoAgente },
  { agente: "Call Bot", tipoAgente: "Bot" as TipoAgente },
  { agente: "Bot Express", tipoAgente: "Bot" as TipoAgente },
];
const clientesList = ["Martín Gutiérrez","Ana Belén Torres","Roberto Fernández","Sandra López","Javier García","Lucía Márquez","Carlos Ruiz","Patricia Soto","David Molina","Laura Vega"];
const empresasList = ["Informática Global","Consultoría Estratégica","Construcciones Modernas","Distribuciones Este","Textiles del Norte","Servicios Financieros SV","Tecnología XXI"];
const resultadosList = ["Convertido","Seguimiento","No interesado"];
const sentimientosList = ["Positivo","Neutro","Negativo"];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function randomDuration() {
  const secs = Math.floor(Math.random() * 600) + 60; // entre 1 y 10 min
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function generateRandomCalls(perAgent = 1200): Llamada[] {
  let idCounter = 1;
  const data: Llamada[] = [];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  agentesList.forEach(({ agente, tipoAgente }) => {
    for (let i = 0; i < perAgent; i++) {
      data.push({
        id: idCounter++,
        fecha: randomDate(weekAgo, now),
        agente,
        tipoAgente,
        cliente: clientesList[Math.floor(Math.random() * clientesList.length)],
        empresa: empresasList[Math.floor(Math.random() * empresasList.length)],
        duracion: randomDuration(),
        resultado: resultadosList[Math.floor(Math.random() * resultadosList.length)],
        sentimiento: sentimientosList[Math.floor(Math.random() * sentimientosList.length)],
        calificacion: Math.floor(Math.random() * 5) + 1,
      });
    }
  });
  return data;
}

const llamadasData: Llamada[] = generateRandomCalls(1200); // cada agente 1200 llamadas

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
      <div className="flex justify-center gap-2">
        <button className="icon-button group p-2 hover:bg-muted rounded-full transition-colors">
          <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          <span className="tooltip -bottom-8 hidden sm:group-hover:inline-flex">Transcripción</span>
        </button>
        <button className="icon-button group p-2 hover:bg-muted rounded-full transition-colors">
          <PhoneCall className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors duration-200" />
          <span className="tooltip -bottom-8 hidden sm:group-hover:inline-flex">Llamar</span>
        </button>
      </div>
    ),
  },
];

// 1. KPIs adicionales y datos de ejemplo para motivos y percepción
const motivosData = [
  { motivo: "Consulta saldo", cantidad: 12 },
  { motivo: "Problema acceso", cantidad: 8 },
  { motivo: "Contratar producto", cantidad: 6 },
  { motivo: "Reclamo", cantidad: 4 },
  { motivo: "Otros", cantidad: 3 },
];
const percepcionClientes = [
  { fecha: new Date("2023-03-10"), nps: 60, sentimiento: 70 },
  { fecha: new Date("2023-03-11"), nps: 62, sentimiento: 68 },
  { fecha: new Date("2023-03-12"), nps: 65, sentimiento: 72 },
  { fecha: new Date("2023-03-13"), nps: 63, sentimiento: 69 },
  { fecha: new Date("2023-03-14"), nps: 67, sentimiento: 75 },
  { fecha: new Date("2023-03-15"), nps: 70, sentimiento: 78 },
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

  // 2. Cálculo de métricas adicionales
  const totalLlamadas = llamadasFiltradas.length;
  const totalBots = llamadasFiltradas.filter(l => l.tipoAgente === "Bot").length;
  const totalHumanos = llamadasFiltradas.filter(l => l.tipoAgente === "Humano").length;
  const pctBots = totalLlamadas ? Math.round((totalBots / totalLlamadas) * 100) : 0;
  const pctHumanos = totalLlamadas ? Math.round((totalHumanos / totalLlamadas) * 100) : 0;
  const tiempoPromedio = totalLlamadas
    ? Math.round(
        llamadasFiltradas.reduce((acc, l) => {
          const [min, seg] = l.duracion.split(":").map(Number);
          return acc + min * 60 + seg;
        }, 0) / totalLlamadas
      )
    : 0;
  const tasaResolucion = totalLlamadas
    ? Math.round(
        (llamadasFiltradas.filter(l => l.resultado === "Convertido").length / totalLlamadas) * 100
      )
    : 0;
  // Nuevas métricas generales
  const avgRating = totalLlamadas
    ? (llamadasFiltradas.reduce((acc, l) => acc + l.calificacion, 0) / totalLlamadas).toFixed(1)
    : '0.0';
  const uniqueClientsCount = new Set(llamadasFiltradas.map(l => l.cliente)).size;

  const [showTranscripcion, setShowTranscripcion] = useState<null | number>(null);
  const [showLlamar, setShowLlamar] = useState<null | number>(null);

  const botsDisponibles = [
    { id: "bot1", nombre: "Call Bot" },
    { id: "bot2", nombre: "Bot Express" },
    { id: "bot3", nombre: "Bot IA Plus" },
  ];

  const [botSeleccionado, setBotSeleccionado] = useState<string>(botsDisponibles[0].id);

  const resumenAgentes = Array.from(
    llamadasData.reduce((acc, l) => {
      const key = l.agente;
      if (!acc.has(key)) acc.set(key, { agente: l.agente, tipo: l.tipoAgente, total: 0, promedio: 0, positivos: 0, negativos: 0, neutros: 0, suma: 0 });
      const item = acc.get(key);
      item.total++;
      item.suma += l.calificacion || 0;
      if (l.sentimiento === "Positivo") item.positivos++;
      if (l.sentimiento === "Negativo") item.negativos++;
      if (l.sentimiento === "Neutro") item.neutros++;
      acc.set(key, item);
      return acc;
    }, new Map())
  ).map(([_, v]) => ({ ...v, promedio: v.total ? (v.suma / v.total).toFixed(1) : "-" }));

  const [expanded, setExpanded] = useState<{ [agente: string]: boolean }>({});

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
                className={tipoAgenteFiltro === f.value ? "" : "bg-white hover:bg-gray-50"}
              >
                {f.label}
              </Button>
            ))}
          </div>
          {/* Botones de calendario y exportar */}
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-white hover:bg-gray-50">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Rango</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" className="bg-white hover:bg-gray-50">
              <Download className="mr-2 h-4 w-4" />
              <span>Exportar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas Principales con KpiCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-6">
        <KpiCard
          title="Positivas"
          value={`${sentimentStats.pctPositivos}%`}
          change={`${sentimentStats.positivos}`}
          changeType="positive"
          icon={<Smile className="h-6 w-6 text-green-500" />}
        />
        <KpiCard
          title="Neutras"
          value={`${sentimentStats.pctNeutros}%`}
          change={`${sentimentStats.neutros}`}
          changeType="neutral"
          icon={<Meh className="h-6 w-6 text-yellow-500" />}
        />
        <KpiCard
          title="Negativas"
          value={`${sentimentStats.pctNegativos}%`}
          change={`${sentimentStats.negativos}`}
          changeType="negative"
          icon={<Frown className="h-6 w-6 text-red-500" />}
        />
        <KpiCard
          title="Total Llamadas"
          value={totalLlamadas.toString()}
          icon={<PhoneOff className="h-6 w-6 text-gray-500" />}
        />
        <KpiCard
          title="Calificación Media"
          value={avgRating}
          icon={<Star className="h-6 w-6 text-yellow-400" />}
        />
        <KpiCard
          title="Clientes Únicos"
          value={uniqueClientsCount.toString()}
          icon={<Users className="h-6 w-6 text-blue-500" />}
        />
      </div>

      {/* Tabla resumen por agente/bot con métricas agregadas */}
      <div className="mb-8 bg-white rounded-lg shadow-card p-6">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" /> Calificación y Sentimiento por Bot/Asesor
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Agente/Bot</th>
              <th className="text-left py-2">Tipo</th>
              <th className="text-center py-2">Llamadas</th>
              <th className="text-center py-2">Promedio</th>
              <th className="text-center py-2">Positivas</th>
              <th className="text-center py-2">Neutras</th>
              <th className="text-center py-2">Negativas</th>
              <th className="text-center py-2">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {resumenAgentes.map(row => (
              <React.Fragment key={row.agente}>
                <tr className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-2 font-medium flex items-center gap-2">{row.agente}</td>
                  <td className="py-2">{row.tipo}</td>
                  <td className="py-2 text-center">{row.total}</td>
                  <td className="py-2 text-center flex items-center justify-center gap-1">{row.promedio}<Star className="h-4 w-4 text-yellow-400" /></td>
                  <td className="py-2 text-center text-green-600">{row.positivos}</td>
                  <td className="py-2 text-center text-yellow-600">{row.neutros}</td>
                  <td className="py-2 text-center text-red-600">{row.negativos}</td>
                  <td className="py-2 text-center">
                    <Button variant="ghost" size="icon" onClick={() => setExpanded(e => ({ ...e, [row.agente]: !e[row.agente] }))}>
                      {expanded[row.agente] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </td>
                </tr>
                {expanded[row.agente] && (
                  <tr className="bg-muted/30">
                    <td colSpan={8} className="p-4">
                      {/* Métricas agregadas por agente/bot */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="font-semibold mb-1">Métricas Generales</div>
                          <div className="text-xs mb-1">Total llamadas: <span className="font-medium">{row.total}</span></div>
                          <div className="text-xs mb-1">Promedio calificación: <span className="font-medium">{row.promedio}</span></div>
                          <div className="text-xs mb-1">Positivas: <span className="font-medium text-green-600">{row.positivos}</span></div>
                          <div className="text-xs mb-1">Neutras: <span className="font-medium text-yellow-600">{row.neutros}</span></div>
                          <div className="text-xs mb-1">Negativas: <span className="font-medium text-red-600">{row.negativos}</span></div>
                        </div>
                        <div>
                          {/* Puedes agregar aquí más métricas agregadas relevantes, por ejemplo: */}
                          <div className="font-semibold mb-1">Percepción y Gestión</div>
                          <div className="text-xs mb-1">Tasa de conversión: <span className="font-medium">{
                            (() => {
                              const llamadas = llamadasData.filter(l => l.agente === row.agente);
                              const convertidas = llamadas.filter(l => l.resultado === "Convertido").length;
                              return llamadas.length ? ((convertidas / llamadas.length) * 100).toFixed(1) + "%" : "-";
                            })()
                          }</span></div>
                          <div className="text-xs mb-1">Duración promedio: <span className="font-medium">{
                            (() => {
                              const llamadas = llamadasData.filter(l => l.agente === row.agente);
                              if (!llamadas.length) return "-";
                              const totalSeg = llamadas.reduce((acc, l) => {
                                const [min, seg] = l.duracion.split(":").map(Number);
                                return acc + min * 60 + seg;
                              }, 0);
                              const prom = Math.round(totalSeg / llamadas.length);
                              return Math.floor(prom/60) + ":" + (prom%60).toString().padStart(2, '0') + " min";
                            })()
                          }</span></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
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

      {/* Gráfica de motivos de llamada */}
      <div className="mb-8 bg-white rounded-lg shadow-card p-6">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <ListFilter className="h-5 w-5" /> Motivos de Llamada
        </h2>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/2">
            {/* Pie chart simple (puedes reemplazar por un componente de chart real) */}
            <div className="flex justify-center">
              <svg width="180" height="180" viewBox="0 0 36 36" className="block">
                {(() => {
                  let acc = 0;
                  const total = motivosData.reduce((a, b) => a + b.cantidad, 0);
                  return motivosData.map((m, i) => {
                    const pct = (m.cantidad / total) * 100;
                    const dash = (pct * 100) / 100;
                    const color = ["#6366f1", "#f59e42", "#10b981", "#ef4444", "#a3a3a3"][i];
                    const el = (
                      <circle
                        key={m.motivo}
                        r="16"
                        cx="18"
                        cy="18"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="3.2"
                        strokeDasharray={`${dash} ${100 - dash}`}
                        strokeDashoffset={100 - acc}
                      />
                    );
                    acc += dash;
                    return el;
                  });
                })()}
              </svg>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            {motivosData.map((m, i) => (
              <div key={m.motivo} className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: ["#6366f1", "#f59e42", "#10b981", "#ef4444", "#a3a3a3"][i] }}></span>
                <span className="font-medium">{m.motivo}</span>
                <span className="ml-auto font-mono">{m.cantidad}</span>
              </div>
            ))}
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
            <button className="icon-button group p-2 hover:bg-muted rounded-full transition-colors">
              <Filter className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              <span className="tooltip -bottom-8 hidden sm:group-hover:inline-flex">Filtrar</span>
            </button>
          </div>
        </div>
        <DataTable 
          columns={columnasLlamadas.map(col =>
            col.key === "actions"
              ? {
                  ...col,
                  render: (_: any, row: any) => (
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Transcripción"
                        onClick={() => setShowTranscripcion(row.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Llamar"
                        onClick={() => setShowLlamar(row.id)}
                      >
                        <PhoneCall className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                }
              : col
          )}
          data={llamadasFiltradas}
        />
      </div>

      {/* Modal de Transcripción */}
      <Dialog open={!!showTranscripcion} onOpenChange={() => setShowTranscripcion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transcripción de Llamada</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-2">
            {/* Aquí iría la transcripción real, ejemplo de texto: */}
            <p>Cliente: Hola, quería consultar mi saldo.<br />Agente: Claro, ¿me puede indicar su número de cuenta?...<br />...</p>
          </div>
          <Button onClick={() => setShowTranscripcion(null)} className="w-full mt-2">Cerrar</Button>
        </DialogContent>
      </Dialog>
      {/* Modal de Llamar */}
      <Dialog open={!!showLlamar} onOpenChange={() => setShowLlamar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Llamada</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-2">
            <p>¿Desea iniciar una llamada con el cliente?</p>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1">Seleccionar Bot que llama</label>
            <Select value={botSeleccionado} onValueChange={setBotSeleccionado}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar bot" />
              </SelectTrigger>
              <SelectContent>
                {botsDisponibles.map(bot => (
                  <SelectItem key={bot.id} value={bot.id}>{bot.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="secondary" onClick={() => setShowLlamar(null)}>Cancelar</Button>
            <Button variant="default" onClick={() => setShowLlamar(null)}>Llamar Ahora</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalisisLlamadas;

