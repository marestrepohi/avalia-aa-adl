
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Phone } from 'lucide-react';

interface CallModalProps {
  clientName: string;
}

const CallModal: React.FC<CallModalProps> = ({ clientName }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Phone className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Llamada - {clientName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Tipo de Llamada</Label>
            <RadioGroup defaultValue="encuesta">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="encuesta" id="encuesta" />
                <Label htmlFor="encuesta">Encuesta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="siguiente-producto" id="siguiente-producto" />
                <Label htmlFor="siguiente-producto">Próximo Mejor Producto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personalizado" id="personalizado" />
                <Label htmlFor="personalizado">Producto Personalizado</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label>Seleccionar Agente</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar agente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agente1">Carlos Rodríguez</SelectItem>
                <SelectItem value="agente2">Ana López</SelectItem>
                <SelectItem value="agente3">Juan Pérez</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full">Iniciar Llamada</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallModal;
