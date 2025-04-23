import React, { useState } from "react";
import { PlusCircle, Edit, Copy, Trash2, PlayCircle, Filter, Phone, PhoneCall, PhoneOff, ArrowUpRight } from "lucide-react";
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
      <div className="flex items-center justify-center gap-2">
        <button className="icon-button group p-2 rounded-full hover:bg-muted">
          <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          <span className="tooltip -bottom-8">Editar</span>
        </button>
        <button className="icon-button group p-2 rounded-full hover:bg-muted">
          <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          <span className="tooltip -bottom-8">Duplicar</span>
        </button>
        <button className="icon-button group p-2 rounded-full hover:bg-muted">
          <PhoneCall className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors duration-200" />
          <span className="tooltip -bottom-8">Llamar</span>
        </button>
        <button className="icon-button group p-2 rounded-full hover:bg-muted">
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
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
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
        <h1 className="text-2xl font-semibold">Centro de Llamadas</h1>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            leftIcon={<PhoneCall className="h-5 w-5" />}
            onClick={() => setIsCallModalOpen(true)}
          >
            Nueva Llamada
          </Button>
          <Button 
            leftIcon={<PlusCircle className="h-5 w-5" />}
            onClick={() => setIsPanelOpen(true)}
          >
            Crear Agente
          </Button>
        </div>
      </div>

      {/* Panel de botones de acción para el centro de llamadas */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          <button className="flex flex-col items-center p-3 hover:bg-primary-light rounded-lg transition-all duration-200 group">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-all duration-200 mb-2">
              <PhoneCall className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium">Iniciar Llamada</span>
          </button>

          <button className="flex flex-col items-center p-3 hover:bg-primary-light rounded-lg transition-all duration-200 group">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-all duration-200 mb-2">
              <PhoneOff className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-sm font-medium">Finalizar Llamada</span>
          </button>

          <button className="flex flex-col items-center p-3 hover:bg-primary-light rounded-lg transition-all duration-200 group">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-all duration-200 mb-2">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Transferir Llamada</span>
          </button>

          <button className="flex flex-col items-center p-3 hover:bg-primary-light rounded-lg transition-all duration-200 group">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-all duration-200 mb-2">
              <ArrowUpRight className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium">Derivar a Agente</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold mb-3">Agentes Disponibles</div>
          <div className="max-w-xs">
            <Input 
              placeholder="Buscar agentes..."
              icon={<Filter className="h-4 w-4" />}
            />
          </div>
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
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsPanelOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              isLoading={isLoading}
            >
              Guardar
            </Button>
          </div>
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

            <div className="mt-6 flex justify-center">
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
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsFlowModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsFlowModalOpen(false)}>
              Guardar
            </Button>
          </div>
        }
      >
        <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Editor de Flujo Inteligente (Canvas)</p>
        </div>
      </Modal>

      {/* Call Modal */}
      <Modal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        title="Nueva Llamada"
        size="md"
        footer={
          <div className="flex items-center justify-center gap-4 w-full">
            <Button 
              variant="destructive" 
              onClick={() => setIsCallModalOpen(false)}
              className="w-1/3"
              leftIcon={<PhoneOff className="h-4 w-4" />}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => setIsCallModalOpen(false)}
              className="w-1/3"
              leftIcon={<PhoneCall className="h-4 w-4" />}
            >
              Iniciar Llamada
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <Select 
            label="Tipo de Llamada"
            options={[
              { value: "outbound", label: "Llamada Saliente" },
              { value: "inbound", label: "Llamada Entrante" },
              { value: "scheduled", label: "Llamada Programada" },
            ]}
            defaultValue="outbound"
          />
          
          <Select 
            label="Agente para la Llamada"
            options={[
              { value: "agent1", label: "Asistente Ventas" },
              { value: "agent2", label: "Soporte Técnico" },
              { value: "agent3", label: "Generador Leads" },
            ]}
            defaultValue="agent1"
          />
          
          <Input 
            label="Número a Contactar"
            placeholder="Ingrese el número telefónico"
          />
          
          <Select 
            label="Cliente"
            options={[
              { value: "client1", label: "Martín Gutiérrez - Informática Global" },
              { value: "client2", label: "Ana Belén Torres - Consultoría Estratégica" },
              { value: "client3", label: "Roberto Fernández - Construcciones Modernas" },
            ]}
          />
          
          <Textarea 
            label="Notas para la Llamada"
            placeholder="Agregar información relevante para la llamada"
          />
          
          <Toggle 
            label="Grabar conversación"
            description="La llamada será grabada para análisis posterior"
            checked={true}
            onChange={() => {}}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AgentesIA;
