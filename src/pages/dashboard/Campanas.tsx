import React, { useState } from "react";
import { Plus, Play, Pause, Edit, Trash2, Users, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import SlidePanel from "@/components/ui/dashboard/SlidePanel";
import Modal from "@/components/ui/dashboard/Modal";
import DataTable from "@/components/ui/dashboard/DataTable";
import BarChart from "@/components/ui/dashboard/BarChart";
import KpiCard from "@/components/ui/dashboard/KpiCard";

import CampaignForm from "@/components/campaigns/CampaignForm";

import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

import { useIsMobile } from "@/hooks/use-mobile";

interface Campaign {
  id: number;
  nombre: string;
  type: string;
  status: string;
  fechaInicio: Date;
  fechaFin: Date;
  objetivos: string;
  conversion: string;
  responsable: string;
  description: string;
  audienceId: string;
  assistantId: string;
}

const initialCampaigns: Campaign[] = [
  {
    id: 1,
    nombre: "Campaña Q1 2023",
    type: "email",
    status: "active",
    fechaInicio: new Date("2023-01-15"),
    fechaFin: new Date("2023-03-31"),
    objetivos: "150 leads",
    conversion: "18%",
    responsable: "Carlos Méndez",
    description: "Campaña del primer trimestre del año",
    audienceId: "1",
    assistantId: "1",
  },
  {
    id: 2,
    nombre: "Promo Verano",
    type: "social",
    status: "paused",
    fechaInicio: new Date("2023-06-01"),
    fechaFin: new Date("2023-08-31"),
    objetivos: "300 leads",
    conversion: "22%",
    responsable: "Laura Torres",
    description: "Campaña de verano en redes sociales",
    audienceId: "2",
    assistantId: "2",
  },
  {
    id: 3,
    nombre: "Black Friday",
    type: "sms",
    status: "scheduled",
    fechaInicio: new Date("2023-11-20"),
    fechaFin: new Date("2023-11-30"),
    objetivos: "500 leads",
    conversion: "N/A",
    responsable: "Miguel Ángel Ruiz",
    description: "Campaña de SMS para Black Friday",
    audienceId: "3",
    assistantId: "3",
  },
];

const Campanas: React.FC = () => {
  const isMobile = useIsMobile();

  // state
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [showFlow, setShowFlow] = useState(false);

  // flow state
  const [nodes, setNodes] = useState<Node[]>([
    { id: "1", type: "default", position: { x: 0, y: 0 }, data: { label: "Inicio" } },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // KPI metrics
  const defaultMetrics = [
    { label: "Llamadas realizadas", value: "320" },
    { label: "Contactos efectivos", value: "180" },
    { label: "Conversiones", value: "58" },
    { label: "Sentimiento promedio", value: "82%" },
    { label: "Tasa de éxito", value: "18%" },
  ];

  // handlers
  const onStart = (c: Campaign) =>
    setCampaigns((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, status: "active" } : x))
    );
  const onPause = (c: Campaign) =>
    setCampaigns((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, status: "paused" } : x))
    );

  const openDetail = (c: Campaign) => {
    setSelected(c);
    setShowDetail(true);
  };
  const openEdit = (c: Campaign) => {
    setSelected(c);
    setShowEdit(true);
  };
  const saveEdit = (data: any) => {
    if (!selected) return;
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              nombre: data.name,
              objetivos: data.objective,
              status: data.status,
              fechaInicio: data.startDate || c.fechaInicio,
              fechaFin: data.endDate || c.fechaFin,
              description: data.description,
            }
          : c
      )
    );
    setShowEdit(false);
  };

  const addNode = () => {
    const id = `${nodes.length + 1}`;
    setNodes([
      ...nodes,
      { id, type: "default", position: { x: 100, y: 100 }, data: { label: `Paso ${id}` } },
    ]);
  };
  const onNodesChange = (ch: any) => setNodes((nds) => applyNodeChanges(ch, nds));
  const onEdgesChange = (ch: any) => setEdges((eds) => applyEdgeChanges(ch, eds));
  const onConnect = (conn: any) => setEdges((eds) => addEdge(conn, eds));

  // table columns
  const columns = [
    {
      key: "nombre",
      header: "Campaña",
      render: (v: string, row: Campaign) => (
        <span className="text-primary cursor-pointer" onClick={() => openDetail(row)}>
          {v}
        </span>
      ),
    },
    {
      key: "fechaInicio",
      header: "Inicio",
      render: (d: Date) => format(d, "dd/MM/yyyy", { locale: es }),
    },
    {
      key: "fechaFin",
      header: "Fin",
      render: (d: Date) => format(d, "dd/MM/yyyy", { locale: es }),
    },
    {
      key: "status",
      header: "Estado",
      render: (s: string) => <span className={`badge badge-${s}`}>{s}</span>,
    },
    {
      key: "objetivos",
      header: "Objetivos",
    },
    {
      key: "conversion",
      header: "Conversion",
    },
    {
      key: "actions",
      header: "Acciones",
      render: (_: any, row: Campaign) => (
        <div className="flex gap-2">
          {row.status === "active" ? (
            <Button size="sm" variant="outline" onClick={() => onPause(row)}>
              <Pause size={14} />
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onStart(row)}>
              <Play size={14} />
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => openDetail(row)}>
            Detalle
          </Button>
          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
            <Edit size={14} />
            Editar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Campañas</h1>
        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} />
          Nueva Campaña
        </Button>
      </header>

      <DataTable columns={columns} data={campaigns} />

      {/* Nuevo */}
      <SlidePanel isOpen={showNew} onClose={() => setShowNew(false)} title="Nueva Campaña" width={isMobile ? "full" : "lg"}>
        <div className="mb-4 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setShowFlow(true)}>
            <Filter size={14} />
            Flujo
          </Button>
        </div>
        <CampaignForm onClose={() => setShowNew(false)} />
      </SlidePanel>

      {/* Editar */}
      <SlidePanel isOpen={showEdit} onClose={() => setShowEdit(false)} title="Editar Campaña" width={isMobile ? "full" : "lg"}>
        <CampaignForm onClose={() => setShowEdit(false)} onSave={saveEdit} initialData={selected || undefined} />
      </SlidePanel>

      {/* Detalle */}
      <SlidePanel
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={`Detalle: ${selected?.nombre || ""}`}
        width={isMobile ? "full" : "lg"}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {defaultMetrics.map((m) => (
              <KpiCard key={m.label} title={m.label} value={m.value} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BarChart
              title="Llamadas diarias"
              subtitle="Última semana"
              data={[
                { name: "Lun", value: 50 },
                { name: "Mar", value: 75 },
                { name: "Mié", value: 60 },
                { name: "Jue", value: 90 },
                { name: "Vie", value: 80 },
              ]}
            />
            <BarChart
              title="Conversiones diarias"
              subtitle="Última semana"
              data={[
                { name: "Lun", value: 5 },
                { name: "Mar", value: 8 },
                { name: "Mié", value: 6 },
                { name: "Jue", value: 10 },
                { name: "Vie", value: 9 },
              ]}
            />
          </div>
        </div>
      </SlidePanel>

      {/* Flujo */}
      <Modal isOpen={showFlow} onClose={() => setShowFlow(false)} title="Editor de Flujo" size="xl">
        <div className="mb-4">
          <Button size="sm" onClick={addNode}>
            Agregar Nodo
          </Button>
        </div>
        <div style={{ height: 400 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background />
          </ReactFlow>
        </div>
      </Modal>
    </div>
  );
};

export default Campanas;
