
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Mic, MicOff, ScreenShare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { toast } from 'sonner';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isStreaming?: boolean;
};

// Inicializa la API de Google Gemini
const API_KEY = "AIzaSyApyG8CJaxCtOYa-SywwAF7q61dJvoePiE";
const genAI = new GoogleGenerativeAI(API_KEY);

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [hasScreenPermission, setHasScreenPermission] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy Puck, tu asistente virtual con inteligencia de Google Gemini. Puedo ver lo que estás haciendo y responder a tus preguntas en tiempo real. ¿En qué puedo ayudarte hoy?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cargar voces disponibles para TTS
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Intentar seleccionar una voz en español
      const spanishVoice = availableVoices.find(voice => 
        voice.lang.includes('es') || voice.name.includes('Spanish')
      );
      
      if (spanishVoice) {
        setSelectedVoice(spanishVoice);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    // Cargar voces inmediatamente y también cuando estén disponibles
    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Limpiar recursos al desmontar
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (activeSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Solicitar permiso para capturar pantalla
  const requestScreenPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true
      });
      
      streamRef.current = stream;
      setHasScreenPermission(true);
      setShowPermissionDialog(false);
      toast.success("Permiso de pantalla concedido");
    } catch (error) {
      console.error('Error al solicitar permiso de pantalla:', error);
      toast.error("No se pudo obtener permiso para capturar la pantalla");
      setHasScreenPermission(false);
    }
  };

  // Captura una imagen de la pantalla actual
  const captureScreenshot = async (): Promise<string | null> => {
    try {
      if (!hasScreenPermission) {
        setShowPermissionDialog(true);
        return null;
      }

      // Si ya tenemos un stream activo, lo usamos
      let stream = streamRef.current;
      
      // Si no hay stream activo, solicitamos uno nuevo
      if (!stream) {
        stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true
        });
        streamRef.current = stream;
      }

      // Creamos un video element para capturar el frame
      const video = document.createElement('video');
      video.srcObject = stream;
      
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          
          video.onplay = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(null);
              return;
            }
            
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
          };
        };
      });
    } catch (error) {
      console.error('Error capturando la pantalla:', error);
      return null;
    }
  };

  // Iniciar reconocimiento de voz
  const startSpeechRecognition = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast.error('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'es-ES';
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast.info("Escuchando...");
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setMessage(transcript);
      
      // Si es un resultado final y contiene texto significativo, enviar automáticamente
      if (event.results[event.results.length - 1].isFinal && transcript.trim().length > 5) {
        handleSendVoiceMessage(transcript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Error en reconocimiento de voz:', event.error);
      setIsListening(false);
      toast.error("Error al escuchar");
    };

    recognitionRef.current.onend = () => {
      // Reiniciar el reconocimiento si estamos en modo listening
      if (isListening) {
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 300);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current.start();
  };

  // Detener reconocimiento de voz
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Función para sintetizar voz con la voz de Puck
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier síntesis en curso
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      
      // Aplicar voz seleccionada
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Ajustar tono y velocidad para que suene como "Puck"
      utterance.pitch = 1.1;  // Ligeramente más agudo
      utterance.rate = 1.05;  // Ligeramente más rápido
      
      activeSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      
      utterance.onend = () => {
        activeSynthesisRef.current = null;
      };
    }
  };

  const handleSendVoiceMessage = async (transcript: string) => {
    if (transcript.trim()) {
      setMessage('');
      await handleSendMessage(transcript);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (text.trim()) {
      // Añadir mensaje del usuario
      const userMessage: Message = {
        id: messages.length + 1,
        text: text,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Crear un mensaje del bot con estado "streaming"
      const botMessageId = messages.length + 2;
      const initialBotMessage: Message = {
        id: botMessageId,
        text: "",
        sender: 'bot',
        timestamp: new Date(),
        isStreaming: true
      };
      
      setMessages(prev => [...prev, initialBotMessage]);
      setMessage('');
      setIsLoading(true);
      
      try {
        // Capturar la pantalla
        const screenshot = await captureScreenshot();
        
        // Configurar el modelo de Gemini usando el modelo Flash Live
        const model = genAI.getGenerativeModel({ 
          model: "models/gemini-2.0-flash-live-001",
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
        });

        // Indicaciones del sistema para el asistente
        const systemPrompt = `Eres Puck, un asistente virtual amigable y carismático con personalidad alegre y servicial.
Tu trabajo es ayudar a los usuarios a navegar por la aplicación y resolver sus dudas en tiempo real.
Responde siempre en español, de manera concisa y útil, con un toque de personalidad amistosa pero profesional.
Utiliza la información visual de la pantalla para proporcionar ayuda contextual precisa.
Cuando el usuario tenga una duda sobre algo que está viendo en pantalla, analiza la captura y describe lo que ves.`;

        // Crear la solicitud para el chat
        const chat = model.startChat({
          history: [],
          generationConfig: {
            maxOutputTokens: 2048,
          },
        });

        // Preparar el contenido para el mensaje
        const parts: any[] = [
          { text: systemPrompt },
          { text: `Pregunta del usuario: ${text}` },
        ];

        // Añadir la imagen si está disponible
        if (screenshot) {
          parts.push({
            inlineData: {
              mimeType: "image/png",
              data: screenshot.split(',')[1]
            }
          });
          parts.push({ text: "Analiza la captura de pantalla y ayuda al usuario a entender lo que ve y cómo puede interactuar con la interfaz." });
        }

        // Enviar el mensaje y procesar la respuesta en streaming
        const result = await chat.sendMessageStream(parts);
        let fullResponse = "";
        let partialResponse = "";
        let lastSpeakTime = 0;

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          partialResponse += chunkText;
          
          // Actualizar el mensaje del bot con la respuesta parcial
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: fullResponse, isStreaming: true } 
                : msg
            )
          );

          // Hablar en voz alta cada fragmento significativo (cada 15-20 palabras aproximadamente)
          const now = Date.now();
          if (partialResponse.split(' ').length > 15 && now - lastSpeakTime > 1500) {
            speakText(partialResponse);
            partialResponse = "";
            lastSpeakTime = now;
          }
        }

        // Actualizar el mensaje del bot con la respuesta completa
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: fullResponse, isStreaming: false } 
              : msg
          )
        );
        
        // Leer cualquier texto restante
        if (partialResponse.trim()) {
          speakText(partialResponse);
        }
      } catch (error) {
        console.error('Error al procesar la respuesta:', error);
        
        // Actualizar con mensaje de error
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { 
                  ...msg, 
                  text: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.", 
                  isStreaming: false 
                } 
              : msg
          )
        );
        
        toast.error("Error al conectar con el asistente virtual");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSendMessage(message);
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 p-4 rounded-full bg-primary hover:bg-primary/90 shadow-md"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Ventana de chat */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 sm:w-96 h-[500px] flex flex-col bg-white shadow-xl rounded-lg overflow-hidden border z-50">
          {/* Encabezado del chat */}
          <div className="p-3 bg-primary text-white flex justify-between items-center">
            <h3 className="font-medium">Puck - Asistente Virtual</h3>
            <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white hover:bg-primary/90">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Área de mensajes */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-2.5 ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm break-words">{msg.text}</p>
                  {msg.isStreaming && (
                    <div className="mt-1 flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Formulario de entrada */}
          <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={toggleVoiceRecognition}
              disabled={isLoading}
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              title={isListening ? "Detener reconocimiento de voz" : "Iniciar reconocimiento de voz"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
              type="button"
              onClick={() => setShowPermissionDialog(true)}
              disabled={isLoading || hasScreenPermission}
              size="icon"
              variant="outline"
              title="Compartir pantalla"
            >
              <ScreenShare className="h-5 w-5" />
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !message.trim()} 
              size="icon"
              title="Enviar mensaje"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </Card>
      )}

      {/* Diálogo de permisos de pantalla */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permiso para compartir pantalla</DialogTitle>
            <DialogDescription>
              Para proporcionarte una asistencia más efectiva, necesito ver lo que estás viendo. 
              ¿Me permites capturar tu pantalla? Esto me permitirá darte instrucciones más precisas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={requestScreenPermission}>
              Permitir acceso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Chatbot;
