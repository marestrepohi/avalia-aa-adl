import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
interface Conversacion {
  id: string;
  titulo: string;
  fecha: Date;
  ultimoMensaje: string;
}

// Sample conversations data
const conversaciones: Conversacion[] = [{
  id: "1",
  titulo: "Consulta sobre productos",
  fecha: new Date(2025, 3, 20),
  ultimoMensaje: "¿Cuáles son las tasas actuales?"
}, {
  id: "2",
  titulo: "Soporte técnico",
  fecha: new Date(2025, 3, 19),
  ultimoMensaje: "¿Cómo puedo actualizar mi información?"
}, {
  id: "3",
  titulo: "Información de cuenta",
  fecha: new Date(2025, 3, 18),
  ultimoMensaje: "Necesito verificar mi saldo"
}];
const ConversacionesSidebar = ({
  asistenteId
}: {
  asistenteId: string;
}) => {
  return <div className="w-full max-w-xs md:w-72 border-r border-border h-full flex flex-col bg-gradient-to-b from-white to-muted/40">
      <div className="p-4 border-b flex items-center justify-between gap-2 bg-slate-100 rounded-none py-[12px]">
        <h3 className="font-semibold text-lg flex-1 truncate">Conversaciones</h3>
        <Button variant="default" size="icon" className="rounded-full shadow-md hover:scale-105 transition-transform" title="Nuevo chat" aria-label="Nuevo chat">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1">
          {conversaciones.length === 0 && <div className="text-center text-muted-foreground py-8">No hay conversaciones previas</div>}
          {conversaciones.map(conv => <Button key={conv.id} variant="ghost" className="w-full justify-start gap-3 h-auto py-3 px-2 group transition-colors flex items-center font-normal bg-zinc-100 rounded-lg">
              <span className="inline-block w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0">
                {conv.titulo[0]}
              </span>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-medium truncate w-full text-left">{conv.titulo}</span>
                <span className="text-xs text-muted-foreground truncate w-full group-hover:text-primary text-left">
                  {conv.ultimoMensaje}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 shrink-0 hidden md:block">{conv.fecha.toLocaleDateString()}</span>
            </Button>)}
        </div>
      </ScrollArea>
  {/* Botón de Fuentes de Conocimiento eliminado por solicitud */}
    </div>;
};
export default ConversacionesSidebar;