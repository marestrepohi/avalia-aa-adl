import React, { useState } from 'react';
import { PlusCircle, Edit, Copy, Trash2, Filter, Bot, MessageSquare, PlayCircle, Settings, ChevronDown, MessageCircle, Users, Slack, Send, Code, Share2 } from "lucide-react";
import ReactFlow, { addEdge, applyEdgeChanges, applyNodeChanges, Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import DataTable from "../../components/ui/dashboard/DataTable";
import SlidePanel from "../../components/ui/dashboard/SlidePanel";
import { Button, Input, Textarea, Select, Toggle, Tabs } from "../../components/ui/dashboard/FormControls";
import Modal from "../../components/ui/dashboard/Modal";
import BarChart from "../../components/ui/dashboard/BarChart";
import AsistenteChat from '@/components/asistentes/AsistenteChat';
import FuentesDocumentos from "../../components/asistentes/FuentesDocumentos";
import { AnimatePresence, motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 

// Define AssistantText type
interface AssistantText {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  conversaciones: number;
  fecha: string;
  modelo?: string;
  temperatura?: number;
  mensajes?: number;
  tiempoRespuesta?: number;
  satisfaccion?: number;
  tasaResolucion?: number;
  fuentes?: number;
  icono?: string;
  color?: string;
}

// Sample data for text assistants
const assistantsData: AssistantText[] = [
  {
    id: 1,
    nombre: "Asistente Ventas",
    descripcion: "Especializado en productos financieros y ventas",
    estado: "Activo",
    conversaciones: 1245,
    fecha: "12/03/2023",
    modelo: "gpt-4",
    temperatura: 70,
    mensajes: Math.floor(Math.random() * 15000) + 5000,
    tiempoRespuesta: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
    satisfaccion: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
    tasaResolucion: parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)),
    fuentes: 12,
    icono: "MessageSquare",
    color: "#9b87f5"
  },
  {
    id: 2,
    nombre: "Soporte Cliente",
    descripcion: "Ayuda con consultas frecuentes y problemas técnicos",
    estado: "Activo",
    conversaciones: 876,
    fecha: "15/03/2023",
    modelo: "gpt-3.5",
    temperatura: 60,
    mensajes: Math.floor(Math.random() * 15000) + 5000,
    tiempoRespuesta: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
    satisfaccion: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
    tasaResolucion: parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)),
    fuentes: 8,
    icono: "Users",
    color: "#33C3F0"
  },
  {
    id: 3,
    nombre: "Asesor Inversiones",
    descripcion: "Orientación sobre productos de inversión",
    estado: "Inactivo",
    conversaciones: 532,
    fecha: "18/03/2023",
    modelo: "gpt-4",
    temperatura: 80,
    mensajes: Math.floor(Math.random() * 15000) + 5000,
    tiempoRespuesta: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
    satisfaccion: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
    tasaResolucion: parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)),
    fuentes: 15,
    icono: "Settings",
    color: "#7E69AB"
  },
  {
    id: 4,
    nombre: "Asistente Créditos",
    descripcion: "Especializado en productos de crédito y préstamos",
    estado: "Activo",
    conversaciones: 211,
    fecha: "20/03/2023",
    modelo: "gpt-3.5",
    temperatura: 65,
    mensajes: Math.floor(Math.random() * 15000) + 5000,
    tiempoRespuesta: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
    satisfaccion: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
    tasaResolucion: parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)),
    fuentes: 7,
    icono: "User",
    color: "#1EAEDB"
  }
];

