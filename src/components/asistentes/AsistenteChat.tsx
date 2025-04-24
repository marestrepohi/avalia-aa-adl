import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import ConversacionesSidebar from './ConversacionesSidebar';
import { ScrollArea } from "@/components/ui/scroll-area";
interface Asistente {
  id: string;
  nombre: string;
  descripcion: string;
  fuentes: number;
  icono: string;
  color: string;
  ultimaConversacion: Date;
}
interface Mensaje {
  id: number;
  contenido: string;
  emisor: 'asistente' | 'usuario';
  timestamp: Date;
  archivos?: Array<{
    nombre: string;
    tipo: string;
    url: string;
  }>;
}
interface AsistenteChatProps {
  asistente: Asistente | null;
  onClose: () => void;
}
const AsistenteChat: React.FC<AsistenteChatProps> = ({
  asistente,
  onClose
}) => {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState<Mensaje[]>([{
    id: 1,
    contenido: `Hola, soy ${asistente?.nombre}. ¿En qué puedo ayudarte hoy?`,
    emisor: 'asistente',
    timestamp: new Date()
  }]);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map(file => ({
        nombre: file.name,
        tipo: file.type,
        url: URL.createObjectURL(file)
      }));
      const newMessage: Mensaje = {
        id: mensajes.length + 1,
        contenido: "Archivos adjuntos:",
        emisor: 'usuario',
        timestamp: new Date(),
        archivos: newFiles
      };
      setMensajes(prev => [...prev, newMessage]);
    }
  };
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (mensaje.trim()) {
      const userMessage: Mensaje = {
        id: mensajes.length + 1,
        contenido: mensaje,
        emisor: 'usuario',
        timestamp: new Date()
      };
      setMensajes(prev => [...prev, userMessage]);
      setMensaje('');
      setTimeout(() => {
        const botMessage: Mensaje = {
          id: mensajes.length + 2,
          contenido: "Estoy procesando tu mensaje. Te responderé en breve basándome en la información disponible.",
          emisor: 'asistente',
          timestamp: new Date()
        };
        setMensajes(prev => [...prev, botMessage]);
      }, 1000);
    }
  };
  if (!asistente) return null;
  return <div className="grid grid-cols-[auto,1fr] h-[calc(100vh-4rem)]">
      <ConversacionesSidebar asistenteId={asistente.id} />
      
      <Card className="border-0 rounded-none">
        <div className="flex flex-col h-full w-full bg-background rounded-lg shadow-card overflow-hidden">
          {/* Header fijo */}
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-white sticky top-0 z-10 shadow-sm">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white border shadow" style={{
              background: asistente.color + '22'
            }}>
                {asistente.icono && <span className="text-xl" style={{
                color: asistente.color
              }}>{/* render icono aquí */}</span>}
              </div>
              <div>
                <div className="font-semibold text-base" style={{
                color: asistente.color
              }}>{asistente.nombre}</div>
                <div className="text-xs text-muted-foreground">{asistente.descripcion}</div>
              </div>
            </div>
            <div className="ml-auto hidden md:block">
              <Button variant="outline" size="sm" onClick={onClose}>Volver</Button>
            </div>
          </div>
          {/* Área de mensajes con scroll, fondo tipo chatgpt */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-muted/60 to-background px-0 py-[25px] md:px-[30px]">
            <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
              {mensajes.map(msg => <div key={msg.id} className={`flex ${msg.emisor === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm break-words ${msg.emisor === 'usuario' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-white border rounded-bl-md'}`}>
                    <p>{msg.contenido}</p>
                    {msg.archivos && <div className="mt-2 space-y-1">
                        {msg.archivos.map((archivo, index) => <div key={index} className="flex items-center gap-2 text-xs">
                            {archivo.tipo.startsWith('image/') ? <img src={archivo.url} alt={archivo.nombre} className="max-w-xs rounded" /> : <span>{archivo.nombre}</span>}
                          </div>)}
                      </div>}
                    <span className="text-xs opacity-50 mt-1 block text-right">
                      {format(msg.timestamp, 'HH:mm')}
                    </span>
                  </div>
                </div>)}
            </div>
          </div>
          {/* Input fijo abajo */}
          <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t bg-white sticky bottom-0 z-10 shadow-inner">
            <Input value={mensaje} onChange={e => setMensaje(e.target.value)} placeholder="Escribe tu mensaje..." className="flex-1 rounded-full bg-muted/60 border-none focus:ring-2 focus:ring-primary" autoFocus />
            <Button type="submit" size="icon" className="rounded-full" style={{
            backgroundColor: asistente.color
          }}>
              <Send className="h-4 w-4" />
            </Button>
            <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileUpload} />
            <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('file-upload')?.click()} className="rounded-full">
              <Paperclip className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>;
};
export default AsistenteChat;