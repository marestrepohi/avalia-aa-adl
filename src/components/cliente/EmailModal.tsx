// New file: EmailModal component for sending emails
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { asistentesData } from '@/lib/asistentes';

interface EmailModalProps {
  clientName: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ clientName }) => {
  const [assistant, setAssistant] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    const asist = asistentesData.find(a => a.id === assistant)?.nombre || assistant;
    toast.success(`Email enviado a ${clientName}`, { description: `Asistente: ${asist}` });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Mail className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enviar Email - {clientName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Seleccionar Asistente</Label>
            <Select onValueChange={setAssistant}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar asistente..." />
              </SelectTrigger>
              <SelectContent>
                {asistentesData.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Asunto</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Asunto del email" />
          </div>
          <div className="grid gap-2">
            <Label>Mensaje</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Escribe tu mensaje..." />
          </div>
          <Button className="w-full" onClick={handleSend}>Enviar Email</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;