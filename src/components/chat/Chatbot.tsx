
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente virtual con inteligencia de Google Gemini. ¿En qué puedo ayudarte hoy?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Captura una imagen de la pantalla actual
  const captureScreenshot = async (): Promise<string | null> => {
    try {
      // Obtener una captura de la pantalla visible
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      // Dimensiones del viewport
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Dibujar el contenido HTML en el canvas
      const html = document.documentElement;
      const data = new XMLSerializer().serializeToString(html);
      const DOMURL = window.URL;
      const img = new Image();
      const svg = new Blob([data], {type: 'image/svg+xml'});
      const url = DOMURL.createObjectURL(svg);
      
      return new Promise((resolve) => {
        img.onload = function() {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          DOMURL.revokeObjectURL(url);
          resolve(dataUrl);
        };
        img.src = url;
      });
    } catch (error) {
      console.error('Error capturando la pantalla:', error);
      return null;
    }
  };

  // Función para convertir base64 a un blob
  const base64ToBlob = (base64: string): Blob => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: 'image/png' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Añadir mensaje del usuario
      const userMessage: Message = {
        id: messages.length + 1,
        text: message,
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
        
        // Configurar el modelo de Gemini
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-pro-latest",
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
        const systemPrompt = `Eres un asistente virtual profesional y amable para la plataforma de Avalia de Grupo AVAL.
Tu trabajo es ayudar a los usuarios a navegar por la aplicación y resolver sus dudas.
Responde de manera concisa y útil, y utiliza la información visual de la pantalla para proporcionar ayuda contextual.
Habla en español y sé cordial pero profesional.`;

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
          { text: `Pregunta del usuario: ${message}` },
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

        // Enviar el mensaje y procesar la respuesta
        const result = await chat.sendMessageStream(parts);
        let fullResponse = "";

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          
          // Actualizar el mensaje del bot con la respuesta parcial
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: fullResponse, isStreaming: true } 
                : msg
            )
          );
        }

        // Actualizar el mensaje del bot con la respuesta completa
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: fullResponse, isStreaming: false } 
              : msg
          )
        );
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
            <h3 className="font-medium">Asistente Virtual</h3>
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
            <Button type="submit" disabled={isLoading || !message.trim()} size="icon">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
