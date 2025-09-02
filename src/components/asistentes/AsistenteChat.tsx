import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Paperclip, Settings, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import ConversacionesSidebar from './ConversacionesSidebar';
import { ScrollArea } from "@/components/ui/scroll-area";
import SlidePanel from '../ui/dashboard/SlidePanel';
import FuentesDocumentos from './FuentesDocumentos';
import { Tabs } from '../ui/dashboard/FormControls';
import { useAssistants, type Message, type Assistant } from '@/hooks/useAssistants';
import { toast } from 'sonner';

interface Asistente {
  id: string;
  nombre: string;
  descripcion: string;
  fuentes: number;
  icono: string;
  color: string;
  ultimaConversacion: Date;
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
  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("detalles");
  const [editDescription, setEditDescription] = useState(asistente?.descripcion || '');
  const [editTemperature, setEditTemperature] = useState(70);
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { 
    loading, 
    error, 
    sendMessage, 
    getMessages, 
    getAssistants,
    updateAssistant 
  } = useAssistants();

  // Load assistant data and initial conversation
  useEffect(() => {
    const loadAssistant = async () => {
      if (!asistente) return;
      
      try {
        const assistants = await getAssistants();
        const foundAssistant = assistants.find(a => a.id === asistente.id);
        
        if (foundAssistant) {
          setAssistant(foundAssistant);
          setEditDescription(foundAssistant.description);
          setEditTemperature(Math.round(foundAssistant.temperature * 100));
        } else {
          // If not found in database, show welcome message
          const welcomeMessage: Message = {
            id: 'welcome',
            conversation_id: '',
            role: 'assistant',
            content: `Hola, soy ${asistente.nombre}. ¿En qué puedo ayudarte hoy?`,
            created_at: new Date().toISOString()
          };
          setMensajes([welcomeMessage]);
        }
      } catch (err) {
        console.error('Error loading assistant:', err);
        toast.error('Error al cargar el asistente');
      }
    };

    loadAssistant();
  }, [asistente, getAssistants]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      toast.info('Funcionalidad de archivos próximamente disponible');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim() || !asistente || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: currentConversationId || '',
      role: 'user',
      content: mensaje,
      created_at: new Date().toISOString()
    };

    // Add user message immediately
    setMensajes(prev => [...prev, userMessage]);
    setMensaje('');

