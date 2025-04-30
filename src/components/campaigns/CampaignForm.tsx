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
import { asistentesData } from '@/lib/asistentes';

interface CampaignFormProps {
  onClose: () => void;
  onSave?: (payload: {
    name: string;
    objective: string;
    type: string;
    status: string;
    startDate?: Date;
    endDate?: Date;
    description: string;
    audienceId: string;
    assistantId: string;
  }) => void;
  initialData?: {
    name?: string;
    objective?: string;
    type?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    description?: string;
    audienceId?: string;
    assistantId?: string;
  };
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onClose, onSave, initialData = {} }) => {
  const [startDate, setStartDate] = React.useState<Date | undefined>(initialData.startDate);
  const [endDate, setEndDate] = React.useState<Date | undefined>(initialData.endDate);
  const [selectedAudience, setSelectedAudience] = useState<string>(initialData.audienceId || "");
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>(initialData.assistantId || "");

  // Estados controlados para el formulario
  const [campaignName, setCampaignName] = useState<string>(initialData.name || "");
  const [objective, setObjective] = useState<string>(initialData.objective || "");
  const [campaignType, setCampaignType] = useState<string>(initialData.type || "");
  const [status, setStatus] = useState<string>(initialData.status || "");
  const [description, setDescription] = useState<string>(initialData.description || "");

  // Guardar campaña
  const handleSave = () => {
    const payload = {
      name: campaignName,
      objective,
      type: campaignType,
      status,
      startDate,
      endDate,
      description,
      audienceId: selectedAudience,
      assistantId: selectedAssistantId,
    };
    if (onSave) {
      onSave(payload);
    } else {
      console.log('Guardar campaña', payload);
    }
    onClose();
  };

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
          <Input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Ej: Campaña Verano 2024" />
        </div>
        
        <div className="space-y-2">
          <Label>Objetivo</Label>
          <Input value={objective} onChange={e => setObjective(e.target.value)} placeholder="Ej: 500 leads" />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Campaña</Label>
          <Select value={campaignType} onValueChange={setCampaignType}>
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
          <Select value={status} onValueChange={setStatus}>
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
          value={description}
          onChange={e => setDescription(e.target.value)}
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

      {/* Selección de asistente o agente según tipo */}
      <div className="space-y-2">
        <Label>
          {campaignType === 'call' ? 'Seleccionar Agente IA' : 'Seleccionar Asistente'}
        </Label>
        <Select value={selectedAssistantId} onValueChange={setSelectedAssistantId}>
          <SelectTrigger>
            <SelectValue placeholder={campaignType === 'call' ? 'Seleccionar agente' : 'Seleccionar asistente'} />
          </SelectTrigger>
          <SelectContent>
            {campaignType === 'call'
              ? availableAgents.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)
              : asistentesData.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave}>Guardar Campaña</Button>
      </div>
    </div>
  );
};

export default CampaignForm;
