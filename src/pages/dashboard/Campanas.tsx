import React, { useState } from "react";
import { Calendar as CalendarIcon, Plus, Play, Pause, Edit, Trash2, Filter, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DataTable from "../../components/ui/dashboard/DataTable";
import { es } from "date-fns/locale";
import SlidePanel from "@/components/ui/dashboard/SlidePanel";
import CampaignForm from "@/components/campaigns/CampaignForm";
import AudienciasForm from "@/components/campaigns/AudienciasForm";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

// Datos de ejemplo para campañas
const campanasData = [
  {
    id: 1,
    nombre: "Campaña Q1 2023",
    fechaInicio: new Date("2023-01-15"),
    fechaFin: new Date("2023-03-31"),
    estado: "Activa",
    objetivos: "150 leads",
    conversion: "18%",
    responsable: "Carlos Méndez"
  },
  {
    id: 2,
    nombre: "Promo Verano",
    fechaInicio: new Date("2023-06-01"),
    fechaFin: new Date("2023-08-31"),
    estado: "Inactiva",
    objetivos: "300 leads",
    conversion: "22%",
    responsable: "Laura Torres"
  },
  {
    id: 3,
    nombre: "Black Friday",
    fechaInicio: new Date("2023-11-20"),
    fechaFin: new Date("2023-11-30"),
    estado: "Planificada",
    objetivos: "500 leads",
    conversion: "N/A",
    responsable: "Miguel Ángel Ruiz"
  },
  {
    id: 4,
    nombre: "Navidad 2023",
    fechaInicio: new Date("2023-12-01"),
    fechaFin: new Date("2023-12-24"),
    estado: "Planificada", 
    objetivos: "400 leads",
    conversion: "N/A",
    responsable: "Ana María López"
  },
];

// Datos de ejemplo para audiencias
const audienciasData = [
  {
    id: 1,
    nombre: "Empresas 10-50 empleados",
    descripcion: "Empresas objetivo para nómina",
    total: 3,
    empresas: [
      { nombre: "Soluciones S.A.", sector: "Tecnología", empleados: 35, contacto: "soporte@solsa.com" },
      { nombre: "Finanzas Pro", sector: "Finanzas", empleados: 48, contacto: "info@finpro.com" },
      { nombre: "Distribuciones XYZ", sector: "Logística", empleados: 22, contacto: "ventas@xyz.com" },
    ]
  },
  {
    id: 2,
    nombre: "Clientes Premium",
    descripcion: "Empresas con alto volumen de compra",
    total: 2,
    empresas: [
      { nombre: "Alimentos Sabor", sector: "Alimentos", empleados: 60, contacto: "contacto@sabor.com" },
      { nombre: "Servicios Globales", sector: "Servicios", empleados: 45, contacto: "info@servglobal.com" },
    ]
  }
];

const audienciasColumns = [
  { key: "nombre", header: "Audiencia", render: (v: string, row: any) => (
      <div>
        <div className="font-medium text-primary">{v}</div>
        <div className="text-xs text-muted-foreground">{row.descripcion}</div>
      </div>
    ) },
  { key: "total", header: "Empresas" },
  { key: "actions", header: "Acciones", render: (_: any, row: any) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline"><Edit className="h-4 w-4 mr-1"/>Editar</Button>
        <Button size="sm" variant="outline"><Trash2 className="h-4 w-4 mr-1"/>Eliminar</Button>
      </div>
    ) },
];

