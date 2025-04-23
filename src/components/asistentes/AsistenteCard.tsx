
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, Users, Settings } from 'lucide-react';
import { format } from 'date-fns';

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
  // Render the correct icon based on the icon name
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
    <Card className="h-full hover:shadow-md transition-shadow duration-300">
      <CardContent className="pt-6">
        {renderIcon()}
        <h3 className="text-lg font-medium mb-2">{asistente.nombre}</h3>
        <p className="text-muted-foreground text-sm mb-3">{asistente.descripcion}</p>
        <div className="flex justify-between text-sm">
          <span>Fuentes: {asistente.fuentes}</span>
          <span>Última: {format(asistente.ultimaConversacion, 'dd/MM/yyyy')}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          onClick={onSelect} 
          variant="secondary" 
          className="w-full"
          style={{ backgroundColor: `${asistente.color}20` }}
        >
          Iniciar Chat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AsistenteCard;
