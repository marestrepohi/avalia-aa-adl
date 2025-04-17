
import React, { useState } from "react";
import { PlusCircle, Edit, Copy, Trash2, PlayCircle, Filter } from "lucide-react";
import DataTable from "../../components/ui/dashboard/DataTable";
import SlidePanel from "../../components/ui/dashboard/SlidePanel";
import { Button, Input, Textarea, Select, Toggle, Tabs, Slider } from "../../components/ui/dashboard/FormControls";
import Modal from "../../components/ui/dashboard/Modal";

// Sample data for agents
const agentsData = [
  {
    id: 1,
    nombre: "Asistente Ventas",
    descripcion: "Asistente para el equipo de ventas",
    estado: "Activo",
    usos: 1245,
    fecha: "12/03/2023",
  },
  {
    id: 2,
    nombre: "Soporte Técnico",
    descripcion: "Ayuda a clientes con problemas técnicos",
    estado: "Inactivo",
    usos: 876,
    fecha: "15/03/2023",
  },
  {
    id: 3,
    nombre: "Generador Leads",
    descripcion: "Califica leads entrantes",
    estado: "Activo",
    usos: 532,
    fecha: "18/03/2023",
  },
  {
    id: 4,
    nombre: "Onboarding",
    descripcion: "Ayuda en el proceso de onboarding",
    estado: "Activo",
    usos: 211,
    fecha: "20/03/2023",
  },
  {
    id: 5,
    nombre: "Asistente Administrativo",
    descripcion: "Gestión de tareas administrativas",
    estado: "Inactivo",
    usos: 45,
    fecha: "22/03/2023",
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
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("detalles");
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(70);

  const handleSave = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsPanelOpen(false);
    }, 1500);
  };

  const handleTestAgent = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Agentes IA</h1>
        <Button 
          leftIcon={<PlusCircle className="h-5 w-5" />}
          onClick={() => setIsPanelOpen(true)}
        >
          Crear Agente
        </Button>
      </div>

      <div className="mb-6">
        <div className="max-w-md">
          <Input 
            placeholder="Buscar agentes..."
            icon={<Filter className="h-4 w-4" />}
          />
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={agentsData}
      />

      {/* Edit Agent Panel */}
      <SlidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title="Editar Agente IA"
        width="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPanelOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              isLoading={isLoading}
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary-light rounded-lg flex items-center justify-center">
              <div className="text-primary font-bold text-xl">AI</div>
            </div>
            <div>
              <h3 className="font-semibold">Asistente Ventas</h3>
              <p className="text-sm text-muted-foreground">Creado el 12/03/2023</p>
            </div>
          </div>
          <Button 
            leftIcon={<PlayCircle className="h-5 w-5" />}
            variant="secondary"
            onClick={handleTestAgent}
            isLoading={isLoading}
          >
            Probar Agente
          </Button>
        </div>

        <Tabs
          tabs={[
            { id: "detalles", label: "Detalles" },
            { id: "configuracion", label: "Configuración" },
            { id: "integracion", label: "Integración" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "detalles" && (
          <>
            <Input 
              label="Nombre"
              placeholder="Ingresa un nombre para el agente"
              defaultValue="Asistente Ventas"
            />
            
            <Textarea 
              label="Descripción"
              placeholder="Describe el propósito de este agente"
              defaultValue="Asistente para el equipo de ventas"
            />
            
            <Select 
              label="Modelo de IA"
              options={[
                { value: "gpt4", label: "GPT-4" },
                { value: "gpt3", label: "GPT-3.5 Turbo" },
                { value: "claude", label: "Claude 3" },
              ]}
              defaultValue="gpt4"
            />
            
            <Toggle 
              label="Agente activo"
              description="Cuando está activado, el agente está disponible para uso"
              checked={true}
              onChange={() => {}}
            />

            <div className="mt-6">
              <Button
                variant="secondary" 
                className="mr-3"
                onClick={() => setIsFlowModalOpen(true)}
              >
                Editar Flujo Inteligente
              </Button>
            </div>
          </>
        )}

        {activeTab === "configuracion" && (
          <>
            <div className="space-y-6">
              <Slider
                label="Temperatura"
                min={0}
                max={100}
                value={temperature}
                onChange={setTemperature}
              />
              
              <Select 
                label="Idioma principal"
                options={[
                  { value: "es", label: "Español" },
                  { value: "en", label: "Inglés" },
                  { value: "fr", label: "Francés" },
                ]}
                defaultValue="es"
              />
              
              <Textarea 
                label="Instrucciones personalizadas"
                placeholder="Proporciona instrucciones específicas para el agente"
                defaultValue="Eres un asistente de ventas enfocado en ayudar a prospectos interesados en nuestros servicios de consultoría. Responde de manera amable y profesional."
              />
              
              <Input 
                label="Tiempo máximo de respuesta (segundos)"
                type="number"
                defaultValue="15"
              />
            </div>
          </>
        )}

        {activeTab === "integracion" && (
          <>
            <div className="space-y-6">
              <Select 
                label="Conexión CRM"
                options={[
                  { value: "salesforce", label: "Salesforce" },
                  { value: "hubspot", label: "HubSpot" },
                  { value: "none", label: "Ninguno" },
                ]}
                defaultValue="salesforce"
              />
              
              <Input 
                label="API Key"
                type="password"
                placeholder="Ingresa la API key"
                defaultValue="••••••••••••••••"
              />
              
              <Toggle 
                label="Guardar transcripciones"
                description="Almacena todas las conversaciones en la base de datos"
                checked={true}
                onChange={() => {}}
              />
              
              <Toggle 
                label="Notificaciones por email"
                description="Envía notificaciones al equipo cuando se generen leads"
                checked={false}
                onChange={() => {}}
              />
            </div>
          </>
        )}
      </SlidePanel>

      {/* Flow Editor Modal */}
      <Modal
        isOpen={isFlowModalOpen}
        onClose={() => setIsFlowModalOpen(false)}
        title="Editar Flujo Inteligente"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFlowModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsFlowModalOpen(false)}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Editor de Flujo Inteligente (Canvas)</p>
        </div>
      </Modal>
    </div>
  );
};

export default AgentesIA;
