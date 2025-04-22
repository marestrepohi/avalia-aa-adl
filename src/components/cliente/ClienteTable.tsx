
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataTable from "@/components/ui/dashboard/DataTable";
import ClientePerfilDrawer from "./ClientePerfilDrawer";

const clientesData = [
  {
    id: "CL-1001",
    nombre: "Carlos Rodríguez",
    empresa: "TechSolutions SpA",
    estado: "Activo",
    prioridad: "Alta"
  },
  {
    id: "CL-1002",
    nombre: "Ana María López",
    empresa: "Comercial Andina Ltda.",
    estado: "En Seguimiento",
    prioridad: "Media"
  },
  {
    id: "CL-1003",
    nombre: "Juan Pérez",
    empresa: "Constructora del Valle S.A.",
    estado: "Nuevo",
    prioridad: "Baja"
  },
  {
    id: "CL-1004",
    nombre: "Marcela González",
    empresa: "Servicios Financieros Integra",
    estado: "Inactivo",
    prioridad: "Baja"
  }
];

const prospectosData = [
  {
    id: "PR-1001",
    nombre: "Luisa Morales",
    empresa: "Distribuidora Nacional S.A.",
    estado: "En Seguimiento",
    prioridad: "Alta"
  },
  {
    id: "PR-1002",
    nombre: "Fernando Ruiz",
    empresa: "Tecnología Avanzada Ltda.",
    estado: "Nuevo",
    prioridad: "Media"
  },
  {
    id: "PR-1003",
    nombre: "Paula Sánchez",
    empresa: "Consultora Estratégica Global",
    estado: "En Seguimiento",
    prioridad: "Baja"
  }
];

const columns = [
  { key: "id", header: "ID" },
  { key: "nombre", header: "Nombre" },
  { key: "empresa", header: "Empresa" },
  {
    key: "estado", header: "Estado", render: (value: string) =>
      <span className={`badge ${value === "Activo" ? "badge-success" :
        value === "En Seguimiento" ? "badge-warning" :
        value === "Nuevo" ? "badge-primary" : "badge-neutral"}`}>{value}</span>
  },
  {
    key: "prioridad", header: "Prioridad", render: (value: string) =>
      <span className={`badge ${value === "Alta" ? "badge-danger" :
        value === "Media" ? "badge-warning" : "badge-neutral"}`}>{value}</span>
  }
];

const ClienteTable = () => {
  const [selectedTab, setSelectedTab] = useState("clientes");
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [perfilCliente, setPerfilCliente] = useState<any | null>(null);

  const handleExpand = (cliente: any) => {
    setPerfilCliente(cliente);
    setPerfilOpen(true);
  };

  return (
    <Card className="p-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="prospectos">Prospectos</TabsTrigger>
        </TabsList>
        <TabsContent value="clientes">
          <DataTable
            columns={columns}
            data={clientesData}
            showCheckboxes={false}
            renderExpandedRow={(cliente) =>
              <button
                className="w-full text-left"
                onClick={() => handleExpand(cliente)}
                aria-label="Ver perfil del cliente"
              >
                <span className="font-medium text-primary underline decoration-dotted hover:decoration-solid">
                  Ver perfil completo de {cliente.nombre}
                </span>
              </button>
            }
          />
        </TabsContent>
        <TabsContent value="prospectos">
          <DataTable
            columns={columns}
            data={prospectosData}
            showCheckboxes={false}
            renderExpandedRow={(cliente) =>
              <button
                className="w-full text-left"
                onClick={() => handleExpand(cliente)}
                aria-label="Ver perfil del prospecto"
              >
                <span className="font-medium text-primary underline decoration-dotted hover:decoration-solid">
                  Ver perfil completo de {cliente.nombre}
                </span>
              </button>
            }
          />
        </TabsContent>
      </Tabs>
      <ClientePerfilDrawer 
        open={perfilOpen}
        onClose={() => setPerfilOpen(false)}
        cliente={perfilCliente}
      />
    </Card>
  );
};

export default ClienteTable;
