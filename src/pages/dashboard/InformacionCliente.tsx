
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import KpiCard from '@/components/ui/dashboard/KpiCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import DataTable from '@/components/ui/dashboard/DataTable';
import { format } from 'date-fns';
import ClienteDetalle from '@/components/cliente/ClienteDetalle';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// KPI data
const kpiData = [
  {
    title: "Clientes Activos",
    value: "1,248",
    change: "+12.5%",
    changeType: "positive" as "positive"
  },
  {
    title: "Nuevos Clientes (30d)",
    value: "64",
    change: "+4.3%",
    changeType: "positive" as "positive"
  },
  {
    title: "Tasa de Conversión",
    value: "24.8%",
    change: "-2.5%",
    changeType: "negative" as "negative"
  },
  {
    title: "Tickets Abiertos",
    value: "42",
    change: "+8",
    changeType: "neutral" as "neutral"
  }
];

// Table data for clients
const clientesData = [
  {
    id: "CL-1001",
    nombre: "Carlos Rodríguez",
    empresa: "TechSolutions SpA",
    ultimoContacto: new Date(2025, 3, 15),
    estado: "Activo",
    prioridad: "Alta"
  },
  {
    id: "CL-1002",
    nombre: "Ana María López",
    empresa: "Comercial Andina Ltda.",
    ultimoContacto: new Date(2025, 3, 12),
    estado: "En Seguimiento",
    prioridad: "Media"
  },
  {
    id: "CL-1003",
    nombre: "Juan Pérez",
    empresa: "Constructora del Valle S.A.",
    ultimoContacto: new Date(2025, 3, 10),
    estado: "Nuevo",
    prioridad: "Baja"
  },
  {
    id: "CL-1004",
    nombre: "Marcela González",
    empresa: "Servicios Financieros Integra",
    ultimoContacto: new Date(2025, 2, 28),
    estado: "Inactivo",
    prioridad: "Baja"
  },
  {
    id: "CL-1005",
    nombre: "Roberto Fuentes",
    empresa: "Importadora Pacífico",
    ultimoContacto: new Date(2025, 3, 5),
    estado: "Activo",
    prioridad: "Alta"
  }
];

// Table data for prospects
const prospectosData = [
  {
    id: "PR-1001",
    nombre: "Luisa Morales",
    empresa: "Distribuidora Nacional S.A.",
    ultimoContacto: new Date(2025, 3, 18),
    estado: "En Seguimiento",
    prioridad: "Alta"
  },
  {
    id: "PR-1002",
    nombre: "Fernando Ruiz",
    empresa: "Tecnología Avanzada Ltda.",
    ultimoContacto: new Date(2025, 3, 14),
    estado: "Nuevo",
    prioridad: "Media"
  },
  {
    id: "PR-1003",
    nombre: "Paula Sánchez",
    empresa: "Consultora Estratégica Global",
    ultimoContacto: new Date(2025, 3, 11),
    estado: "En Seguimiento",
    prioridad: "Baja"
  },
  {
    id: "PR-1004",
    nombre: "Gabriel Mendoza",
    empresa: "Soluciones Digitales Express",
    ultimoContacto: new Date(2025, 3, 8),
    estado: "Nuevo",
    prioridad: "Alta"
  }
];

const clientesColumns = [
  {
    key: "id",
    header: "ID"
  },
  {
    key: "nombre",
    header: "Nombre"
  },
  {
    key: "empresa",
    header: "Empresa"
  },
  { 
    key: "ultimoContacto", 
    header: "Último Contacto",
    render: (value: Date) => format(value, 'dd/MM/yyyy')
  },
  {
    key: "estado",
    header: "Estado",
    render: (value: string) => {
      let badgeClass = "badge-neutral";
      switch (value) {
        case "Activo":
          badgeClass = "badge-success";
          break;
        case "En Seguimiento":
          badgeClass = "badge-warning";
          break;
        case "Nuevo":
          badgeClass = "badge-primary";
          break;
        case "Inactivo":
          badgeClass = "badge-neutral";
          break;
        default:
          badgeClass = "badge-neutral";
      }
      return <span className={`badge ${badgeClass}`}>{value}</span>;
    }
  },
  {
    key: "prioridad",
    header: "Prioridad",
    render: (value: string) => {
      let badgeClass = "badge ";
      switch (value) {
        case "Alta":
          badgeClass += "badge-danger";
          break;
        case "Media":
          badgeClass += "badge-warning";
          break;
        case "Baja":
          badgeClass += "badge-neutral";
          break;
        default:
          badgeClass += "badge-neutral";
      }
      return <span className={badgeClass}>{value}</span>;
    }
  }
];

const InformacionCliente: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('clientes');

  // Filter data based on search term
  const filterData = (data: any[]) => {
    if (!searchTerm) return data;
    
    return data.filter(item => 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredClientes = filterData(clientesData);
  const filteredProspectos = filterData(prospectosData);

  // Función para mostrar transcripción cuando se haga clic en el botón
  const handleMostrarTranscripcion = () => {
    toast.success("Transcripción de llamada abierta", {
      description: "Se ha abierto la transcripción completa de la llamada."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Información de Cliente</h1>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-8 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
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
        <Tabs 
          defaultValue="clientes" 
          value={selectedTab}
          onValueChange={setSelectedTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="prospectos">Prospectos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="clientes">
            <h2 className="text-xl font-semibold mb-4">Lista de Clientes</h2>
            <DataTable 
              columns={clientesColumns}
              data={filteredClientes}
              showCheckboxes={true}
              renderExpandedRow={(cliente) => (
                <ClienteDetalle cliente={cliente} />
              )}
            />
          </TabsContent>
          
          <TabsContent value="prospectos">
            <h2 className="text-xl font-semibold mb-4">Lista de Prospectos</h2>
            <DataTable 
              columns={clientesColumns}
              data={filteredProspectos}
              showCheckboxes={true}
              renderExpandedRow={(cliente) => (
                <ClienteDetalle cliente={cliente} />
              )}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default InformacionCliente;
