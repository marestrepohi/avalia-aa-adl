
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Book } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import FuentesDocumentos from './FuentesDocumentos';

interface Conversacion {
  id: string;
  titulo: string;
  fecha: Date;
  ultimoMensaje: string;
}

// Sample conversations data
const conversaciones: Conversacion[] = [
  {
    id: "1",
    titulo: "Consulta sobre productos",
    fecha: new Date(2025, 3, 20),
    ultimoMensaje: "¿Cuáles son las tasas actuales?"
  },
  {
    id: "2",
    titulo: "Soporte técnico",
    fecha: new Date(2025, 3, 19),
    ultimoMensaje: "¿Cómo puedo actualizar mi información?"
  },
  {
    id: "3",
    titulo: "Información de cuenta",
    fecha: new Date(2025, 3, 18),
    ultimoMensaje: "Necesito verificar mi saldo"
  }
];

const ConversacionesSidebar = ({ asistenteId }: { asistenteId: string }) => {
  return (
    <div className="w-64 border-r border-border h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Conversaciones</h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversaciones.map((conv) => (
            <Button
              key={conv.id}
              variant="ghost"
              className="w-full justify-start gap-2 h-auto py-3"
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <div className="flex flex-col items-start truncate">
                <span className="text-sm font-medium">{conv.titulo}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {conv.ultimoMensaje}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Book className="h-4 w-4" />
              Fuentes de Conocimiento
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Fuentes de Conocimiento</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FuentesDocumentos asistenteId={asistenteId} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ConversacionesSidebar;
