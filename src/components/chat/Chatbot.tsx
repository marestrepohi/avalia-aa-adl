
import React, { useState, useRef, useEffect } from 'react';
import { Monitor, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturingScreen, setIsCapturingScreen] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
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
              console.log('Received response:', data.response);
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
  const toggleScreenCapture = async () => {
    if (isCapturingScreen) {
      stopScreenCapture();
    } else {
      await startScreenCapture();
    }
  };

  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          displaySurface: 'monitor' as DisplayCaptureSurfaceType,
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
      
      // Handle stream ending
      stream.getVideoTracks()[0].onended = () => {
        stopScreenCapture();
      };

      // Since screen capture has started, open the container
      setIsOpen(true);
      
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

  const toggleChat = () => {
    if (isOpen && isCapturingScreen) {
      // If we're closing the chat but screen is capturing, stop capture
      stopScreenCapture();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button
          onClick={toggleScreenCapture}
          className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Capturar pantalla"
        >
          <Monitor className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-64 bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header with close button */}
          <div className="flex items-center justify-between border-b p-2">
            <h3 className="text-sm font-medium">
              {isCapturingScreen ? "Capturando pantalla" : "Asistente"}
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={toggleChat}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Screen preview area */}
          {isCapturingScreen && (
            <div className="p-2">
              <div className="relative w-full h-40 bg-black/10 rounded">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-contain rounded"
                />
                <div className="absolute top-1 left-1 bg-red-600 text-white text-[10px] px-1 py-0.5 rounded-full animate-pulse">
                  Grabando
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Chatbot;
