import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import KpiCard from '@/components/ui/dashboard/KpiCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, ChevronDown, ChevronUp, Clock, Info, Search, User } from 'lucide-react';
import DataTable from '@/components/ui/dashboard/DataTable';
import { format } from 'date-fns';

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
    id: "PR-2001",
    nombre: "Francisca Silva",
    empresa: "Distribuidora Nacional",
    origen: "Formulario Web",
    estado: "Calificado",
    fecha: new Date(2025, 3, 14)
  },
  {
    id: "PR-2002",
    nombre: "Andrés Martínez",
    empresa: "Inversiones del Sur",
    origen: "Feria Comercial",
    estado: "Nuevo",
    fecha: new Date(2025, 3, 13)
  },
  {
    id: "PR-2003",
    nombre: "Carmen Soto",
    empresa: "Restaurant El Bosque",
    origen: "Referido",
    estado: "En Contacto",
    fecha: new Date(2025, 3, 11)
  },
  {
    id: "PR-2004",
    nombre: "Diego Vargas",
    empresa: "Consultora Estratégica",
    origen: "LinkedIn",
    estado: "No Calificado",
    fecha: new Date(2025, 3, 9)
  },
  {
    id: "PR-2005",
    nombre: "Paulina Reyes",
    empresa: "Farmacia Regional",
    origen: "Google Ads",
    estado: "En Contacto",
    fecha: new Date(2025, 3, 8)
  }
];

// Table data for accounts
const cuentasData = [
  {
    id: "AC-3001",
    nombre: "TechSolutions SpA",
    tipo: "Cliente Premium",
    ingresos: "$12,450,000",
    ultimaCompra: new Date(2025, 3, 10),
    estado: "Activo"
  },
  {
    id: "AC-3002",
    nombre: "Comercial Andina Ltda.",
    tipo: "Cliente Estándar",
    ingresos: "$4,280,000",
    ultimaCompra: new Date(2025, 3, 1),
    estado: "Activo"
  },
  {
    id: "AC-3003",
    nombre: "Constructora del Valle S.A.",
    tipo: "Cliente Premium",
    ingresos: "$28,300,000",
    ultimaCompra: new Date(2025, 2, 20),
    estado: "Activo"
  },
  {
    id: "AC-3004",
    nombre: "Servicios Financieros Integra",
    tipo: "Cliente Estándar",
    ingresos: "$5,430,000",
    ultimaCompra: new Date(2025, 1, 15),
    estado: "Inactivo"
  },
  {
    id: "AC-3005",
    nombre: "Importadora Pacífico",
    tipo: "Cliente Premium",
    ingresos: "$16,750,000",
    ultimaCompra: new Date(2025, 3, 5),
    estado: "Activo"
  }
];

