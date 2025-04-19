
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, UserSquare2, Users, Calendar, CreditCard } from "lucide-react";
import DataTable from "../../components/ui/dashboard/DataTable";
import { format } from "date-fns";

// Datos de ejemplo para clientes
const clientesData = [
  {
    id: 1,
    nombre: "Juan Pérez",
    empresa: "TechSolutions S.A.",
    email: "juan.perez@techsolutions.com",
    telefono: "+34 612 345 678",
    ultimoContacto: new Date("2023-02-15"),
    estado: "Cliente",
    valorAnual: "€120,000"
  },
  {
    id: 2,
    nombre: "María González",
    empresa: "Marketing Digital SL",
    email: "maria.gonzalez@marketingdigital.es",
    telefono: "+34 623 456 789",
    ultimoContacto: new Date("2023-03-01"),
    estado: "Prospecto",
    valorAnual: "€0"
  },
  {
    id: 3,
    nombre: "Carlos Rodríguez",
    empresa: "Industrias ARC",
    email: "carlos.rodriguez@industriasarc.com",
    telefono: "+34 634 567 890",
    ultimoContacto: new Date("2023-02-28"),
    estado: "Cliente",
    valorAnual: "€85,000"
  },
  {
    id: 4,
    nombre: "Laura Martínez",
    empresa: "Consultora Innovación",
    email: "laura.martinez@consultorainnovacion.es",
    telefono: "+34 645 678 901",
    ultimoContacto: new Date("2023-01-20"),
    estado: "Cliente",
    valorAnual: "€65,000"
  },
  {
    id: 5,
    nombre: "Miguel Ángel López",
    empresa: "Construcciones López",
    email: "miguel.lopez@construccioneslopez.es",
    telefono: "+34 656 789 012",
    ultimoContacto: new Date("2023-03-10"),
    estado: "Prospecto",
    valorAnual: "€0"
  }
];

// Datos de cuentas bancarias
const cuentasData = [
  {
    id: 1,
    clienteId: 1,
    banco: "BBVA",
    tipoCuenta: "Cuenta Corriente",
    numeroCuenta: "ES12 1234 5678 9012 3456 7890",
    saldo: "€24,500",
    ultimaActualizacion: new Date("2023-03-01")
  },
  {
    id: 2,
    clienteId: 1,
    banco: "Santander",
    tipoCuenta: "Cuenta de Ahorro",
    numeroCuenta: "ES98 8765 4321 0987 6543 2109",
    saldo: "€35,750",
    ultimaActualizacion: new Date("2023-03-05")
  },
  {
    id: 3,
    clienteId: 3,
    banco: "CaixaBank",
    tipoCuenta: "Cuenta Corriente",
    numeroCuenta: "ES45 5432 1098 7654 3210 9876",
    saldo: "€18,200",
    ultimaActualizacion: new Date("2023-02-25")
  },
  {
    id: 4,
    clienteId: 4,
    banco: "Banco Sabadell",
    tipoCuenta: "Cuenta de Inversión",
    numeroCuenta: "ES67 8901 2345 6789 0123 4567",
    saldo: "€42,800",
    ultimaActualizacion: new Date("2023-03-08")
  }
];

// Columnas para la tabla de clientes
const columnasClientes = [
  {
    key: "nombre",
    header: "Nombre",
    render: (value: string, row: any) => (
      <div>
        <div className="font-medium text-primary hover:underline cursor-pointer">{value}</div>
        <div className="text-xs text-muted-foreground">{row.empresa}</div>
      </div>
    ),
  },
  {
    key: "email",
    header: "Contacto",
    render: (value: string, row: any) => (
      <div>
        <div>{value}</div>
        <div className="text-xs text-muted-foreground">{row.telefono}</div>
      </div>
    ),
  },
  {
    key: "ultimoContacto",
    header: "Último Contacto",
    render: (value: Date) => format(value, "dd/MM/yyyy"),
  },
  {
    key: "estado",
    header: "Estado",
    render: (value: string) => {
      const badgeClass = value === "Cliente" ? "badge-success" : "badge-warning";
      return <span className={`badge ${badgeClass}`}>{value}</span>;
    },
  },
  {
    key: "valorAnual",
    header: "Valor Anual",
  }
];

// Columnas para la tabla de cuentas bancarias
const columnasCuentas = [
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
      <span className="font-mono text-sm">{value}</span>
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
  }
];

