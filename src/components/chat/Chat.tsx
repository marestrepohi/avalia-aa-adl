
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Send } from 'lucide-react';
import { useWebSocket } from './WebSocketProvider';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { sendMessage, lastTranscription } = useWebSocket();
  
  // Add message effect
  useEffect(() => {
    if (lastTranscription && lastTranscription.text) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        text: lastTranscription.text,
        sender: lastTranscription.sender === 'Gemini' ? 'assistant' : 'user',
        timestamp: new Date()
      };
      
      // Check if we should update the last message or add a new one
      setMessages(prev => {
        const lastMessage = prev.length > 0 ? prev[prev.length - 1] : null;
        
        if (lastMessage && lastMessage.sender === newMessage.sender && !lastTranscription.finished) {
          // Update the last message
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            text: newMessage.text
          };
          return updatedMessages;
        } else {
          // Add new message
          return [...prev, newMessage];
        }
      });
    }
  }, [lastTranscription]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Send to WebSocket
    sendMessage({
      message: {
        text: input
      }
    });
    
    setInput('');
  };
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${
                message.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar>
                  <div className="bg-primary text-primary-foreground w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium">
                    {message.sender === 'user' ? 'U' : 'AI'}
                  </div>
                </Avatar>
                <div className={`rounded-lg py-2 px-3 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'}`}
                >
                  <p>{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default Chat;
