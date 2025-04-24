import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/dashboard/DataTable";
import SlidePanel from "@/components/ui/dashboard/SlidePanel";
import AudienciasForm from "@/components/campaigns/AudienciasForm";
import { useIsMobile } from "@/hooks/use-mobile";

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
    )
  },
  { key: "total", header: "Empresas" },
  { key: "actions", header: "Acciones", render: (_: any, row: any) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline"><Edit className="h-4 w-4 mr-1"/>Editar</Button>
        <Button size="sm" variant="outline"><Trash2 className="h-4 w-4 mr-1"/>Eliminar</Button>
      </div>
    )
  },
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

const Audiencias: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Audiencias</h1>
        <Button onClick={() => setShowPanel(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Nueva Audiencia
        </Button>
      </div>
      <div className="overflow-auto">
        <DataTable
          columns={audienciasColumns}
          data={audienciasData}
          renderExpandedRow={renderAudienciaDetalle}
        />
      </div>
      <SlidePanel
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        title="Crear/Editar Audiencia"
        width={isMobile ? "full" : "lg"}
      >
        <AudienciasForm onClose={() => setShowPanel(false)} />
      </SlidePanel>
    </div>
  );
};

export default Audiencias;