const InformacionCliente: React.FC = () => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);
  const [tabActiva, setTabActiva] = useState("informacion");
  
  // Filtrar cuentas por cliente seleccionado
  const cuentasCliente = cuentasData.filter(cuenta => 
    clienteSeleccionado ? cuenta.clienteId === clienteSeleccionado : true
  );
  
  // Manejar la selección de un cliente
  const seleccionarCliente = (clienteId: number) => {
    setClienteSeleccionado(clienteId === clienteSeleccionado ? null : clienteId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Información de Clientes</h1>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="max-w-md flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              type="text"
              placeholder="Buscar clientes..."
              className="input-field pl-10"
            />
          </div>
        </div>
        <button className="icon-button group">
          <Filter className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
          <span className="tooltip -bottom-8">Filtrar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-card p-5 overflow-hidden card-hover">
            <h2 className="text-lg font-medium mb-4">Clientes</h2>
            <div className="space-y-2">
              {clientesData.map((cliente) => (
                <div 
                  key={cliente.id}
                  className={`p-3 rounded-md cursor-pointer transition-all ${
                    clienteSeleccionado === cliente.id 
                      ? 'bg-primary/10 border-l-4 border-primary' 
                      : 'hover:bg-muted/50 border-l-4 border-transparent'
                  }`}
                  onClick={() => seleccionarCliente(cliente.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{cliente.nombre}</div>
                      <div className="text-sm text-muted-foreground">{cliente.empresa}</div>
                    </div>
                    <span className={`badge ${cliente.estado === "Cliente" ? "badge-success" : "badge-warning"}`}>
                      {cliente.estado}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {cliente.email} • {cliente.telefono}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {clienteSeleccionado ? (
            <div className="bg-white rounded-lg shadow-card p-5 overflow-hidden card-hover">
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium">
                      {clientesData.find(c => c.id === clienteSeleccionado)?.nombre}
                    </h2>
                    <p className="text-muted-foreground">
                      {clientesData.find(c => c.id === clienteSeleccionado)?.empresa}
                    </p>
                  </div>
                  <button className="btn-primary">Contactar</button>
                </div>
              </div>
              
              <Tabs value={tabActiva} onValueChange={setTabActiva}>
                <TabsList className="mb-4">
                  <TabsTrigger value="informacion" className="flex items-center gap-2">
                    <UserSquare2 className="h-4 w-4" />
                    <span>Información</span>
                  </TabsTrigger>
                  <TabsTrigger value="contactos" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Contactos</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendario" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Calendario</span>
                  </TabsTrigger>
                  <TabsTrigger value="financiero" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Financiero</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="informacion">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div>{clientesData.find(c => c.id === clienteSeleccionado)?.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Teléfono</div>
                        <div>{clientesData.find(c => c.id === clienteSeleccionado)?.telefono}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Estado</div>
                        <div className={`badge ${
                          clientesData.find(c => c.id === clienteSeleccionado)?.estado === "Cliente" 
                            ? "badge-success" : "badge-warning"
                        }`}>
                          {clientesData.find(c => c.id === clienteSeleccionado)?.estado}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Valor Anual</div>
                        <div className="font-medium">{clientesData.find(c => c.id === clienteSeleccionado)?.valorAnual}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Último Contacto</div>
                        <div>{format(clientesData.find(c => c.id === clienteSeleccionado)?.ultimoContacto || new Date(), "dd/MM/yyyy")}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="contactos">
                  <p>Lista de contactos asociados a este cliente.</p>
                </TabsContent>
                
                <TabsContent value="calendario">
                  <p>Calendario de eventos relacionados con este cliente.</p>
                </TabsContent>
                
                <TabsContent value="financiero">
                  <h3 className="text-md font-medium mb-3">Cuentas Bancarias</h3>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {columnasCuentas.map((columna) => (
                          <th key={columna.key} className="py-3 px-4 text-left text-sm font-medium text-foreground">
                            {columna.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cuentasCliente.map((cuenta, index) => (
                        <tr key={index} className="table-row-hover border-b border-border last:border-0">
                          {columnasCuentas.map((columna) => (
                            <td key={`${index}-${columna.key}`} className="py-3 px-4 text-sm">
                              {columna.render
                                ? columna.render(cuenta[columna.key as keyof typeof cuenta], cuenta)
                                : cuenta[columna.key as keyof typeof cuenta]}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {cuentasCliente.length === 0 && (
                        <tr>
                          <td colSpan={columnasCuentas.length} className="py-4 text-center text-muted-foreground">
                            No hay cuentas bancarias registradas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg border border-border p-12 flex flex-col items-center justify-center text-center">
              <UserSquare2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecciona un Cliente</h3>
              <p className="text-muted-foreground max-w-md">
                Selecciona un cliente de la lista para ver su información detallada, contactos, 
                calendario y datos financieros.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InformacionCliente;
