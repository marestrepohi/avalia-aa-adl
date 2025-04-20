
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Plus, Trash2, Users } from "lucide-react";

interface AudienciasFormProps {
  onClose: () => void;
  onSave?: (audienceData: any) => void;
}

const AudienciasForm: React.FC<AudienciasFormProps> = ({ onClose, onSave }) => {
  const [audienceName, setAudienceName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [customClient, setCustomClient] = useState('');
  
  // Example client data - in a real app this would come from an API
  const availableClients = [
    { id: '1', name: 'Empresas ABC' },
    { id: '2', name: 'Corporación XYZ' },
    { id: '3', name: 'Servicios Tecnológicos' },
    { id: '4', name: 'Consultora Global' },
    { id: '5', name: 'Distribuidora Nacional' },
  ];
  
  const handleAddClient = () => {
    if (customClient.trim()) {
      setSelectedClients([...selectedClients, customClient]);
      setCustomClient('');
    }
  };
  
  const handleRemoveClient = (client: string) => {
    setSelectedClients(selectedClients.filter(c => c !== client));
  };
  
  const handleSelectClient = (clientId: string) => {
    const client = availableClients.find(c => c.id === clientId);
    if (client && !selectedClients.includes(client.name)) {
      setSelectedClients([...selectedClients, client.name]);
    }
  };
  
  const handleSave = () => {
    const audienceData = {
      name: audienceName,
      description,
      clients: selectedClients,
    };
    
    if (onSave) {
      onSave(audienceData);
    }
    onClose();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Nombre de la Audiencia</Label>
        <Input 
          value={audienceName}
          onChange={(e) => setAudienceName(e.target.value)}
          placeholder="Ej: Clientes Premium" 
        />
      </div>
      
      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el objetivo y características de esta audiencia..." 
          className="min-h-[100px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Seleccionar Clientes</Label>
        <Select onValueChange={handleSelectClient}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent>
            {availableClients.map(client => (
              <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2">
        <Input 
          value={customClient}
          onChange={(e) => setCustomClient(e.target.value)}
          placeholder="Añadir cliente personalizado" 
          className="flex-1"
        />
        <Button onClick={handleAddClient} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label>Clientes Seleccionados</Label>
        <div className="border rounded-md p-2 min-h-[100px] max-h-[200px] overflow-y-auto">
          {selectedClients.length > 0 ? (
            <ul className="space-y-1">
              {selectedClients.map((client, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{client}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveClient(client)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No hay clientes seleccionados</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave}>Guardar Audiencia</Button>
      </div>
    </div>
  );
};

export default AudienciasForm;
