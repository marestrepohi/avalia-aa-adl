import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, Users, Settings } from 'lucide-react';

interface Asistente {
  id: string;
  nombre: string;
  descripcion: string;
  fuentes: number;
  icono: string;
  color: string;
  ultimaConversacion: Date;
}

interface AsistenteCardProps {
  asistente: Asistente;
  onSelect: () => void;
}

const AsistenteCard: React.FC<AsistenteCardProps> = ({ asistente, onSelect }) => {
  const renderIcon = () => {
    const iconProps = { 
      size: 32, 
      style: { color: asistente.color },
      className: "mb-4"
    };
    
    switch (asistente.icono) {
      case 'MessageSquare':
        return <MessageSquare {...iconProps} />;
      case 'User':
        return <User {...iconProps} />;
      case 'Users':
        return <Users {...iconProps} />;
      case 'Settings':
        return <Settings {...iconProps} />;
      default:
        return <MessageSquare {...iconProps} />;
    }
  };

  return (
    <Card className="h-full flex flex-col items-center justify-between bg-gradient-to-br from-white to-muted/60 border-0 shadow-none hover:shadow-lg hover:scale-[1.03] transition-all duration-200 cursor-pointer group">
      <CardContent className="flex flex-col items-center pt-8 pb-2 flex-1 w-full">
        <div className="rounded-full bg-white shadow-md p-3 mb-4 border-2 border-transparent group-hover:border-primary transition-all">
          {renderIcon()}
        </div>
        <h3 className="text-lg font-semibold mb-1 text-center group-hover:text-primary transition-colors">{asistente.nombre}</h3>
        <p className="text-muted-foreground text-sm text-center mb-2 line-clamp-2">{asistente.descripcion}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
          <span className="rounded bg-primary/10 px-2 py-0.5">{asistente.fuentes} fuentes</span>
          <span className="rounded bg-muted px-2 py-0.5">Últ. chat: {asistente.ultimaConversacion.toLocaleDateString()}</span>
        </div>
      </CardContent>
      <CardFooter className="w-full pt-0 pb-4 px-6">
        <Button 
          onClick={onSelect} 
          variant="secondary" 
          className="w-full font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          style={{ backgroundColor: `${asistente.color}20` }}
        >
          Iniciar Chat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AsistenteCard;
