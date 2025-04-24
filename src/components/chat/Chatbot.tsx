import React, { useState } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Add user message
      const newMessage: Message = {
        id: messages.length + 1,
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate bot response after a short delay
      setTimeout(() => {
        const botMessage: Message = {
          id: messages.length + 2,
          text: "Gracias por tu mensaje. Un agente revisará tu consulta pronto.",
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
  };

  // Elimina el botón flotante y el renderizado del chat flotante
  return null;
};

export default Chatbot;