const Asistentes: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantText | null>(null);
  const [activeTab, setActiveTab] = useState("detalles");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChatAssistant, setSelectedChatAssistant] = useState<any>(null);
  const [temperature, setTemperature] = useState(70);
  const [isEditChatOpen, setIsEditChatOpen] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editTemperature, setEditTemperature] = useState(70);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  // Flow editor state (text assistant)
  const [nodes, setNodes] = useState<Node[]>([{ id: '1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Inicio' } }]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const onNodesChange = (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds));
  const onConnect = (connection: any) => setEdges((eds) => addEdge(connection, eds));
  const onNodeDoubleClick = (_: any, node: Node) => {
    const newLabel = window.prompt('Etiqueta del nodo:', node.data.label);
    if (newLabel) {
      setNodes((nds) => nds.map(n => n.id === node.id ? { ...n, data: { label: newLabel } } : n));
    }
  };
  // --- Handlers ---
  const handleCreateClick = () => {
    setSelectedAssistant(null);
    setActiveTab("detalles");
    setIsPanelOpen(true);
  };

  const handleEditClick = (assistant: AssistantText) => {
    setSelectedAssistant(assistant);
    setActiveTab("detalles");
    setTemperature(assistant.temperatura || 70);
    setIsPanelOpen(true);
  };

  const handleDeleteClick = (assistant: AssistantText) => {
    setSelectedAssistant(assistant);
    setIsDeleteModalOpen(true);
  };

  const handleTestClick = (assistant: AssistantText) => {
    // Convert to the format expected by AsistenteChat
    const chatAssistant = {
      id: assistant.id.toString(),
      nombre: assistant.nombre,
      descripcion: assistant.descripcion,
      icono: assistant.icono || "Bot",
      color: assistant.color || "#9b87f5",
      fuentes: assistant.fuentes || 0,
      ultimaConversacion: new Date()
    };
    setSelectedChatAssistant(chatAssistant);
  };

  const handleConfirmDelete = () => {
    console.log("Eliminar asistente:", selectedAssistant?.nombre);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedAssistant(null);
    }, 1000);
  };

  const handleSave = () => {
    setIsLoading(true);
    console.log("Guardando asistente");
    setTimeout(() => {
      setIsLoading(false);
      setIsPanelOpen(false);
      setSelectedAssistant(null);
    }, 1500);
  };

  const handleCloseChat = () => {
    setSelectedChatAssistant(null);
  };

  const handleEditInChat = () => {
    if (selectedChatAssistant) {
      setEditDescription(selectedChatAssistant.descripcion || '');
      setEditTemperature(selectedChatAssistant.temperatura || 70);
      setIsEditChatOpen(true);
    }
  };

  const handleSaveEditInChat = () => {
    // Save changes logic here
    console.log('Saving chat edits:', { editDescription, editTemperature });
    setIsEditChatOpen(false);
  };

  const handleChannelAction = (channel: string, row: AssistantText) => {
    console.log(`Deploying assistant ${row.nombre} to ${channel}`);
    // Implementation for each channel
  };

  // --- Table Columns ---
  const columns = [
    {
      key: "nombre",
      header: "Nombre",
      render: (value: string, row: AssistantText) => (
        <div>
          <div
            className="font-medium text-primary hover:underline cursor-pointer"
            onClick={() => handleEditClick(row)}
          >
            {value}
          </div>
          <div className="text-xs text-muted-foreground">{row.descripcion}</div>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (value: string) => {
        const badgeClass = value === "Activo" ? "badge-success" : "badge-neutral";
        return <span className={`badge ${badgeClass}`}>{value}</span>;
      },
    },
    {
      key: "conversaciones",
      header: "Conversaciones",
    },
    {
      key: "fecha",
      header: "Creado",
    },
    {
      key: "actions",
      header: "Acciones",
      render: (_: any, row: AssistantText) => (
        <div className="flex items-center gap-2">
          {/* Test Button */}
          <button
            className="icon-button group"
            onClick={() => handleTestClick(row)}
          >
            <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-success transition-colors duration-200" />
            <span className="tooltip -bottom-8">Probar</span>
          </button>
          {/* Edit Button */}
          <button
            className="icon-button group"
            onClick={() => handleEditClick(row)}
          >
            <Edit className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            <span className="tooltip -bottom-8">Editar</span>
          </button>
          {/* Channel Deployment Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="icon-button group">
                <Send className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors duration-200 ml-1" />
                <span className="tooltip -bottom-8">Desplegar</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg">
              <DropdownMenuItem onClick={() => handleChannelAction('whatsapp', row)}>
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChannelAction('teams', row)}>
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Microsoft Teams
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChannelAction('slack', row)}>
                <Slack className="h-4 w-4 mr-2 text-purple-600" />
                Slack
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChannelAction('telegram', row)}>
                <Send className="h-4 w-4 mr-2 text-blue-500" />
                Telegram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChannelAction('api', row)}>
                <Code className="h-4 w-4 mr-2 text-gray-600" />
                API
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Delete Button */}
          <button
            className="icon-button group"
            onClick={() => handleDeleteClick(row)}
          >
            <Trash2 className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors duration-200" />
            <span className="tooltip -bottom-8">Eliminar</span>
          </button>
        </div>
      ),
    },
  ];

  // --- Metrics Detail Expandable ---
  const renderAssistantMetrics = (row: AssistantText) => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const messagesData = days.map(day => ({ 
      name: day, 
      value: Math.floor(((row.mensajes||0)/7) * (0.8 + Math.random() * 0.4)) 
    }));
    const responseData = days.map(day => ({ 
      name: day, 
      value: Number(((row.tiempoRespuesta||0) * (0.9 + Math.random() * 0.2)).toFixed(1)) 
    }));
    const satisfactionData = days.map(day => ({ 
      name: day, 
      value: Number(((row.satisfaccion||0)*100 * (0.9 + Math.random() * 0.2)).toFixed(0)) 
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Mensajes</span>
            <span className="font-bold text-lg">{row.mensajes ?? '-'}</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Tiempo Respuesta</span>
            <span className="font-bold text-lg">{row.tiempoRespuesta ? `${row.tiempoRespuesta}s` : '-'}</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Satisfacción</span>
            <span className="font-bold text-lg">{row.satisfaccion !== undefined ? `${(row.satisfaccion * 100).toFixed(0)}%` : '-'}</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Tasa Resolución</span>
            <span className="font-bold text-lg">{row.tasaResolucion !== undefined ? `${(row.tasaResolucion * 100).toFixed(0)}%` : '-'}</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Fuentes</span>
            <span className="font-bold text-lg">{row.fuentes ?? '-'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <BarChart data={messagesData} title="Mensajes por Día" subtitle="Últimos 7 días" />
          <BarChart data={responseData} title="Tiempo Respuesta" subtitle="Segundos promedio" />
          <BarChart data={satisfactionData} title="Satisfacción Diaria" subtitle="Últimos 7 días (%)" />
        </div>
      </div>
    );
  };

  // If chat assistant is selected, show chat interface
  if (selectedChatAssistant) {
    return (
  <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden min-h-0 -m-4 sm:-m-6">
        <AnimatePresence mode="wait">
          <motion.div
            key="asistente-chat"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col h-full min-h-0"
          >
            <AsistenteChat 
              asistente={selectedChatAssistant}
              onClose={handleCloseChat}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-semibold">Asistentes de Texto</h1>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 bg-primary text-white shadow px-6 py-2 rounded-lg hover:bg-primary/90 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <PlusCircle className="h-5 w-5" />
          <span className="font-medium">Crear Asistente de Texto</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="max-w-md">
          <Input
            placeholder="Buscar asistentes..."
            icon={<Filter className="h-4 w-4" />}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={assistantsData}
        renderExpandedRow={renderAssistantMetrics}
      />

      {/* Edit/Create Assistant Panel */}
      <SlidePanel
        isOpen={isPanelOpen}
        onClose={() => { setIsPanelOpen(false); setSelectedAssistant(null); }}
        title={selectedAssistant ? "Editar Asistente de Texto" : "Crear Asistente de Texto"}
        width="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-md border border-border bg-muted text-muted-foreground hover:bg-muted/70 transition"
              onClick={() => { setIsPanelOpen(false); setSelectedAssistant(null); }}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 rounded-md bg-primary text-white font-semibold shadow hover:bg-primary/90 transition disabled:opacity-60"
              onClick={handleSave}
              disabled={isLoading}
            >
              {selectedAssistant?.id ? "Guardar Cambios" : "Crear Asistente de Texto"}
            </button>
          </div>
        }
      >
        <Tabs
          tabs={[
            { id: "detalles", label: "Detalles" },
            { id: "configuracion", label: "Configuración" },
            { id: "fuentes", label: "Fuentes" }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="space-y-6 mt-6">
          {activeTab === "detalles" && (
            <div className="space-y-4">
              <Input
                label="Nombre del Asistente"
                placeholder="Ej: Asistente de Ventas"
                defaultValue={selectedAssistant?.nombre}
              />
              <Textarea
                label="Descripción"
                placeholder="Describe el propósito y funcionalidad del asistente..."
                rows={3}
                defaultValue={selectedAssistant?.descripcion}
              />
              <Select
                label="Estado"
                options={[
                  { value: "activo", label: "Activo" },
                  { value: "inactivo", label: "Inactivo" }
                ]}
                defaultValue={selectedAssistant?.estado.toLowerCase()}
              />
            </div>
          )}

          {activeTab === "configuracion" && (
            <div className="space-y-6">
              <Select
                label="Modelo de Lenguaje"
                options={[
                  { value: "gpt-4", label: "GPT-4" },
                  { value: "gpt-3.5", label: "GPT-3.5 Turbo" },
                  { value: "claude-2", label: "Claude 2" },
                ]}
                defaultValue={selectedAssistant?.modelo || "gpt-4"}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-600 w-12 text-center">{temperature / 100}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Controla la creatividad. Más bajo para respuestas predecibles, más alto para respuestas variadas.</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-md font-semibold mb-1">Flujo Conversacional</h4>
                  <p className="text-sm text-muted-foreground">Configura el flujo del asistente con el editor visual.</p>
                </div>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-white text-primary hover:bg-primary/10 transition text-sm"
                  onClick={() => setIsFlowModalOpen(true)}
                >
                  <Share2 className="h-4 w-4" />
                  Editar Flujo
                </button>
              </div>
            </div>
          )}

          

          {activeTab === "fuentes" && (
            <FuentesDocumentos asistenteId={selectedAssistant?.id?.toString() || "temp"} />
          )}
        </div>
      </SlidePanel>

      {/* Flow Editor Modal */}
      <Modal
        isOpen={isFlowModalOpen}
        onClose={() => setIsFlowModalOpen(false)}
        title={selectedAssistant ? `Editor de Flujo - ${selectedAssistant.nombre}` : 'Editor de Flujo'}
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded-md border border-border bg-muted text-muted-foreground hover:bg-muted/70 transition" onClick={() => setIsFlowModalOpen(false)}>Cancelar</button>
            <button className="px-4 py-2 rounded-md bg-primary text-white font-semibold shadow hover:bg-primary/90 transition" onClick={() => setIsFlowModalOpen(false)}>Guardar Flujo</button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="mb-2">
            <button className="px-3 py-1 bg-primary text-white rounded" onClick={() => {
              const id = `${nodes.length + 1}`;
              setNodes([...nodes, { id, type: 'default', position: { x: Math.random() * 400, y: Math.random() * 400 }, data: { label: `Paso ${id}` } }]);
            }}>Agregar Nodo</button>
          </div>
          <div style={{ height: 520 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDoubleClick={onNodeDoubleClick}
              fitView
            >
              <Background />
            </ReactFlow>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-md border border-border bg-muted text-muted-foreground hover:bg-muted/70 transition"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 rounded-md bg-destructive text-white font-semibold shadow hover:bg-destructive/90 transition disabled:opacity-60"
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        }
      >
        <p>
          ¿Estás seguro de que deseas eliminar el asistente "{selectedAssistant?.nombre}"? 
          Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
};

export default Asistentes;