const renderAudienciaDetalle = (row: any) => (
  <div className="p-2">
    <div className="font-semibold mb-2">Empresas en la audiencia</div>
    <table className="w-full text-sm border rounded overflow-hidden">
      <thead className="bg-muted/40">
        <tr>
          <th className="p-2 text-left">Empresa</th>
          <th className="p-2 text-left">Sector</th>
          <th className="p-2 text-left">Empleados</th>
          <th className="p-2 text-left">Contacto</th>
        </tr>
      </thead>
      <tbody>
        {row.empresas.map((e: any, i: number) => (
          <tr key={i} className="border-b">
            <td className="p-2">{e.nombre}</td>
            <td className="p-2">{e.sector}</td>
            <td className="p-2">{e.empleados}</td>
            <td className="p-2">{e.contacto}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Campanas: React.FC = () => {
  const [campaigns, setCampaigns] = useState(campanasData);
  const handleStart = (row: any) => setCampaigns(prev => prev.map(c => c.id === row.id ? { ...c, estado: 'Activa' } : c));
  const handlePause = (row: any) => setCampaigns(prev => prev.map(c => c.id === row.id ? { ...c, estado: 'Inactiva' } : c));
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showAudiencias, setShowAudiencias] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [metrics, setMetrics] = useState<{label: string, value: string}[]>([]);
  const [newMetricLabel, setNewMetricLabel] = useState("");
  const [newMetricValue, setNewMetricValue] = useState("");
  
  const defaultMetrics = [
    { label: 'Llamadas realizadas', value: 320 },
    { label: 'Contactos efectivos', value: 180 },
    { label: 'Conversiones', value: 58 },
    { label: 'Sentimiento promedio', value: '82%' },
    { label: 'Tasa de éxito', value: '18%' },
  ];

  const isMobile = useIsMobile();
  
  // Convert campaigns state to calendar events
  const calendarEvents = campaigns.map(campaign => ({
    id: campaign.id,
    title: campaign.nombre,
    start: campaign.fechaInicio,
    end: campaign.fechaFin,
    estado: campaign.estado
  }));

  // Handler para abrir detalle
  const handleRowClick = (row: any) => {
    setSelectedCampaign(row);
    setMetrics(defaultMetrics);
    setShowDetailPanel(true);
  };

  // Columnas con click handler
  const columnsWithClick = [
    {
      key: "nombre",
      header: "Campaña",
      render: (value: string, row: any) => (
        <div className="font-medium text-primary cursor-pointer hover:underline" onClick={() => handleRowClick(row)}>{value}</div>
      ),
    },
    {
      key: "fechaInicio",
      header: "Fecha Inicio",
      render: (value: Date) => format(value, "dd/MM/yyyy"),
    },
    {
      key: "fechaFin",
      header: "Fecha Fin",
      render: (value: Date) => format(value, "dd/MM/yyyy"),
    },
    {
      key: "estado",
      header: "Estado",
      render: (value: string) => {
        let badgeClass = "badge-neutral";
        if (value === "Activa") badgeClass = "badge-success";
        if (value === "Inactiva") badgeClass = "badge-neutral";
        if (value === "Planificada") badgeClass = "badge-warning";
        return <span className={`badge ${badgeClass}`}>{value}</span>;
      },
    },
    {
      key: "objetivos",
      header: "Objetivos",
    },
    {
      key: "conversion",
      header: "Conversión",
    },
    {
      key: "responsable",
      header: "Responsable",
    },
    {
      key: "actions",
      header: "Acciones",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          {row.estado === 'Activa' ? (
            <Button size="sm" variant="outline" onClick={() => handlePause(row)} aria-label="Pausar">
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => handleStart(row)} aria-label="Iniciar">
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => handleRowClick(row)} aria-label="Detalle">
            Detalle
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setSelectedCampaign(row); setShowDetailPanel(true); }} aria-label="Editar">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      ),
    },
  ];

  // Audiencia simulada
  const audienceTable = (
    <div className="mt-4">
      <div className="font-semibold mb-2">Audiencia asociada</div>
      <table className="w-full text-sm border rounded overflow-hidden">
        <thead className="bg-muted/40">
          <tr>
            <th className="p-2 text-left">Empresa</th>
            <th className="p-2 text-left">Sector</th>
            <th className="p-2 text-left">Empleados</th>
            <th className="p-2 text-left">Contacto</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b"><td className="p-2">Soluciones S.A.</td><td className="p-2">Tecnología</td><td className="p-2">35</td><td className="p-2">soporte@solsa.com</td></tr>
          <tr className="border-b"><td className="p-2">Finanzas Pro</td><td className="p-2">Finanzas</td><td className="p-2">48</td><td className="p-2">info@finpro.com</td></tr>
          <tr><td className="p-2">Distribuciones XYZ</td><td className="p-2">Logística</td><td className="p-2">22</td><td className="p-2">ventas@xyz.com</td></tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Sección de campañas */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Campañas</h1>
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => setShowNewCampaign(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Nueva Campaña
            </Button>
          </div>
        </div>
        <div className="overflow-auto">
          <DataTable
            columns={columnsWithClick}
            data={campaigns}
          />
        </div>
        <SlidePanel
          isOpen={showNewCampaign}
          onClose={() => setShowNewCampaign(false)}
          title="Nueva Campaña"
          width={isMobile ? "full" : "lg"}
        >
          <CampaignForm onClose={() => setShowNewCampaign(false)} />
        </SlidePanel>
        <SlidePanel
          isOpen={showDetailPanel}
          onClose={() => setShowDetailPanel(false)}
          title={selectedCampaign ? `Editar campaña: ${selectedCampaign.nombre}` : ''}
          width={isMobile ? 'full' : 'lg'}
        >
          {selectedCampaign && (
            <Card className="mb-4">
              <div className="p-4">
                <h2 className="text-lg font-semibold">Resumen de la campaña</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {`La campaña ${selectedCampaign.nombre} ${selectedCampaign.estado === 'Activa' ? 'está activa' : selectedCampaign.estado === 'Inactiva' ? 'está inactiva' : 'está planificada'} desde ${format(selectedCampaign.fechaInicio, 'dd/MM/yyyy')} hasta ${format(selectedCampaign.fechaFin, 'dd/MM/yyyy')}. Objetivos: ${selectedCampaign.objetivos}. Conversión: ${selectedCampaign.conversion}. Responsable: ${selectedCampaign.responsable}.`}
                </p>
              </div>
            </Card>
          )}
          {selectedCampaign && (
            <div className="mt-4">
              <div className="font-semibold mb-2">Métricas</div>
              <ul className="list-disc list-inside">
                {metrics.map((m, i) => <li key={i}>{m.label}: {m.value}</li>)}
              </ul>
              <div className="mt-2 flex gap-2">
                <input type="text" placeholder="Etiqueta" className="input-field flex-1" value={newMetricLabel} onChange={e => setNewMetricLabel(e.target.value)} />
                <input type="text" placeholder="Valor" className="input-field flex-1" value={newMetricValue} onChange={e => setNewMetricValue(e.target.value)} />
                <Button size="sm" onClick={() => { if(newMetricLabel && newMetricValue){ setMetrics(prev => [...prev, { label: newMetricLabel, value: newMetricValue }]); setNewMetricLabel(''); setNewMetricValue(''); } }}>
                  Agregar Métrica
                </Button>
              </div>
            </div>
          )}
          {selectedCampaign && (
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-sm font-medium">Nombre de la campaña</label>
                  <input
                    className="input-field"
                    defaultValue={selectedCampaign.nombre}
                    placeholder="Ej: Campaña Q1 2023"
                  />
                  <label className="block text-sm font-medium">Objetivo</label>
                  <input
                    className="input-field"
                    defaultValue={selectedCampaign.objetivos}
                    placeholder="Ej: 150 leads"
                  />
                  <label className="block text-sm font-medium">Responsable</label>
                  <input
                    className="input-field"
                    defaultValue={selectedCampaign.responsable}
                    placeholder="Nombre del responsable"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium">Estado</label>
                  <select className="input-field" defaultValue={selectedCampaign.estado}>
                    <option value="Activa">Activa</option>
                    <option value="Inactiva">Inactiva</option>
                    <option value="Planificada">Planificada</option>
                  </select>
                  <label className="block text-sm font-medium">Fecha de inicio</label>
                  <input
                    type="date"
                    className="input-field"
                    defaultValue={selectedCampaign.fechaInicio ? format(selectedCampaign.fechaInicio, 'yyyy-MM-dd') : ''}
                  />
                  <label className="block text-sm font-medium">Fecha de fin</label>
                  <input
                    type="date"
                    className="input-field"
                    defaultValue={selectedCampaign.fechaFin ? format(selectedCampaign.fechaFin, 'yyyy-MM-dd') : ''}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium">Descripción</label>
                <textarea
                  className="input-field min-h-[80px]"
                  defaultValue={selectedCampaign.descripcion || ''}
                  placeholder="Describe los objetivos y detalles de la campaña..."
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t pt-6 mt-4">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowDetailPanel(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="default">
                    Guardar Cambios
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary">
                    <Users className="h-4 w-4 mr-1" /> Audiencia
                  </Button>
                </div>
              </div>
            </form>
          )}
        </SlidePanel>
      </div>
    </div>
  );
};

export default Campanas;
