
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Paperclip, Image } from 'lucide-react';
import { format } from 'date-fns';

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

const AsistenteChat: React.FC<AsistenteChatProps> = ({ asistente, onClose }) => {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 1,
      contenido: `Hola, soy ${asistente?.nombre}. ¿En qué puedo ayudarte hoy?`,
      emisor: 'asistente',
      timestamp: new Date(),
    }
  ]);

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
        timestamp: new Date(),
      };
      
      setMensajes(prev => [...prev, userMessage]);
      setMensaje('');
      
      setTimeout(() => {
        const botMessage: Mensaje = {
          id: mensajes.length + 2,
          contenido: "Estoy procesando tu mensaje. Te responderé en breve basándome en la información disponible.",
          emisor: 'asistente',
          timestamp: new Date(),
        };
        setMensajes(prev => [...prev, botMessage]);
      }, 1000);
    }
  };

  if (!asistente) return null;

  return (
    <Card className="p-0">
      <div className="border-b border-border">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-medium">{asistente.nombre}</h2>
            <p className="text-sm text-muted-foreground">{asistente.descripcion}</p>
          </div>
        </div>
      </div>
      
      <div className="h-[calc(80vh-220px)] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mensajes.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.emisor === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.emisor === 'usuario' 
                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                    : 'bg-muted rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.contenido}</p>
                {msg.archivos && (
                  <div className="mt-2 space-y-1">
                    {msg.archivos.map((archivo, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {archivo.tipo.startsWith('image/') ? (
                          <img 
                            src={archivo.url} 
                            alt={archivo.nombre}
                            className="max-w-xs rounded"
                          />
                        ) : (
                          <span>{archivo.nombre}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <span className="text-xs opacity-50 mt-1 block">
                  {format(msg.timestamp, 'HH:mm')}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSend} className="border-t p-4 space-y-2">
          <div className="flex gap-2">
            <Input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input 
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1"
            />
            <Button type="submit" size="icon" style={{ backgroundColor: asistente.color }}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default AsistenteChat;
