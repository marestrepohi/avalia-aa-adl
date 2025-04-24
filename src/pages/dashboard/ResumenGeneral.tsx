import React, { useState } from "react";
import { Calendar, Phone, Users, DollarSign, ChevronDown, Download } from "lucide-react";
import KpiCard from "../../components/ui/dashboard/KpiCard";
import BarChart from "../../components/ui/dashboard/BarChart";
import DataTable from "../../components/ui/dashboard/DataTable";
import { Input, Button, Select } from "../../components/ui/dashboard/FormControls";

// Sample data for the bar chart
const chartData = [
  { name: "Lun", value: 78 },
  { name: "Mar", value: 65 },
  { name: "Mié", value: 82 },
  { name: "Jue", value: 91 },
  { name: "Vie", value: 112 },
  { name: "Sáb", value: 48 },
  { name: "Dom", value: 22 },
];

// Sample data for the table
const tableData = [
  {
    id: 1,
    cliente: "Empresa ABC",
    contacto: "Juan Pérez",
    telefono: "+52 55 1234 5678",
    estado: "Completado",
    fecha: "12/04/2023",
  },
  {
    id: 2,
    cliente: "Corporativo XYZ",
    contacto: "Ana López",
    telefono: "+52 55 8765 4321",
    estado: "Pendiente",
    fecha: "13/04/2023",
  },
  {
    id: 3,
    cliente: "Industrias 123",
    contacto: "Carlos Sánchez",
    telefono: "+52 55 2345 6789",
    estado: "En progreso",
    fecha: "14/04/2023",
  },
  {
    id: 4,
    cliente: "Servicios Globales",
    contacto: "María Rodríguez",
    telefono: "+52 55 3456 7890",
    estado: "Cancelado",
    fecha: "15/04/2023",
  },
  {
    id: 5,
    cliente: "Tecnología Avanzada",
    contacto: "Roberto Gómez",
    telefono: "+52 55 4567 8901",
    estado: "Completado",
    fecha: "16/04/2023",
  },
  {
    id: 6,
    cliente: "Innovaciones S.A.",
    contacto: "Patricia Flores",
    telefono: "+52 55 5678 9012",
    estado: "Pendiente",
    fecha: "17/04/2023",
  },
  {
    id: 7,
    cliente: "Consultores Unidos",
    contacto: "Fernando Torres",
    telefono: "+52 55 6789 0123",
    estado: "En progreso",
    fecha: "18/04/2023",
  },
];

// Table columns config
const tableColumns = [
  {
    key: "cliente",
    header: "Cliente",
    render: (value: string, row: any) => (
      <div>
        <div className="font-medium">{value}</div>
        <div className="text-xs text-muted-foreground">{row.contacto}</div>
      </div>
    ),
  },
  {
    key: "telefono",
    header: "Teléfono",
  },
  {
    key: "estado",
    header: "Estado",
    render: (value: string) => {
      const badgeClass =
        value === "Completado"
          ? "badge-success"
          : value === "Pendiente"
          ? "badge-warning"
          : value === "Cancelado"
          ? "badge-error"
          : "badge-neutral";
      return <span className={`badge ${badgeClass}`}>{value}</span>;
    },
  },
  {
    key: "fecha",
    header: "Fecha",
  },
];

// Opciones para el selector de rango de fechas
const dateOptions = [
  { value: "Esta Semana", label: "Esta Semana" },
  { value: "Este Mes", label: "Este Mes" },
  { value: "Últimos 30 Días", label: "Últimos 30 Días" },
];

const ResumenGeneral: React.FC = () => {
  const [dateRange, setDateRange] = useState("Esta Semana");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Resumen General</h1>
        <div className="flex items-center gap-4">
          {/* Selector de rango de fecha */}
          <Select
            options={dateOptions}
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="w-48"
          />
          {/* Botón de exportar */}
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <KpiCard
          title="Total Llamadas"
          value="1,245"
          change="12%"
          changeType="positive"
          icon={<Phone className="h-5 w-5 text-primary" />}
        />
        <KpiCard
          title="Agentes Activos"
          value="12"
          change="2"
          changeType="positive"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <KpiCard
          title="Leads Generados"
          value="89"
          change="7%"
          changeType="positive"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <KpiCard
          title="Ingreso Estimado"
          value="$24,500"
          change="5%"
          changeType="negative"
          icon={<DollarSign className="h-5 w-5 text-primary" />}
        />
        <KpiCard
          title="Tasa de Conversión"
          value="68%"
          change="+4%"
          changeType="positive"
          icon={<DollarSign className="h-5 w-5 text-green-500" />}
        />
        <KpiCard
          title="Duración Promedio"
          value="05:32"
          change="-1%"
          changeType="negative"
          icon={<Phone className="h-5 w-5 text-blue-500" />}
        />
        <KpiCard
          title="Satisfacción NPS"
          value="78%"
          change="+3"
          changeType="positive"
          icon={<Users className="h-5 w-5 text-purple-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <BarChart
            title="Llamadas por Día"
            subtitle="Últimos 7 días"
            data={chartData}
          />
        </div>
        <div>
          <div className="bg-white rounded-lg shadow-card p-5 card-hover h-80 flex flex-col">
            <div className="mb-4">
              <h3 className="font-semibold">Próximos Eventos</h3>
              <p className="text-sm text-muted-foreground">Para hoy</p>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-b-0">
                  <div className="bg-primary-light rounded-md p-2 mt-0.5">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Llamada programada</p>
                    <p className="text-xs text-muted-foreground">15:00 - Cliente {i + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={tableColumns}
        data={tableData}
        className="mb-8"
      />
    </div>
  );
};

export default ResumenGeneral;
