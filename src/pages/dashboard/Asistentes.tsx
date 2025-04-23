
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import AsistenteCard from '@/components/asistentes/AsistenteCard';
import AsistenteChat from '@/components/asistentes/AsistenteChat';

// Sample assistant data
const asistentesData = [
  {
    id: "ast-001",
    nombre: "Asistente Ventas",
    descripcion: "Especializado en productos financieros y ventas",
    fuentes: 12,
    icono: "MessageSquare",
    color: "#9b87f5",
    ultimaConversacion: new Date(2025, 3, 18)
  },
  {
    id: "ast-002",
    nombre: "Soporte Cliente",
    descripcion: "Ayuda con consultas frecuentes y problemas técnicos",
    fuentes: 8,
    icono: "Users",
    color: "#33C3F0",
    ultimaConversacion: new Date(2025, 3, 15)
  },
  {
    id: "ast-003",
    nombre: "Asesor Inversiones",
    descripcion: "Orientación sobre productos de inversión",
    fuentes: 15,
    icono: "Settings",
    color: "#7E69AB",
    ultimaConversacion: new Date(2025, 3, 10)
  },
  {
    id: "ast-004",
    nombre: "Asistente Créditos",
    descripcion: "Especializado en productos de crédito y préstamos",
    fuentes: 7,
    icono: "User",
    color: "#1EAEDB",
    ultimaConversacion: new Date(2025, 3, 12)
  }
];

const Asistentes: React.FC = () => {
  const [selectedAsistente, setSelectedAsistente] = useState<string | null>(null);
  
  const handleSelectAsistente = (id: string) => {
    setSelectedAsistente(id);
  };
  
  const handleCloseChat = () => {
    setSelectedAsistente(null);
  };

  const asistente = selectedAsistente ? 
    asistentesData.find(a => a.id === selectedAsistente) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Asistentes IA</h1>
      </div>
      
      {!selectedAsistente ? (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {asistentesData.map((asistente) => (
              <AsistenteCard
                key={asistente.id}
                asistente={asistente}
                onSelect={() => handleSelectAsistente(asistente.id)}
              />
            ))}
          </div>
        </Card>
      ) : (
        <AsistenteChat 
          asistente={asistente}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default Asistentes;
