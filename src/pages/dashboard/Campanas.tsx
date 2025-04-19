import React, { useState } from "react";
import { Calendar as CalendarIcon, Plus, Play, Pause, Edit, Trash2, Filter, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DataTable from "../../components/ui/dashboard/DataTable";
import { es } from "date-fns/locale";
import SlidePanel from "@/components/ui/dashboard/SlidePanel";
import CampaignForm from "@/components/campaigns/CampaignForm";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

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

const CalendarView = ({ calendarEvents }: { calendarEvents: any[] }) => {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <Card className="p-6">
      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={es}
            className="rounded-md border w-full"
          />
        </div>
        <div className="space-y-4">
          <h3 className="font-medium text-lg">
            Campañas para {format(date, "MMMM yyyy", { locale: es })}
          </h3>
          <div className="space-y-2">
            {calendarEvents.map((event) => {
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
                  className={`p-4 rounded-lg ${bgColor} ${textColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm mt-1">
                        {format(event.start, "dd/MM/yyyy")} - {format(event.end, "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="icon-button">
                        <Users className="h-4 w-4" />
                      </button>
                      <button className="icon-button">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {calendarEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay campañas programadas para este período
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const Campanas: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const isMobile = useIsMobile();
  
  // Convert campaigns data to calendar events
  const calendarEvents = campanasData.map(campaign => ({
    id: campaign.id,
    title: campaign.nombre,
    start: campaign.fechaInicio,
    end: campaign.fechaFin,
    estado: campaign.estado
  }));

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
        <CalendarView calendarEvents={calendarEvents} />
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
        width={isMobile ? "full" : "lg"}
      >
        <CampaignForm onClose={() => setShowNewCampaign(false)} />
      </SlidePanel>
    </div>
  );
};

export default Campanas;
