
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/dashboard/DataTable";
import ClientePerfilDrawer from "./ClientePerfilDrawer";

// Simulación de datos creativos y más ricos
const clientesData = [
  {
    id: "CL-1001",
    nombre: "Carlos Rodríguez",
    empresa: "TechSolutions SpA",
    estado: "Activo",
    prioridad: "Alta",
    creditoAnual: 18500000,
    cuentaAhorro: true,
    redTransaccionalImportancia: "Alta",
    proximoProducto: "Inversión Fondos Mutuos",
  },
  {
    id: "CL-1002",
    nombre: "Ana María López",
    empresa: "Comercial Andina Ltda.",
    estado: "En Seguimiento",
    prioridad: "Media",
    creditoAnual: 9500000,
    cuentaAhorro: false,
    redTransaccionalImportancia: "Media",
    proximoProducto: "Tarjeta de Crédito Empresarial",
  },
  {
    id: "CL-1003",
    nombre: "Juan Pérez",
    empresa: "Constructora del Valle S.A.",
    estado: "Nuevo",
    prioridad: "Baja",
    creditoAnual: 0,
    cuentaAhorro: false,
    redTransaccionalImportancia: "Baja",
    proximoProducto: "Cuenta de Ahorro",
  },
];

const prospectosData = [
  {
    id: "PR-1001",
    nombre: "Luisa Morales",
    empresa: "Distribuidora Nacional S.A.",
    estado: "En Seguimiento",
    prioridad: "Alta",
    dineroIngresado: 3100000,
    posibleCliente: "Carlos Rodríguez",
  },
  {
    id: "PR-1002",
    nombre: "Fernando Ruiz",
    empresa: "Tecnología Avanzada Ltda.",
    estado: "Nuevo",
    prioridad: "Media",
    dineroIngresado: 0,
    posibleCliente: "Ana María López",
  }
];

const columnsCliente = [
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
    key: "creditoAnual", header: "Crédito Anual", render: (value: number) =>
      <span>${value.toLocaleString("es-CL")}</span>
  },
  {
    key: "cuentaAhorro", header: "Cuenta Ahorro", render: (value: boolean) =>
      value ? <span className="badge badge-success">Sí</span> : <span className="badge badge-destructive">No</span>
  },
  {
    key: "redTransaccionalImportancia", header: "Red Transaccional", render: (value: string) =>
      <span className={`badge ${value === "Alta" ? "badge-success" : value === "Media" ? "badge-warning" : "badge-neutral"}`}>{value}</span>
  },
  {
    key: "proximoProducto", header: "Próx. mejor producto"
  },
  {
    key: "prioridad", header: "Prioridad", render: (value: string) =>
      <span className={`badge ${value === "Alta" ? "badge-danger" :
        value === "Media" ? "badge-warning" : "badge-neutral"}`}>{value}</span>
  }
];

const columnsProspecto = [
  { key: "id", header: "ID" },
  { key: "nombre", header: "Nombre" },
  { key: "empresa", header: "Empresa" },
  {
    key: "estado", header: "Estado", render: (value: string) =>
      <span className={`badge ${value === "En Seguimiento" ? "badge-warning" : "badge-primary"}`}>{value}</span>
  },
  {
    key: "dineroIngresado", header: "Dinero ingresado al banco", render: (value: number) =>
      <span>${value.toLocaleString("es-CL")}</span>
  },
  {
    key: "posibleCliente", header: "Relacionar a"
  },
  {
    key: "prioridad", header: "Prioridad", render: (value: string) =>
      <span className={`badge ${value === "Alta" ? "badge-danger" :
        value === "Media" ? "badge-warning" : "badge-neutral"}`}>{value}</span>
  }
];

const PanelPrincipal = () => {
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [perfilCliente, setPerfilCliente] = useState<any | null>(null);

  const handleExpand = (cliente: any) => {
    setPerfilCliente(cliente);
    setPerfilOpen(true);
  };

  return (
    <div className="flex flex-col gap-10">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2 text-primary">Clientes</h2>
        <DataTable
          columns={columnsCliente}
          data={clientesData}
          showCheckboxes={false}
          renderExpandedRow={cliente =>
            <button
              className="w-full text-left"
              onClick={() => handleExpand(cliente)}
              aria-label={`Ver perfil completo de ${cliente.nombre}`}
            >
              <span className="font-medium text-primary underline decoration-dotted hover:decoration-solid">
                Ver perfil completo de {cliente.nombre}
              </span>
            </button>
          }
        />
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2 text-primary">Prospectos</h2>
        <DataTable
          columns={columnsProspecto}
          data={prospectosData}
          showCheckboxes={false}
        />
      </Card>
      <ClientePerfilDrawer
        open={perfilOpen}
        onClose={() => setPerfilOpen(false)}
        cliente={perfilCliente}
      />
    </div>
  );
};

export default PanelPrincipal;
