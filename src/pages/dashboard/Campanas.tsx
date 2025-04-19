
import React, { useState } from "react";
import { Calendar as CalendarIcon, Plus, Play, Pause, Edit, Trash2, Filter } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DataTable from "../../components/ui/dashboard/DataTable";
import { es } from "date-fns/locale";
import SlidePanel from "@/components/ui/dashboard/SlidePanel";
import CampaignForm from "@/components/campaigns/CampaignForm";

// Datos de ejemplo para campañas
const campanasData = [
  {
    id: 1,
    nombre: "Campaña Q1 2023",
    fechaInicio: new Date("2023-01-15"),
    fechaFin: new Date("2023-03-31"),
    estado: "Activa",
    objetivos: "150 leads",
    conversion: "18%",
    responsable: "Carlos Méndez"
  },
  {
    id: 2,
    nombre: "Promo Verano",
    fechaInicio: new Date("2023-06-01"),
    fechaFin: new Date("2023-08-31"),
    estado: "Inactiva",
    objetivos: "300 leads",
    conversion: "22%",
    responsable: "Laura Torres"
  },
  {
    id: 3,
    nombre: "Black Friday",
    fechaInicio: new Date("2023-11-20"),
    fechaFin: new Date("2023-11-30"),
    estado: "Planificada",
    objetivos: "500 leads",
    conversion: "N/A",
    responsable: "Miguel Ángel Ruiz"
  },
  {
    id: 4,
    nombre: "Navidad 2023",
    fechaInicio: new Date("2023-12-01"),
    fechaFin: new Date("2023-12-24"),
    estado: "Planificada", 
    objetivos: "400 leads",
    conversion: "N/A",
    responsable: "Ana María López"
  },
];

// Convert campaigns data to calendar events
const calendarEvents = campanasData.map(campaign => ({
  id: campaign.id,
  title: campaign.nombre,
  start: campaign.fechaInicio,
  end: campaign.fechaFin,
  estado: campaign.estado
}));

const columns = [
  {
    key: "nombre",
    header: "Campaña",
    render: (value: string) => (
      <div className="font-medium text-primary">{value}</div>
    ),
  },
  {
    key: "fechaInicio",
    header: "Fecha Inicio",
    render: (value: Date) => format(value, "dd/MM/yyyy"),
  },
  {
    key: "fechaFin",
    header: "Fecha Fin",
    render: (value: Date) => format(value, "dd/MM/yyyy"),
  },
  {
    key: "estado",
    header: "Estado",
    render: (value: string) => {
      let badgeClass = "badge-neutral";
      if (value === "Activa") badgeClass = "badge-success";
      if (value === "Inactiva") badgeClass = "badge-neutral";
      if (value === "Planificada") badgeClass = "badge-warning";
      return <span className={`badge ${badgeClass}`}>{value}</span>;
    },
  },
  {
    key: "objetivos",
    header: "Objetivos",
  },
  {
    key: "conversion",
    header: "Conversión",
  },
  {
    key: "responsable",
    header: "Responsable",
  },
  {
    key: "actions",
    header: "Acciones",
    render: (_: any, row: any) => (
      <div className="flex items-center gap-2">
        {row.estado === "Activa" ? (
          <button className="icon-button group">
            <Pause className="h-4 w-4 text-warning group-hover:text-warning" />
            <span className="tooltip">Pausar</span>
          </button>
        ) : (
          <button className="icon-button group">
            <Play className="h-4 w-4 text-success group-hover:text-success" />
            <span className="tooltip">Activar</span>
          </button>
        )}
        <button className="icon-button group">
          <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          <span className="tooltip">Editar</span>
        </button>
        <button className="icon-button group">
          <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
          <span className="tooltip">Eliminar</span>
        </button>
      </div>
    ),
  },
];

const Campanas: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Campañas</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Button 
            variant="outline"
            onClick={() => setShowCalendarView(!showCalendarView)}
          >
            {showCalendarView ? "Ver Tabla" : "Ver Calendario"} 
          </Button>
          <Button onClick={() => setShowNewCampaign(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Nueva Campaña
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full sm:w-auto flex-1">
          <input 
            type="text"
            placeholder="Buscar campañas..."
            className="input-field"
          />
        </div>
      </div>

      {showCalendarView ? (
        <div className="bg-white rounded-lg shadow-card p-5">
          <div className="mb-4">
            <h2 className="text-lg font-medium">{format(date || new Date(), 'MMMM yyyy', { locale: es })}</h2>
          </div>
          <div className="border rounded-lg p-4 h-[500px] overflow-auto">
            {calendarEvents.map((event) => {
              // Determinamos el color según el estado
              let bgColor = "bg-gray-100";
              let textColor = "text-gray-700";
              
              if (event.estado === "Activa") {
                bgColor = "bg-green-100";
                textColor = "text-green-700";
              } else if (event.estado === "Planificada") {
                bgColor = "bg-amber-100";
                textColor = "text-amber-700";
              }
              
              return (
                <div 
                  key={event.id}
                  className={`mb-2 p-2 rounded ${bgColor} ${textColor} cursor-pointer hover:shadow-sm transition-shadow`}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs">
                    {format(event.start, "dd/MM/yyyy")} - {format(event.end, "dd/MM/yyyy")}
                  </div>
                </div>
              );
            })}
            
            {calendarEvents.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay eventos para mostrar
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-auto">
          <DataTable 
            columns={columns}
            data={campanasData}
          />
        </div>
      )}

      <SlidePanel
        isOpen={showNewCampaign}
        onClose={() => setShowNewCampaign(false)}
        title="Nueva Campaña"
        width="md"
      >
        <CampaignForm onClose={() => setShowNewCampaign(false)} />
      </SlidePanel>
    </div>
  );
};

export default Campanas;
