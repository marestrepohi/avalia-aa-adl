import React, { useState } from "react";
import { PlusCircle, Edit, Copy, Trash2, PlayCircle, Filter, Phone, Settings, Share2, Mic, Target, Bot, Folder } from "lucide-react"; // Added Folder icon
import DataTable from "../../components/ui/dashboard/DataTable";
import SlidePanel from "../../components/ui/dashboard/SlidePanel";
import { Button, Input, Textarea, Select, Toggle, Tabs, Slider } from "../../components/ui/dashboard/FormControls";
import Modal from "../../components/ui/dashboard/Modal";
import ReactFlow, { addEdge, applyEdgeChanges, applyNodeChanges, Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import FuentesDocumentos from "../../components/asistentes/FuentesDocumentos";
import BarChart from "../../components/ui/dashboard/BarChart";


// Define Agent type (optional but good practice)
interface Agent {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  usos: number;
  fecha: string;
  // Add other potential fields like voice, tone, objective, flowConfig etc.
  voz?: string;
  tono?: string;
  objetivo?: string;
  modelo?: string; // Added model field
  configuracionFlujo?: any; // Placeholder for flow configuration
  llamadas?: number;
  minutos?: number;
  colgados?: number;
  sentimiento?: number;
  tasaExito?: number;
  temperatura?: number;
  telefono?: string;
}

// Sample data for agents
const agentsData: Agent[] = [
  {
    id: 1,
    nombre: "Asistente Ventas",
    descripcion: "Asistente para el equipo de ventas",
    estado: "Activo",
    usos: 1245,
    fecha: "12/03/2023",
    voz: "neural-female-es",
    tono: "amigable",
    objetivo: "Cerrar venta",
    modelo: "gpt4",
    llamadas: Math.floor(Math.random() * 9000) + 1000,
    minutos: Math.floor(Math.random() * 50000) + 10000,
    colgados: Math.floor(Math.random() * 500) + 50,
    sentimiento: parseFloat((Math.random() * 0.25 + 0.7).toFixed(2)),
    tasaExito: parseFloat((Math.random() * 0.5 + 0.4).toFixed(2)),
  },
  {
    id: 2,
    nombre: "Soporte Técnico",
    descripcion: "Ayuda a clientes con problemas técnicos",
    estado: "Inactivo",
    usos: 876,
    fecha: "15/03/2023",
    voz: "standard-male-es",
    tono: "profesional",
    objetivo: "Resolver incidencia",
    modelo: "gpt3",
    llamadas: Math.floor(Math.random() * 9000) + 1000,
    minutos: Math.floor(Math.random() * 50000) + 10000,
    colgados: Math.floor(Math.random() * 500) + 50,
    sentimiento: parseFloat((Math.random() * 0.25 + 0.7).toFixed(2)),
    tasaExito: parseFloat((Math.random() * 0.5 + 0.4).toFixed(2)),
  },
  {
    id: 3,
    nombre: "Generador Leads",
    descripcion: "Califica leads entrantes",
    estado: "Activo",
    usos: 532,
    fecha: "18/03/2023",
    llamadas: Math.floor(Math.random() * 9000) + 1000,
    minutos: Math.floor(Math.random() * 50000) + 10000,
    colgados: Math.floor(Math.random() * 500) + 50,
    sentimiento: parseFloat((Math.random() * 0.25 + 0.7).toFixed(2)),
    tasaExito: parseFloat((Math.random() * 0.5 + 0.4).toFixed(2)),
  },
  {
    id: 4,
    nombre: "Onboarding",
    descripcion: "Ayuda en el proceso de onboarding",
    estado: "Activo",
    usos: 211,
    fecha: "20/03/2023",
    llamadas: Math.floor(Math.random() * 9000) + 1000,
    minutos: Math.floor(Math.random() * 50000) + 10000,
    colgados: Math.floor(Math.random() * 500) + 50,
    sentimiento: parseFloat((Math.random() * 0.25 + 0.7).toFixed(2)),
    tasaExito: parseFloat((Math.random() * 0.5 + 0.4).toFixed(2)),
  },
  {
    id: 5,
    nombre: "Asistente Administrativo",
    descripcion: "Gestión de tareas administrativas",
    estado: "Inactivo",
    usos: 45,
    fecha: "22/03/2023",
    llamadas: Math.floor(Math.random() * 9000) + 1000,
    minutos: Math.floor(Math.random() * 50000) + 10000,
    colgados: Math.floor(Math.random() * 500) + 50,
    sentimiento: parseFloat((Math.random() * 0.25 + 0.7).toFixed(2)),
    tasaExito: parseFloat((Math.random() * 0.5 + 0.4).toFixed(2)),
  },
];

// Table columns
const columns = [
  {
    key: "nombre",
    header: "Nombre",
    render: (value: string, row: any) => (
      <div>
        <div className="font-medium text-primary hover:underline cursor-pointer">{value}</div>
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
    key: "usos",
    header: "Usos",
  },
  {
    key: "fecha",
    header: "Creado",
  },
  {
    key: "actions",
    header: "Acciones",
    render: (_: any, row: any) => (
      <div className="flex items-center gap-2">
        <button className="icon-button group">
          <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          <span className="tooltip -bottom-8">Editar</span>
        </button>
        <button className="icon-button group">
          <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          <span className="tooltip -bottom-8">Duplicar</span>
        </button>
        <button className="icon-button group">
          <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors duration-200" />
          <span className="tooltip -bottom-8">Eliminar</span>
        </button>
      </div>
    ),
  },
];

const AgentesIA: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete confirmation
  const [isCallModalOpen, setIsCallModalOpen] = useState(false); // State for call control modal
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false); // State for flow editor modal
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null); // State to hold the agent being acted upon
  const [activeTab, setActiveTab] = useState("detalles");
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(70); // Assuming this is for model config
  const [callMode, setCallMode] = useState<'cliente' | 'manual'>('cliente');
  const [isExecutingLLM, setIsExecutingLLM] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  // Flow editor state
  const [nodes, setNodes] = useState<Node[]>([{ id: '1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Inicio' } }]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const onNodesChange = (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds));
  const onConnect = (connection: any) => setEdges((eds) => addEdge(connection, eds));
  const handleOpenTestModal = () => setIsTestModalOpen(true);
  const handleConfirmTestModal = () => {
    console.log('Probando número:', testPhone);
    setIsTestModalOpen(false);
  };
  const handleAddNode = () => {
    const id = `${nodes.length + 1}`;
    setNodes([...nodes, { id, type: 'default', position: { x: Math.random() * 400, y: Math.random() * 400 }, data: { label: `Paso ${id}` } }]);
  };
  // Allow editing node labels on double click
  const onNodeDoubleClick = (_: any, node: Node) => {
    const newLabel = window.prompt('Etiqueta del nodo:', node.data.label);
    if (newLabel) {
      setNodes((nds) => nds.map(n => n.id === node.id ? { ...n, data: { label: newLabel } } : n));
    }
  };

  const handleCreateFlowClick = () => {
    // Initialize new flow
    setNodes([{ id: '1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Inicio' } }]);
    setEdges([]);
    setIsFlowModalOpen(true);
  };

  // --- Handlers ---
  const handleCreateClick = () => {
    setSelectedAgent(null); // Clear selected agent for creation
    setActiveTab("detalles"); // Reset to default tab
    // Initialize empty flow for new agent
    setNodes([{ id: '1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Inicio' } }]);
    setEdges([]);
    setIsPanelOpen(true);
  };

  const handleEditClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setActiveTab("detalles"); // Or keep the last tab? Resetting might be safer.
    // Set temperature based on selected agent if available, otherwise default
    setTemperature(agent.temperatura || 70); // Assuming 'temperatura' field exists (0-100 scale)
    setIsPanelOpen(true);
  };

  const handleDuplicateClick = (agent: Agent) => {
    // Logic to duplicate agent (potentially pre-fill panel with duplicated data)
    console.log("Duplicar agente:", agent.nombre);
    const duplicatedAgent = { ...agent, id: Date.now(), nombre: `${agent.nombre} (Copia)` }; // Simple duplication example
    setSelectedAgent(duplicatedAgent);
    setActiveTab("detalles");
    setTemperature(duplicatedAgent.temperatura || 70);
    setIsPanelOpen(true);
    // You might want to add the duplicated agent to the main list upon saving
  };

  const handleDeleteClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    // Logic to delete the agent (API call, update state)
    console.log("Eliminar agente:", selectedAgent?.nombre);
    setIsLoading(true);
    setTimeout(() => { // Simulate API call
      // Update agentsData state here
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedAgent(null);
    }, 1000);
  };

  const handleCallClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setCallMode('cliente');
    setIsCallModalOpen(true);
  };

  const handleFlowEditClick = () => {
    // Open flow editor; if creating new agent, nodes start fresh
    setIsFlowModalOpen(true);
  };

  const handleSave = () => {
    setIsLoading(true);
    // Logic to save agent (create or update)
    const agentToSave = {
      ...selectedAgent, // Includes existing or duplicated data
      // Update fields based on form state (use controlled components or refs)
      // nombre: document.getElementById('agent-name-input')?.value, // Example
      temperatura: temperature, // Save current slider value
      // ... other fields
    };
    console.log("Guardando agente:", agentToSave); // Log data being saved
    setTimeout(() => {
      setIsLoading(false);
      setIsPanelOpen(false);
      setSelectedAgent(null);
      // Update agentsData state here if needed (add new or update existing)
    }, 1500);
  };

  const handleTestAgent = () => {
    setIsLoading(true);
    console.log("Probando agente:", selectedAgent?.nombre);
    setTimeout(() => {
      setIsLoading(false);
      // Maybe open a test chat modal?
    }, 1000);
  };

  const handleExecuteLLM = () => {
    setIsExecutingLLM(true);
    console.log("Ejecutando LLM para:", callMode);
    // TODO: llamar a la LLM aquí
    setTimeout(() => setIsExecutingLLM(false), 2000);
  };

  // --- Table Columns ---
  const columns = [
    {
      key: "nombre",
      header: "Nombre",
      render: (value: string, row: Agent) => (
        <div>
          <div
            className="font-medium text-primary hover:underline cursor-pointer"
            onClick={() => handleEditClick(row)} // Open panel on name click
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
      key: "usos",
      header: "Usos",
    },
    {
      key: "fecha",
      header: "Creado",
    },
    {
      key: "actions",
      header: "Acciones",
      render: (_: any, row: Agent) => (
        <div className="flex items-center gap-2">
          {/* Call Button */}
          <button
            className="icon-button group"
            onClick={() => handleCallClick(row)}
          >
            <Phone className="h-5 w-5 text-muted-foreground group-hover:text-success transition-colors duration-200" />
            <span className="tooltip -bottom-8">Llamar</span>
          </button>
          {/* Edit Button */}
          <button
            className="icon-button group"
            onClick={() => handleEditClick(row)}
          >
            <Edit className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            <span className="tooltip -bottom-8">Editar</span>
          </button>
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

  // --- Métricas Detalle Expandible ---
  const renderAgentMetrics = (row: Agent) => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const callsData = days.map(day => ({ name: day, value: Math.floor(((row.llamadas||0)/7) * (0.8 + Math.random() * 0.4)) }));
    const durationData = days.map(day => ({ name: day, value: Math.floor(((row.minutos||0)/7) * (0.8 + Math.random() * 0.4)) }));
    const sentimentData = days.map(day => ({ name: day, value: Number(((row.sentimiento||0)*100 * (0.9 + Math.random() * 0.2)).toFixed(0)) }));
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Llamadas</span>
            <span className="font-bold text-lg">{row.llamadas ?? '-'}</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Minutos Hablados</span>
            <span className="font-bold text-lg">{row.minutos ?? '-'}</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Colgados</span>
            <span className="font-bold text-lg">{row.colgados ?? '-'}</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Sentimiento</span>
            <span className="font-bold text-lg">{row.sentimiento !== undefined ? `${(row.sentimiento * 100).toFixed(0)}%` : '-'}</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Tasa de Éxito</span>
            <span className="font-bold text-lg">{row.tasaExito !== undefined ? `${(row.tasaExito * 100).toFixed(0)}%` : '-'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <BarChart data={callsData} title="Llamadas por Día" subtitle="Últimos 7 días" />
          <BarChart data={durationData} title="Duración Promedio" subtitle="Minutos por día" />
          <BarChart data={sentimentData} title="Sentimiento Diario" subtitle="Últimos 7 días (%)" />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-semibold">Agentes IA</h1>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 bg-primary text-white shadow px-6 py-2 rounded-lg hover:bg-primary/90 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <PlusCircle className="h-5 w-5" />
          <span className="font-medium">Crear Agente</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="max-w-md">
          <Input
            placeholder="Buscar agentes..."
            icon={<Filter className="h-4 w-4" />}
            // Add onChange handler for filtering logic
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={agentsData}
        renderExpandedRow={renderAgentMetrics}
      />

      {/* Edit/Create Agent Panel */}
      <SlidePanel
        isOpen={isPanelOpen}
        onClose={() => { setIsPanelOpen(false); setSelectedAgent(null); }} // Clear selection on close
        title={selectedAgent ? "Editar Agente IA" : "Crear Agente IA"}
        width="lg" // Consider 'xl' if content grows
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-md border border-border bg-muted text-muted-foreground hover:bg-muted/70 transition"
              onClick={() => { setIsPanelOpen(false); setSelectedAgent(null); }}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 rounded-md bg-primary text-white font-semibold shadow hover:bg-primary/90 transition disabled:opacity-60"
              onClick={handleSave}
              disabled={isLoading}
            >
              {selectedAgent?.id ? "Guardar Cambios" : "Crear Agente"}
            </button>
          </div>
        }
      >
        {/* Panel Header Mejorado */}
        <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary-light rounded-lg flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{selectedAgent?.nombre || "Nuevo Agente"}</h3>
              {selectedAgent?.fecha && <p className="text-xs text-muted-foreground">Creado el {selectedAgent.fecha}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-white text-primary hover:bg-primary/10 transition text-sm"
              onClick={handleFlowEditClick}
            >
              <Share2 className="h-4 w-4" />
              Editar Flujo
            </button>
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-primary bg-primary text-white hover:bg-primary/90 transition text-sm"
              onClick={handleOpenTestModal}
            >
              <PlayCircle className="h-4 w-4" />
              Probar
            </button>
          </div>
        </div>
        {/* Tabs y contenido mejorado */}
        <Tabs
          tabs={[
            { id: "detalles", label: "Detalles" },
            { id: "configuracion", label: "Configuración", icon: <Settings className="h-4 w-4" /> },
            { id: "fuentes", label: "Fuentes", icon: <Folder className="h-4 w-4" /> }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <div className="mt-6 space-y-6">
          {activeTab === "detalles" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  id="agent-name-input"
                  label="Nombre"
                  placeholder="Ingresa un nombre para el agente"
                  defaultValue={selectedAgent?.nombre || ""}
                />
                <Textarea
                  label="Descripción"
                  placeholder="Describe brevemente el propósito de este agente"
                  defaultValue={selectedAgent?.descripcion || ""}
                  rows={2}
                />
                <Textarea
                  label="Instrucciones del Sistema (Prompt)"
                  placeholder="Define el comportamiento, rol y directrices del agente IA..."
                  defaultValue={""}
                  rows={6}
                />
              </div>
              <div className="space-y-4">
                <Select
                  label="Modelo de IA"
                  options={[
                    { value: "gpt4", label: "GPT-4 Turbo" },
                    { value: "gpt3", label: "GPT-3.5 Turbo" },
                    { value: "claude3-opus", label: "Claude 3 Opus" },
                    { value: "claude3-sonnet", label: "Claude 3 Sonnet" },
                  ]}
                  defaultValue={selectedAgent?.modelo || "gpt4"}
                />
                <Toggle
                  label="Estado"
                  description={selectedAgent?.estado === "Activo" ? "El agente está operativo." : "El agente está desactivado."}
                  checked={selectedAgent?.estado === "Activo"}
                />
              </div>
            </div>
          )}
          {activeTab === "configuracion" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-muted/40 rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-2 flex items-center gap-2"><Settings className="h-4 w-4" /> Parámetros del Modelo</h4>
                  <Slider
                    label="Temperatura"
                    min={0}
                    max={100}
                    value={temperature}
                    onChange={setTemperature}
                    suffix="%"
                    description="Controla la creatividad/aleatoriedad (0% = determinista, 100% = muy creativo)."
                  />
                </div>
                {/* Puedes agregar más parámetros aquí */}
              </div>
              <div className="space-y-6">
                <div className="bg-muted/40 rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-2 flex items-center gap-2"><Mic className="h-4 w-4" /> Configuración de Voz</h4>
                  <Select
                    label="Voz del Agente"
                    options={[
                      { value: "neural-female-es", label: "Neural Femenina (Español)" },
                      { value: "neural-male-es", label: "Neural Masculina (Español)" },
                      { value: "standard-female-es", label: "Standard Femenina (Español)" },
                      { value: "standard-male-es", label: "Standard Masculina (Español)" },
                    ]}
                    defaultValue={selectedAgent?.voz || "neural-female-es"}
                  />
                  <Select
                    label="Tono de Voz"
                    options={[
                      { value: "amigable", label: "Amigable" },
                      { value: "profesional", label: "Profesional" },
                      { value: "empatico", label: "Empático" },
                      { value: "formal", label: "Formal" },
                      { value: "entusiasta", label: "Entusiasta" },
                    ]}
                    defaultValue={selectedAgent?.tono || "amigable"}
                  />
                </div>
                <div className="bg-muted/40 rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-2 flex items-center gap-2"><Target className="h-4 w-4" /> Objetivo de la Llamada</h4>
                  <Input
                    label="Objetivo Principal"
                    placeholder="Ej: Agendar una demo, resolver una duda, vender producto X"
                    defaultValue={selectedAgent?.objetivo || ""}
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === "fuentes" && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Fuentes de Conocimiento</h4>
              <FuentesDocumentos asistenteId={selectedAgent?.id?.toString() || ""} />
            </div>
          )}
        </div>
      </SlidePanel>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              isLoading={isLoading}
            >
              Eliminar Agente
            </Button>
          </>
        }
      >
        <p>
          ¿Estás seguro de que quieres eliminar el agente{" "}
          <strong>{selectedAgent?.nombre}</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>

      {/* Call Control Modal */}
      <Modal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        title={`Llamada con ${selectedAgent?.nombre || 'Agente'}`}
        size="md"
      >
        <div className="space-y-4">
          <Tabs
            tabs={[
              { id: 'cliente', label: 'Cliente Existente' },
              { id: 'manual', label: 'Número Manual' },
            ]}
            activeTab={callMode}
            onChange={(id) => setCallMode(id as 'cliente' | 'manual')}
          />
          <div className="mt-4">
            {callMode === 'cliente' && (
              <Select
                label="Seleccionar Cliente"
                options={/* TODO: reemplazar con lista real de clientes */[
                  { value: 'cliente1', label: 'Cliente 1 - +34 600 123 456' },
                  { value: 'cliente2', label: 'Cliente 2 - +34 600 654 321' },
                ]}
                defaultValue={selectedAgent?.telefono || 'cliente1'}
              />
            )}
            {callMode === 'manual' && (
              <Input
                label="Número Manual"
                placeholder="Ingresa número de teléfono"
                defaultValue={selectedAgent?.telefono || ''}
              />
            )}
          </div>
          {/* Ejecutar LLM */}
          <div className="flex justify-center">
            <Button variant="primary" onClick={handleExecuteLLM} disabled={isExecutingLLM}>
              {isExecutingLLM ? 'Llamando...' : 'Llamar'}
            </Button>
          </div>
          <div className="flex justify-center items-center space-x-4">
            <Button variant="outline">Pausar</Button>
            <Button variant="destructive">Finalizar</Button>
            <Button variant="secondary">Derivar</Button>
          </div>
        </div>
      </Modal>

       {/* Flow Editor Modal */}
       <Modal
        isOpen={isFlowModalOpen}
        onClose={() => setIsFlowModalOpen(false)}
        title={`Editor de Flujo - ${selectedAgent?.nombre || 'Agente'}`}
        size="xl" // Flow editors often need more space
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFlowModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsFlowModalOpen(false)}>Guardar Flujo</Button>
          </>
        }
      >
        <div>
          <p className="text-muted-foreground mb-4">
            Define los pasos y decisiones de la conversación del agente.
          </p>
          <div className="mb-2">
            <button className="px-3 py-1 bg-primary text-white rounded" onClick={handleAddNode}>Agregar Nodo</button>
          </div>
          <div style={{ height: 500 }}>
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

      {/* Test Agent Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title={`Probar Agente - ${selectedAgent?.nombre || ''}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsTestModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleConfirmTestModal}>Iniciar Prueba</Button>
          </>
        }
      >
        <Input
          label="Número de Prueba"
          placeholder="Ingresa número de teléfono"
          value={testPhone}
          onChange={(e) => setTestPhone(e.target.value)}
        />
      </Modal>

    </div>
  );
};

export default AgentesIA;
