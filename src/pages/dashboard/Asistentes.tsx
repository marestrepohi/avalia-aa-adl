
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import KpiCard from '@/components/ui/dashboard/KpiCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import AsistenteCard from '@/components/asistentes/AsistenteCard';
import AsistenteChat from '@/components/asistentes/AsistenteChat';

// KPI data for assistants
const kpiData = [
  {
    title: "Asistentes Activos",
    value: "4",
    change: "+1",
    changeType: "positive" as "positive"
  },
  {
    title: "Chats Activos",
    value: "8",
    change: "+3",
    changeType: "positive" as "positive"
  },
  {
    title: "Chats Completados",
    value: "152",
    change: "+12%",
    changeType: "positive" as "positive"
  },
  {
    title: "Tiempo Promedio",
    value: "2m 45s",
    change: "-15s",
    changeType: "positive" as "positive"
  }
];

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
  const [currentTab, setCurrentTab] = useState<'asistentes' | 'fuentes'>('asistentes');
  
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
        <Button variant="outline">+ Crear Asistente</Button>
      </div>
      
      {!selectedAsistente ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => (
              <KpiCard 
                key={index}
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                changeType={kpi.changeType}
              />
            ))}
          </div>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Asistentes Disponibles</h2>
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
        </>
      ) : (
        <AsistenteChat 
          asistente={asistente}
          onClose={handleCloseChat}
          activeTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab as 'asistentes' | 'fuentes')}
        />
      )}
    </div>
  );
};

export default Asistentes;