// Table data for contacts
const contactosData = [
  {
    id: "CO-4001",
    nombre: "Carlos Rodríguez",
    cargo: "Gerente General",
    empresa: "TechSolutions SpA",
    email: "carlos.rodriguez@techsolutions.cl",
    telefono: "+56 9 8765 4321"
  },
  {
    id: "CO-4002",
    nombre: "Ana María López",
    cargo: "Directora Comercial",
    empresa: "Comercial Andina Ltda.",
    email: "alopez@comercialandina.cl",
    telefono: "+56 9 8765 1234"
  },
  {
    id: "CO-4003",
    nombre: "Juan Pérez",
    cargo: "Jefe de Compras",
    empresa: "Constructora del Valle S.A.",
    email: "jperez@constructoradelvalle.cl",
    telefono: "+56 9 7654 3210"
  },
  {
    id: "CO-4004",
    nombre: "Marcela González",
    cargo: "Gerente Finanzas",
    empresa: "Servicios Financieros Integra",
    email: "mgonzalez@integrafinance.cl",
    telefono: "+56 9 6543 2109"
  },
  {
    id: "CO-4005",
    nombre: "Roberto Fuentes",
    cargo: "Director Operaciones",
    empresa: "Importadora Pacífico",
    email: "rfuentes@importadorapacifico.cl",
    telefono: "+56 9 5432 1098"
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

const prospectosColumns = [
  { key: "id", header: "ID" },
  { key: "nombre", header: "Nombre" },
  { key: "empresa", header: "Empresa" },
  { key: "origen", header: "Origen" },
  {
    key: "estado",
    header: "Estado",
    render: (value: string) => {
      let badgeClass = "badge ";
      switch (value) {
        case "Calificado":
          badgeClass += "badge-success";
          break;
        case "En Contacto":
          badgeClass += "badge-warning";
          break;
        case "Nuevo":
          badgeClass += "badge-primary";
          break;
        case "No Calificado":
          badgeClass += "badge-neutral";
          break;
        default:
          badgeClass += "badge-neutral";
      }
      return <span className={badgeClass}>{value}</span>;
    }
  },
  { 
    key: "fecha", 
    header: "Fecha",
    render: (value: Date) => format(value, 'dd/MM/yyyy')
  }
];

const cuentasColumns = [
  { key: "id", header: "ID" },
  { key: "nombre", header: "Nombre" },
  { key: "tipo", header: "Tipo" },
  { key: "ingresos", header: "Ingresos Anuales" },
  { 
    key: "ultimaCompra", 
    header: "Última Compra",
    render: (value: Date) => format(value, 'dd/MM/yyyy')
  },
  {
    key: "estado",
    header: "Estado",
    render: (value: string) => {
      let badgeClass = "badge ";
      switch (value) {
        case "Activo":
          badgeClass += "badge-success";
          break;
        case "Inactivo":
          badgeClass += "badge-neutral";
          break;
        default:
          badgeClass += "badge-neutral";
      }
      return <span className={badgeClass}>{value}</span>;
    }
  }
];

const contactosColumns = [
  { key: "id", header: "ID" },
  { key: "nombre", header: "Nombre" },
  { key: "cargo", header: "Cargo" },
  { key: "empresa", header: "Empresa" },
  { key: "email", header: "Email" },
  { key: "telefono", header: "Teléfono" }
];

const InformacionCliente: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="dashboard">Panel Principal</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="prospectos">Prospectos</TabsTrigger>
          <TabsTrigger value="cuentas">Cuentas</TabsTrigger>
          <TabsTrigger value="contactos">Contactos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
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
            <h2 className="text-xl font-semibold mb-4">Clientes a Contactar</h2>
            <DataTable 
              columns={clientesColumns}
              data={clientesData}
              showCheckboxes={true}
            />
            <div className="mt-4 flex justify-end">
              <Button>
                <CheckCircle className="mr-2 h-4 w-4" />
                Iniciar Llamadas Seleccionadas
              </Button>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-light p-2 rounded-full mr-3">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Nuevo cliente registrado</p>
                    <p className="text-sm text-muted-foreground">Francisca Silva - Distribuidora Nacional</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1" /> Hace 2 horas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-success-light p-2 rounded-full mr-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Venta finalizada</p>
                    <p className="text-sm text-muted-foreground">TechSolutions SpA - $4,500,000</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1" /> Hace 5 horas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-warning-light p-2 rounded-full mr-3">
                    <Info className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Seguimiento pendiente</p>
                    <p className="text-sm text-muted-foreground">Comercial Andina Ltda. - Ana María López</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1" /> Hace 1 día
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">Ver todas las actividades</Button>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Información Bancaria</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clientes con pago automático:</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '68%' }}></div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Facturas pendientes:</span>
                  <span className="font-medium">12</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto total por cobrar:</span>
                  <span className="font-medium">$18,450,000</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Próximos vencimientos (7 días):</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">Ver detalles bancarios</Button>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="clientes">
          <Card className="p-6">
            <DataTable 
              columns={clientesColumns}
              data={clientesData}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="prospectos">
          <Card className="p-6">
            <DataTable 
              columns={prospectosColumns}
              data={prospectosData}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="cuentas">
          <Card className="p-6">
            <DataTable 
              columns={cuentasColumns}
              data={cuentasData}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="contactos">
          <Card className="p-6">
            <DataTable 
              columns={contactosColumns}
              data={contactosData}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InformacionCliente;
