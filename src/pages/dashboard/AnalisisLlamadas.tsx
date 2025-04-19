
import React, { useState } from "react";
import { Calendar as CalendarIcon, Filter, Download, BarChart, Clock, PhoneCall, Users, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import DataTable from "../../components/ui/dashboard/DataTable";
import { cn } from "@/lib/utils";

// Datos de KPIs
const kpiData = [
  { title: "Total Llamadas", value: "1,248", icon: <PhoneCall className="h-6 w-6" />, change: "+12.5%" },
  { title: "Duración Media", value: "4:32", icon: <Clock className="h-6 w-6" />, change: "-0.8%" },
  { title: "Tasa de Conversión", value: "24.6%", icon: <BarChart className="h-6 w-6" />, change: "+3.2%" },
  { title: "Agentes Activos", value: "8", icon: <Users className="h-6 w-6" />, change: "0%" },
];

// Datos de ejemplo para llamadas
const llamadasData = [
  {
    id: 1,
    fecha: new Date("2023-03-15T10:23:00"),
    agente: "Laura Santos",
    cliente: "Martín Gutiérrez",
    empresa: "Informática Global",
    duracion: "05:42",
    resultado: "Convertido",
    sentimiento: "Positivo"
  },
  {
    id: 2,
    fecha: new Date("2023-03-15T11:05:00"),
    agente: "Carlos Mendoza",
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
    cliente: "Roberto Fernández",
    empresa: "Construcciones Modernas",
    duracion: "07:55",
    resultado: "Convertido",
    sentimiento: "Positivo"
  },
  {
    id: 4,
    fecha: new Date("2023-03-15T14:15:00"),
    agente: "Miguel Ángel Ruiz",
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
    cliente: "Javier García",
    empresa: "Textiles del Norte",
    duracion: "04:12",
    resultado: "Seguimiento",
    sentimiento: "Neutro"
  },
];

// Columnas para la tabla de llamadas
const columnasLlamadas = [
  {
    key: "fecha",
    header: "Fecha y Hora",
    render: (value: Date) => format(value, "dd/MM/yyyy HH:mm"),
  },
  {
    key: "agente",
    header: "Agente",
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
    key: "sentimiento",
    header: "Sentimiento",
    render: (value: string) => {
      let badgeClass = "badge-neutral";
      if (value === "Positivo") badgeClass = "badge-success";
      if (value === "Negativo") badgeClass = "badge-danger";
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

// Datos para el gráfico de barras
const chartData = [
  { dia: "Lun", llamadas: 120, conversiones: 28 },
  { dia: "Mar", llamadas: 150, conversiones: 32 },
  { dia: "Mié", llamadas: 180, conversiones: 48 },
  { dia: "Jue", llamadas: 165, conversiones: 38 },
  { dia: "Vie", llamadas: 190, conversiones: 52 },
];

const AnalisisLlamadas: React.FC = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Análisis de Llamadas</h1>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                      {format(dateRange.to, "LLL dd, y", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y", { locale: es })
                  )
                ) : (
                  <span>Seleccionar período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg shadow-card p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm text-muted-foreground font-medium">{kpi.title}</h3>
                <div className="text-2xl font-semibold mt-1">{kpi.value}</div>
                <div className={`text-xs mt-1 ${
                  kpi.change.startsWith("+") ? "text-success" : 
                  kpi.change.startsWith("-") ? "text-danger" : "text-muted-foreground"
                }`}>
                  {kpi.change} vs. período anterior
                </div>
              </div>
              <div className="p-2 rounded-full bg-primary-light text-primary">
                {kpi.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Gráfico y Datos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-card p-5 overflow-hidden">
          <h2 className="text-lg font-medium mb-4">Tendencia de Llamadas</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full flex items-end justify-around">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative w-12 mb-1">
                    <div 
                      className="absolute bottom-0 w-full bg-primary/20 rounded-t"
                      style={{ height: `${(data.llamadas / 200) * 100}%`, maxHeight: "180px" }}
                    />
                    <div 
                      className="absolute bottom-0 w-full bg-primary rounded-t"
                      style={{ height: `${(data.conversiones / 200) * 100}%`, maxHeight: "180px" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{data.dia}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center mt-4 gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/20 rounded"></div>
              <span className="text-sm">Total Llamadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span className="text-sm">Conversiones</span>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1 bg-white rounded-lg shadow-card p-5 overflow-hidden">
          <h2 className="text-lg font-medium mb-4">Resumen de Sentimiento</h2>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-32 h-32 rounded-full border-8 border-primary relative flex items-center justify-center">
              <div className="text-3xl font-bold">76%</div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-muted-foreground">Índice de Satisfacción</div>
              <div className="mt-2 text-sm">
                <span className="font-medium">782</span> llamadas positivas
              </div>
              <div className="text-sm">
                <span className="font-medium">245</span> llamadas neutras
              </div>
              <div className="text-sm">
                <span className="font-medium">221</span> llamadas negativas
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Llamadas */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Registro de Llamadas Recientes</h2>
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
          data={llamadasData}
        />
      </div>
    </div>
  );
};

export default AnalisisLlamadas;
