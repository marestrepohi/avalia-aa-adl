
import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ScreenShare from './ScreenShare';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Empezar conversación"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-64 h-[30vh] overflow-auto">
          <div className="flex justify-end p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar conversación"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScreenShare />
        </Card>
      )}
    </div>
  );
};

export default Chatbot;