    try {
      // Send message to backend
      const response = await sendMessage(
        asistente.id,
        mensaje,
        currentConversationId || undefined
      );

      if (response) {
        // Update conversation ID if this is a new conversation
        if (!currentConversationId && response.conversationId) {
          setCurrentConversationId(response.conversationId);
        }

        // Add assistant response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          conversation_id: response.conversationId || currentConversationId || '',
          role: 'assistant',
          content: response.response,
          created_at: new Date().toISOString()
        };

        setMensajes(prev => [...prev, assistantMessage]);
      } else {
        toast.error('Error al enviar el mensaje');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Error al comunicarse con el asistente');
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (mensaje.trim()) {
        handleSend(e as any);
      }
    }
  };

  const handleOpenEditPanel = () => {
    setIsEditPanelOpen(true);
    if (assistant) {
      setEditDescription(assistant.description);
      setEditTemperature(Math.round(assistant.temperature * 100));
    }
  };

  const handleSaveEditPanel = async () => {
    if (!assistant) return;

    try {
      const updatedAssistant = await updateAssistant(assistant.id, {
        description: editDescription,
        temperature: editTemperature / 100
      });

      if (updatedAssistant) {
        setAssistant(updatedAssistant);
        toast.success('Asistente actualizado correctamente');
        setIsEditPanelOpen(false);
      }
    } catch (err) {
      console.error('Error updating assistant:', err);
      toast.error('Error al actualizar el asistente');
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      // Handle sample conversations
      if (conversationId.startsWith('sample-')) {
        const sampleMessages = getSampleMessages(conversationId);
        setMensajes(sampleMessages);
        setCurrentConversationId(conversationId);
        return;
      }

      // Load real conversation
      const messages = await getMessages(conversationId);
      setMensajes(messages);
      setCurrentConversationId(conversationId);
    } catch (err) {
      console.error('Error loading conversation:', err);
      toast.error('Error al cargar la conversación');
    }
  };

  const getSampleMessages = (conversationId: string): Message[] => {
    const sampleConversations: { [key: string]: Message[] } = {
      'sample-1': [
        {
          id: 'sample-1-1',
          conversation_id: conversationId,
          role: 'user',
          content: '¿Cuáles son las tasas de interés actuales para préstamos personales?',
          created_at: new Date(2025, 3, 20, 14, 30).toISOString()
        },
        {
          id: 'sample-1-2',
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Hola! Me da mucho gusto ayudarte con información sobre nuestros préstamos personales. Actualmente manejamos las siguientes tasas:\n\n• Préstamos hasta $50,000: 12.5% - 18.5% anual\n• Préstamos de $50,001 a $200,000: 11.0% - 16.5% anual\n• Préstamos superiores a $200,000: 9.5% - 14.0% anual\n\nLas tasas específicas dependen de tu historial crediticio, ingresos comprobables y el monto solicitado. ¿Te gustaría que revisemos qué tasa podrías obtener según tu perfil?',
          created_at: new Date(2025, 3, 20, 14, 31).toISOString()
        },
        {
          id: 'sample-1-3',
          conversation_id: conversationId,
          role: 'user',
          content: 'Sí, me interesa un préstamo de $80,000. ¿Qué documentos necesito?',
          created_at: new Date(2025, 3, 20, 14, 32).toISOString()
        },
        {
          id: 'sample-1-4',
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Perfecto! Para un préstamo de $80,000 necesitarás:\n\n📋 **Documentos requeridos:**\n• Identificación oficial vigente\n• Comprobante de domicilio (no mayor a 3 meses)\n• Comprobantes de ingresos (últimos 3 meses)\n• Estados de cuenta bancarios (últimos 3 meses)\n• RFC con homoclave\n• CURP\n\n💰 **Para tu monto de $80,000:**\n• Tasa estimada: 11.0% - 16.5% anual\n• Plazo: hasta 48 meses\n• Pago mensual aproximado: $2,100 - $2,400\n\n¿Te gustaría agendar una cita para iniciar el proceso?',
          created_at: new Date(2025, 3, 20, 14, 33).toISOString()
        }
      ],
      'sample-2': [
        {
          id: 'sample-2-1',
          conversation_id: conversationId,
          role: 'user',
          content: 'Me interesa abrir una cuenta de ahorros con alto rendimiento',
          created_at: new Date(2025, 3, 19, 16, 45).toISOString()
        },
        {
          id: 'sample-2-2',
          conversation_id: conversationId,
          role: 'assistant',
          content: '¡Excelente decisión! Tenemos varias opciones de cuentas de ahorro que te pueden convenir:\n\n🏆 **Cuenta Premium Plus:**\n• Rendimiento: 8.5% anual\n• Saldo mínimo: $100,000\n• Sin comisiones por manejo\n\n💎 **Cuenta Inversión Smart:**\n• Rendimiento: 7.2% anual\n• Saldo mínimo: $25,000\n• Acceso a instrumentos de inversión\n\n🌟 **Cuenta Ahorro Dinámico:**\n• Rendimiento: 6.0% anual\n• Saldo mínimo: $5,000\n• Tarjeta de débito incluida\n\n¿Con qué monto inicial estarías pensando abrir tu cuenta?',
          created_at: new Date(2025, 3, 19, 16, 46).toISOString()
        }
      ],
      'sample-3': [
        {
          id: 'sample-3-1',
          conversation_id: conversationId,
          role: 'user',
          content: 'No puedo acceder a mi cuenta desde la aplicación móvil',
          created_at: new Date(2025, 3, 18, 10, 15).toISOString()
        },
        {
          id: 'sample-3-2',
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Lamento que tengas problemas para acceder a tu cuenta. Te ayudo a resolverlo paso a paso:\n\n🔧 **Soluciones comunes:**\n\n1. **Verifica tu conexión a internet**\n2. **Actualiza la app** desde tu tienda de aplicaciones\n3. **Reinicia la aplicación** completamente\n4. **Verifica tus credenciales** (usuario y contraseña)\n\n📱 **Si el problema persiste:**\n• ¿Qué mensaje de error ves exactamente?\n• ¿Has cambiado tu contraseña recientemente?\n• ¿Tienes la versión más reciente de la app?\n\n¿Podrías contarme qué sucede cuando intentas ingresar?',
          created_at: new Date(2025, 3, 18, 10, 16).toISOString()
        }
      ],
      'sample-4': [
        {
          id: 'sample-4-1',
          conversation_id: conversationId,
          role: 'user',
          content: '¿Qué opciones de inversión recomiendan para un perfil conservador?',
          created_at: new Date(2025, 3, 17, 11, 20).toISOString()
        },
        {
          id: 'sample-4-2',
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Para un perfil conservador, tenemos excelentes opciones que priorizan la seguridad y estabilidad:\n\n🛡️ **Inversiones de Bajo Riesgo:**\n\n• **Certificados de Depósito (CEDES)**\n  - Rendimiento: 9.5% - 11.0% anual\n  - Plazo: 28 días a 3 años\n  - Capital garantizado\n\n• **Fondos de Inversión Conservadores**\n  - Rendimiento histórico: 8.0% - 10.5% anual\n  - Diversificación automática\n  - Liquidez diaria\n\n• **Pagarés Bancarios**\n  - Rendimiento: 8.8% - 10.2% anual\n  - Plazo fijo\n  - Respaldado por el banco\n\n💡 **Recomendación:** Para iniciar, sugiero una combinación de 60% CEDES y 40% fondos conservadores.\n\n¿Con qué monto estarías pensando comenzar a invertir?',
          created_at: new Date(2025, 3, 17, 11, 21).toISOString()
        }
      ]
    };

    return sampleConversations[conversationId] || [];
  };

  const handleNewConversation = () => {
    setMensajes([]);
    setCurrentConversationId(null);
    
    // Add welcome message for new conversation
    const welcomeMessage: Message = {
      id: 'welcome-new',
      conversation_id: '',
      role: 'assistant',
      content: `¡Hola! Soy ${asistente?.nombre}. ¿En qué puedo ayudarte hoy?`,
      created_at: new Date().toISOString()
    };
    setMensajes([welcomeMessage]);
    toast.success('Nueva conversación iniciada');
  };

  if (!asistente) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] h-screen w-full min-h-0 overflow-hidden">
      <div className="hidden md:block h-full min-h-0 overflow-hidden border-r bg-gradient-to-b from-white to-muted/40">
        <ConversacionesSidebar 
          asistenteId={asistente.id} 
          onConversationSelect={loadConversation}
          onNewConversation={handleNewConversation}
          currentConversationId={currentConversationId}
        />
      </div>
      
      <Card className="border-0 rounded-none h-full">
        <div className="flex flex-col h-full w-full bg-background overflow-hidden min-h-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full flex items-center justify-center bg-white border shadow" style={{ background: asistente.color + '22' }}>
                <span className="text-xl" style={{ color: asistente.color }}>🤖</span>
                <span className="absolute -bottom-0 -right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
              </div>
              <div>
                <div className="font-semibold text-base" style={{ color: asistente.color }}>
                  {assistant?.name || asistente.nombre}
                </div>
                <div className="text-xs text-muted-foreground">
                  {assistant?.description || asistente.descripcion}
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleOpenEditPanel} className="hidden md:flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>Volver</Button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-muted/60 to-background px-2 py-4 md:px-4">
            <div className="flex flex-col gap-4 w-full mx-auto">
              {mensajes.map(msg => (
                <div key={msg.id} className={`flex items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 border flex items-center justify-center text-[10px] font-semibold text-primary">AI</div>
                  )}
                  <div className={`max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl shadow-sm text-sm break-words ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-white border rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-50 mt-1 block text-right">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </span>
                  </div>
                  {msg.role === 'user' && (
                    <div className="ml-2 h-8 w-8 rounded-full bg-secondary/50 border flex items-center justify-center text-[10px] font-semibold text-secondary-foreground">Tú</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-end justify-start">
                  <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 border flex items-center justify-center text-[10px] font-semibold text-primary">AI</div>
                  <div className="max-w-[75%] p-4 rounded-2xl shadow-sm bg-white border rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Escribiendo...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="px-3 md:px-4 py-3 border-t bg-white sticky bottom-0 z-10">
            <div className="flex items-end gap-2">
              <Textarea
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje (Shift+Enter para nueva línea)"
                rows={1}
                className="flex-1 resize-none bg-muted/60 border-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                disabled={loading}
              />
              <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileUpload} />
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={() => document.getElementById('file-upload')?.click()} 
                className="rounded-xl"
                disabled={loading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                type="submit" 
                size="icon" 
                disabled={!mensaje.trim() || loading} 
                className="rounded-xl" 
                style={{ backgroundColor: asistente.color }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Edit Panel */}
      <SlidePanel
        isOpen={isEditPanelOpen}
        onClose={() => setIsEditPanelOpen(false)}
        title="Editar Asistente"
        width="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditPanelOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditPanel} disabled={loading}>
              Guardar Cambios
            </Button>
          </div>
        }
      >
        <Tabs
          tabs={[
            { id: "detalles", label: "Detalles" },
            { id: "configuracion", label: "Configuración" },
            { id: "fuentes", label: "Fuentes" }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="space-y-6 mt-6">
          {activeTab === "detalles" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Asistente</label>
                <Input value={assistant?.name || asistente?.nombre || ''} disabled className="bg-muted" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe el propósito y funcionalidad del asistente..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {activeTab === "configuracion" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Modelo de Lenguaje</label>
                <Input value={assistant?.model || 'gemini-1.5-flash'} disabled className="bg-muted" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Instrucciones del Sistema</label>
                <Textarea
                  value={assistant?.system_prompt || ''}
                  placeholder="Define el comportamiento y personalidad del asistente..."
                  rows={6}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Temperatura: {editTemperature}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editTemperature}
                  onChange={(e) => setEditTemperature(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Controla la creatividad de las respuestas (0 = muy conservador, 100 = muy creativo)
                </div>
              </div>
            </div>
          )}

          {activeTab === "fuentes" && (
            <FuentesDocumentos asistenteId={asistente?.id || "current"} />
          )}
        </div>
      </SlidePanel>
    </div>
  );
};

export default AsistenteChat;