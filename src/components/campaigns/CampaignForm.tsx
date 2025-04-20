
import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CampaignFormProps {
  onClose: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onClose }) => {
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [selectedAudience, setSelectedAudience] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");

  // Mock data for available agents and audiences
  const availableAgents = [
    { id: "1", name: "Agente IA - Ventas" },
    { id: "2", name: "Agente IA - Atención al Cliente" },
    { id: "3", name: "Agente IA - Soporte Técnico" },
  ];

  const availableAudiences = [
    { id: "1", name: "Clientes Premium" },
    { id: "2", name: "Prospectos Calificados" },
    { id: "3", name: "Clientes Inactivos" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre de la Campaña</Label>
          <Input placeholder="Ej: Campaña Verano 2024" />
        </div>
        
        <div className="space-y-2">
          <Label>Objetivo</Label>
          <Input placeholder="Ej: 500 leads" />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Campaña</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email Marketing</SelectItem>
              <SelectItem value="social">Redes Sociales</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="call">Llamadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="scheduled">Programada</SelectItem>
              <SelectItem value="active">Activa</SelectItem>
              <SelectItem value="paused">Pausada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Fecha de Inicio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", { locale: es }) : 
                 <span className="text-muted-foreground">Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Fecha de Fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP", { locale: es }) : 
                 <span className="text-muted-foreground">Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea 
          placeholder="Describe los objetivos y detalles de la campaña..." 
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Audiencia
        </Label>
        <Select value={selectedAudience} onValueChange={setSelectedAudience}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar audiencia" />
          </SelectTrigger>
          <SelectContent>
            {availableAudiences.map(audience => (
              <SelectItem key={audience.id} value={audience.id}>
                {audience.name}
              </SelectItem>
            ))}
            <SelectItem value="custom">Crear nueva audiencia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Agente para llamadas
        </Label>
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar agente IA" />
          </SelectTrigger>
          <SelectContent>
            {availableAgents.map(agent => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button>Guardar Campaña</Button>
      </div>
    </div>
  );
};

export default CampaignForm;
