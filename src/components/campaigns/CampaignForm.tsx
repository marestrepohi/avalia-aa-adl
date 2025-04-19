
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CampaignFormProps {
  onClose: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onClose }) => {
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre de la Campaña</label>
          <Input placeholder="Ej: Campaña Verano 2024" />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Objetivo</label>
          <Input placeholder="Ej: 500 leads" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha de Inicio</label>
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
          <label className="text-sm font-medium">Fecha de Fin</label>
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
        <label className="text-sm font-medium">Responsable</label>
        <Input placeholder="Nombre del responsable" />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button>Guardar Campaña</Button>
      </div>
    </div>
  );
};

export default CampaignForm;
