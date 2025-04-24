import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import AsistenteCard from '@/components/asistentes/AsistenteCard';
import AsistenteChat from '@/components/asistentes/AsistenteChat';
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";

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
  const [search, setSearch] = useState("");
  
  const handleSelectAsistente = (id: string) => {
    setSelectedAsistente(id);
  };
  
  const handleCloseChat = () => {
    setSelectedAsistente(null);
  };

  const asistentesFiltrados = asistentesData.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  const asistente = selectedAsistente ? 
    asistentesData.find(a => a.id === selectedAsistente) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full max-w-7xl mx-auto px-2 md:px-6 py-4">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Asistentes IA</h1>
        {!selectedAsistente && (
          <Input
            placeholder="Buscar asistente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
        )}
      </div>
      <AnimatePresence mode="wait">
        {!selectedAsistente ? (
          <motion.div
            key="asistentes-list"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="flex-1 overflow-y-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {asistentesFiltrados.map((asistente) => (
                <AsistenteCard
                  key={asistente.id}
                  asistente={asistente}
                  onSelect={() => handleSelectAsistente(asistente.id)}
                />
              ))}
              {asistentesFiltrados.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-12">No se encontraron asistentes</div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="asistente-chat"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col h-full min-h-0"
          >
            <AsistenteChat 
              asistente={asistente}
              onClose={handleCloseChat}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Asistentes;
