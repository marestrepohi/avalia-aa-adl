
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, User } from 'lucide-react';
import FuentesDocumentos from './FuentesDocumentos';

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
}

interface AsistenteChatProps {
  asistente: Asistente | null;
  onClose: () => void;
  activeTab: 'asistentes' | 'fuentes';
  onTabChange: (tab: string) => void;
}

const AsistenteChat: React.FC<AsistenteChatProps> = ({ 
  asistente, 
  onClose,
  activeTab,
  onTabChange
}) => {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 1,
      contenido: `Hola, soy ${asistente?.nombre}. ¿En qué puedo ayudarte hoy?`,
      emisor: 'asistente',
      timestamp: new Date(),
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mensaje.trim()) {
      // Add user message
      const userMessage: Mensaje = {
        id: mensajes.length + 1,
        contenido: mensaje,
        emisor: 'usuario',
        timestamp: new Date(),
      };
      
      setMensajes(prev => [...prev, userMessage]);
      setMensaje('');
      
      // Simulate bot response after a short delay
      setTimeout(() => {
        const botMessage: Mensaje = {
          id: mensajes.length + 2,
          contenido: "Estoy analizando tu consulta. Te proporcionaré información basada en las fuentes disponibles en mi base de conocimiento.",
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
        <Tabs 
          value={activeTab} 
          onValueChange={onTabChange}
          className="px-4"
        >
          <TabsList>
            <TabsTrigger value="asistentes">Chat</TabsTrigger>
            <TabsTrigger value="fuentes">Fuentes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <TabsContent value="asistentes" className="m-0 focus:outline-none">
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
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-muted rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.contenido}</p>
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
            <Input 
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1"
            />
            <Button type="submit" size="icon" style={{ backgroundColor: asistente.color }}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </TabsContent>
      
      <TabsContent value="fuentes" className="m-0 p-4 focus:outline-none">
        <FuentesDocumentos asistenteId={asistente.id} />
      </TabsContent>
    </Card>
  );
};

export default AsistenteChat;
