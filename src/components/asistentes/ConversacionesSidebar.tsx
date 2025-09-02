import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from 'lucide-react';
import { useAssistants, type Conversation } from '@/hooks/useAssistants';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversacionDisplay {
  id: string;
  titulo: string;
  fecha: Date;
  ultimoMensaje: string;
}

interface ConversacionesSidebarProps {
  asistenteId: string;
  onConversationSelect?: (conversationId: string) => void;
  onNewConversation?: () => void;
  currentConversationId?: string | null;
}

const ConversacionesSidebar: React.FC<ConversacionesSidebarProps> = ({
  asistenteId,
  onConversationSelect,
  onNewConversation,
  currentConversationId
}) => {
  const [conversaciones, setConversaciones] = useState<ConversacionDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const { getConversations, getMessages } = useAssistants();

  // Sample conversations data (fallback/demo data)
  const sampleConversations: ConversacionDisplay[] = [
    {
      id: "sample-1",
      titulo: "Consulta sobre productos financieros",
      fecha: new Date(2025, 3, 20, 14, 30),
      ultimoMensaje: "¿Cuáles son las tasas de interés actuales para préstamos personales?"
    },
    {
      id: "sample-2", 
      titulo: "Información sobre cuentas de ahorro",
      fecha: new Date(2025, 3, 19, 16, 45),
      ultimoMensaje: "Me interesa abrir una cuenta de ahorros con alto rendimiento"
    },
    {
      id: "sample-3",
      titulo: "Soporte técnico - App móvil",
      fecha: new Date(2025, 3, 18, 10, 15),
      ultimoMensaje: "No puedo acceder a mi cuenta desde la aplicación móvil"
    },
    {
      id: "sample-4",
      titulo: "Consulta de inversiones",
      fecha: new Date(2025, 3, 17, 11, 20),
      ultimoMensaje: "¿Qué opciones de inversión recomiendan para un perfil conservador?"
    }
  ];

  useEffect(() => {
    loadConversations();
  }, [asistenteId]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const realConversations = await getConversations(asistenteId);
      
      // Convert real conversations to display format
      const displayConversations: ConversacionDisplay[] = await Promise.all(
        realConversations.map(async (conv) => {
          try {
            const messages = await getMessages(conv.id);
            const lastMessage = messages[messages.length - 1];
            
            return {
              id: conv.id,
              titulo: conv.title || 'Conversación sin título',
              fecha: new Date(conv.updated_at),
              ultimoMensaje: lastMessage?.content || 'Sin mensajes'
            };
          } catch (err) {
            return {
              id: conv.id,
              titulo: conv.title || 'Conversación sin título',
              fecha: new Date(conv.updated_at),
              ultimoMensaje: 'Sin mensajes'
            };
          }
        })
      );

      // Combine real conversations with sample data
      const allConversations = [...displayConversations, ...sampleConversations];
      setConversaciones(allConversations);
    } catch (err) {
      console.error('Error loading conversations:', err);
      // Fallback to sample data only
      setConversaciones(sampleConversations);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    if (onNewConversation) {
      onNewConversation();
    } else {
      toast.info('Iniciando nueva conversación...');
    }
  };

  const handleConversationClick = (conversationId: string) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    } else {
      toast.info(`Cargando conversación: ${conversationId}`);
    }
  };

  return (
    <div className="w-full max-w-xs md:w-72 border-r border-border h-full flex flex-col bg-gradient-to-b from-white to-muted/40 flex-shrink-0">
      <div className="p-4 border-b flex items-center justify-between gap-2 bg-slate-100 rounded-none py-[12px]">
        <h3 className="font-semibold text-lg flex-1 truncate">Conversaciones</h3>
        <Button 
          variant="default" 
          size="icon" 
          className="rounded-full shadow-md hover:scale-105 transition-transform" 
          title="Nueva conversación" 
          aria-label="Nueva conversación"
          onClick={handleNewConversation}
          disabled={loading}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1">
          {loading && (
            <div className="text-center text-muted-foreground py-8">
              Cargando conversaciones...
            </div>
          )}
          
          {!loading && conversaciones.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay conversaciones previas</p>
              <p className="text-xs">Inicia una nueva conversación</p>
            </div>
          )}
          
          {!loading && conversaciones.map(conv => (
            <Button 
              key={conv.id} 
              variant={currentConversationId === conv.id ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-auto py-3 px-2 group transition-colors flex items-center font-normal rounded-lg ${
                currentConversationId === conv.id 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-zinc-100 hover:bg-zinc-200"
              }`}
              onClick={() => handleConversationClick(conv.id)}
            >
              <span className={`inline-block w-8 h-8 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${
                currentConversationId === conv.id 
                  ? "bg-white/20 text-white" 
                  : "bg-primary/10 text-primary"
              }`}>
                {conv.titulo[0]?.toUpperCase() || 'C'}
              </span>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-medium truncate w-full text-left">
                  {conv.titulo}
                </span>
                <span className={`text-xs truncate w-full text-left ${
                  currentConversationId === conv.id 
                    ? "text-white/70" 
                    : "text-muted-foreground group-hover:text-primary"
                }`}>
                  {conv.ultimoMensaje}
                </span>
              </div>
              <span className={`text-xs whitespace-nowrap ml-2 shrink-0 hidden md:block ${
                currentConversationId === conv.id 
                  ? "text-white/70" 
                  : "text-muted-foreground"
              }`}>
                {format(conv.fecha, 'dd/MM', { locale: es })}
              </span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversacionesSidebar;