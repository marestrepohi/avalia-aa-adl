
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Monitor, Mic, Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

// Define necessary types for Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event & { error: string }) => void;
  onend: (event: Event) => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isScreenCapture?: boolean;
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [isCapturingScreen, setIsCapturingScreen] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    if (isOpen && !webSocketRef.current) {
      try {
        const ws = new WebSocket('ws://localhost:9084');
        
        ws.onopen = () => {
          console.log('WebSocket connection established');
          toast({
            title: "Conexión establecida",
            description: "Conectado al servidor de análisis",
          });
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.response) {
              addBotMessage(data.response);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast({
            title: "Error de conexión",
            description: "No se pudo conectar al servidor",
            variant: "destructive"
          });
        };
        
        ws.onclose = () => {
          console.log('WebSocket connection closed');
        };
        
        webSocketRef.current = ws;
      } catch (error) {
        console.error('Error creating WebSocket:', error);
      }
    }
    
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle screen sharing
  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          // Remove 'cursor' property and use a valid property
          displaySurface: 'monitor' as MediaTrackConstraints['displaySurface'],
        },
        audio: false,
      });
      
      setScreenStream(stream);
      setIsCapturingScreen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
        
        // Send chunks to WebSocket in smaller intervals
        if (chunks.length > 0 && webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
          const blob = new Blob(chunks, { type: 'video/webm' });
          chunks.length = 0; // Clear the chunks array
          
          // Convert to base64 and send
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result?.toString().split(',')[1];
            if (base64data && webSocketRef.current) {
              webSocketRef.current.send(JSON.stringify({
                type: 'screen',
                data: base64data,
                timestamp: new Date().toISOString()
              }));
            }
          };
          reader.readAsDataURL(blob);
        }
      };
      
      mediaRecorder.start(1000); // Capture in 1-second intervals
      
      // Add a message to show screen capture has started
      addUserMessage("Iniciando captura de pantalla...", true);
      
      // Handle stream ending
      stream.getVideoTracks()[0].onended = () => {
        stopScreenCapture();
      };
    } catch (error) {
      console.error('Error starting screen capture:', error);
      toast({
        title: "Error de captura",
        description: "No se pudo iniciar la captura de pantalla",
        variant: "destructive"
      });
    }
  };

  const stopScreenCapture = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    setIsCapturingScreen(false);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Handle speech recognition
  const startListening = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Properly access the speech recognition constructor
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        handleSend(undefined, transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      toast({
        title: "No soportado",
        description: "El reconocimiento de voz no está soportado en este navegador",
        variant: "destructive"
      });
    }
  };

  // Text-to-speech function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      
      // Try to find a Spanish voice
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => voice.lang.includes('es'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Get the last bot message
      const lastBotMsg = [...messages].reverse().find(msg => msg.sender === 'bot');
      if (lastBotMsg) {
        speak(lastBotMsg.text);
      }
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const addUserMessage = (text: string, isScreenCapture = false) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text,
      sender: 'user',
      timestamp: new Date(),
      isScreenCapture
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  };
  
  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text,
      sender: 'bot',
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  };

  const handleSend = (e?: React.FormEvent, voiceText?: string) => {
    if (e) e.preventDefault();
    
    const messageText = voiceText || message;
    if (messageText.trim()) {
      // Add user message
      addUserMessage(messageText);
      setMessage('');
      
      // Send message to WebSocket
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        webSocketRef.current.send(JSON.stringify({
          type: 'text',
          text: messageText,
          timestamp: new Date().toISOString()
        }));
      } else {
        // Fallback if WebSocket is not connected
        setTimeout(() => {
          addBotMessage("Lo siento, parece que no estoy conectado al servidor de análisis. Por favor, intenta de nuevo más tarde.");
        }, 1000);
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors z-50"
        aria-label="Abrir chat"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Asistente Virtual</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => isCapturingScreen ? stopScreenCapture() : startScreenCapture()} 
              className={isCapturingScreen ? "bg-red-100 text-red-600 hover:bg-red-200" : ""}
            >
              <Monitor className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={startListening} disabled={isListening}>
              <Mic className={`h-5 w-5 ${isListening ? "text-primary animate-pulse" : ""}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleSpeech}>
              {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleChat}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.isScreenCapture && <p className="font-medium mb-1">📷 Captura de pantalla</p>}
                <p>{msg.text}</p>
                <p className="text-xs opacity-70 text-right mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Screen preview area */}
        {isCapturingScreen && (
          <div className="border-t p-2">
            <div className="relative w-full h-32 bg-black/10 rounded flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="max-h-full max-w-full rounded"
              />
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                Grabando
              </div>
            </div>
          </div>
        )}

        {/* Input area */}
        <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Chatbot;
