import React, { useState } from "react";
import { Search, Filter, Eye, Edit, Trash2, Plus } from "lucide-react";
import DataTable from "../../components/ui/dashboard/DataTable";
import { format } from "date-fns";
import { Button } from "../../components/ui/button";

// Datos de ejemplo para cuentas bancarias
const cuentasData = [
  {
    id: 1,
    cliente: "Juan Pérez",
    empresa: "TechSolutions S.A.",
    banco: "BBVA",
    tipoCuenta: "Cuenta Corriente",
    numeroCuenta: "ES12 1234 5678 9012 3456 7890",
    saldo: "€24,500",
    ultimaActualizacion: new Date("2023-03-01")
  },
  {
    id: 2,
    cliente: "Juan Pérez",
    empresa: "TechSolutions S.A.",
    banco: "Santander",
    tipoCuenta: "Cuenta de Ahorro",
    numeroCuenta: "ES98 8765 4321 0987 6543 2109",
    saldo: "€35,750",
    ultimaActualizacion: new Date("2023-03-05")
  },
  {
    id: 3,
    cliente: "Carlos Rodríguez",
    empresa: "Industrias ARC",
    banco: "CaixaBank",
    tipoCuenta: "Cuenta Corriente",
    numeroCuenta: "ES45 5432 1098 7654 3210 9876",
    saldo: "€18,200",
    ultimaActualizacion: new Date("2023-02-25")
  },
  {
    id: 4,
    cliente: "Laura Martínez",
    empresa: "Consultora Innovación",
    banco: "Banco Sabadell",
    tipoCuenta: "Cuenta de Inversión",
    numeroCuenta: "ES67 8901 2345 6789 0123 4567",
    saldo: "€42,800",
    ultimaActualizacion: new Date("2023-03-08")
  }
];

// Columnas para la tabla de cuentas bancarias
const columnasCuentas = [
  {
    key: "cliente",
    header: "Cliente",
    render: (value: string, row: any) => (
      <div>
        <div className="font-medium text-primary hover:underline cursor-pointer">{value}</div>
        <div className="text-xs text-muted-foreground">{row.empresa}</div>
      </div>
    ),
  },
  {
    key: "banco",
    header: "Banco",
  },
  {
    key: "tipoCuenta",
    header: "Tipo",
  },
  {
    key: "numeroCuenta",
    header: "Número de Cuenta",
    render: (value: string) => (
      <span className="font-mono text-sm">
        {value.substring(0, 8)}...{value.substring(value.length - 4)}
      </span>
    ),
  },
  {
    key: "saldo",
    header: "Saldo",
    render: (value: string) => (
      <span className="font-medium">{value}</span>
    ),
  },
  {
    key: "ultimaActualizacion",
    header: "Actualizado",
    render: (value: Date) => format(value, "dd/MM/yyyy"),
  },
  {
    key: "actions",
    header: "Acciones",
    render: (_: any, row: any) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="group" aria-label="Ver Detalles">
          <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          <span className="tooltip -bottom-8">Ver Detalles</span>
        </Button>
        <Button variant="ghost" size="icon" className="group" aria-label="Editar">
          <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          <span className="tooltip -bottom-8">Editar</span>
        </Button>
        <Button variant="ghost" size="icon" className="group" aria-label="Eliminar">
          <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
          <span className="tooltip -bottom-8">Eliminar</span>
        </Button>
      </div>
    ),
  },
];

const InformacionBancaria: React.FC = () => {
  const [filtro, setFiltro] = useState("");
  
  // Filtrar cuentas por cliente o banco
  const cuentasFiltradas = cuentasData.filter(cuenta => 
    cuenta.cliente.toLowerCase().includes(filtro.toLowerCase()) || 
    cuenta.banco.toLowerCase().includes(filtro.toLowerCase()) ||
    cuenta.numeroCuenta.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Información Bancaria</h1>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="h-5 w-5" /> Añadir Cuenta
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="max-w-md flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              type="text"
              placeholder="Buscar por cliente, banco o número de cuenta..."
              className="input-field pl-10"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>
        <button className="icon-button group">
          <Filter className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
          <span className="tooltip -bottom-8">Filtrar</span>
        </button>
      </div>

      <DataTable 
        columns={columnasCuentas}
        data={cuentasFiltradas}
        emptyMessage="No se encontraron cuentas bancarias"
      />
    </div>
  );
};

export default InformacionBancaria;
