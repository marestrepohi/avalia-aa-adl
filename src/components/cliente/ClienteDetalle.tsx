
import React from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { 
  MessageSquare, 
  Package, 
  CreditCard, 
  BanknoteIcon as Banknote, 
  PhoneCall,
  TrendingUp,
  TrendingDown,
  FileText
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ClienteDetalleProps {
  cliente: Record<string, any>;
}

interface Transaccion {
  id: string;
  fecha: Date;
  monto: string;
  tipo: string;
  banco: string;
  descripcion: string;
}

interface Producto {
  id: string;
  nombre: string;
  tipo: string;
  fechaContratacion: Date;
  estado: string;
  detalles: Record<string, any>;
}

interface Llamada {
  id: string;
  fecha: Date;
  duracion: string;
  agente: string;
  tipoAgente: 'humano' | 'bot';
  resultado: string;
  sentimiento: 'positivo' | 'negativo' | 'neutral';
}

interface Incidencia {
  id: string;
  fecha: Date;
  tipo: string;
  estado: string;
  descripcion: string;
  resolucion?: string;
  sentimiento: 'positivo' | 'negativo' | 'neutral';
}

const ClienteDetalle: React.FC<ClienteDetalleProps> = ({ cliente }) => {
  // Function to handle transcription button click
  const handleTranscripcionClick = (llamadaId: string) => {
    toast.success("Transcripción de llamada abierta", {
      description: `Se ha abierto la transcripción de la llamada #${llamadaId}.`
    });
  };

  // Datos simulados para demostración
  const transacciones: Transaccion[] = [
    {
      id: "TR-001",
      fecha: new Date(2025, 3, 15),
      monto: "$1,200,000",
      tipo: "Ingreso",
      banco: "Banco Santander",
      descripcion: "Depósito mensual"
    },
    {
      id: "TR-002",
      fecha: new Date(2025, 3, 10),
      monto: "$450,000",
      tipo: "Egreso",
      banco: "Banco Estado",
      descripcion: "Pago de crédito"
    },
    {
      id: "TR-003",
      fecha: new Date(2025, 3, 5),
      monto: "$180,000",
      tipo: "Egreso",
      banco: "Banco Estado",
      descripcion: "Transferencia a terceros"
    },
    {
      id: "TR-004",
      fecha: new Date(2025, 3, 1),
      monto: "$2,500,000",
      tipo: "Ingreso",
      banco: "Banco de Chile",
      descripcion: "Pago factura #F-2341"
    }
  ];

  const bancosMasIngresos = [
    { nombre: "Banco de Chile", monto: "$4,300,000" },
    { nombre: "Banco Santander", monto: "$2,800,000" }
  ];

  const bancosMasEgresos = [
    { nombre: "Banco Estado", monto: "$1,250,000" },
    { nombre: "Banco BCI", monto: "$980,000" }
  ];

  const productos: Producto[] = [
    {
      id: "PRD-001",
      nombre: "Crédito Hipotecario",
      tipo: "Crédito",
      fechaContratacion: new Date(2023, 5, 10),
      estado: "Activo",
      detalles: {
        montoMensual: "$780,000",
        tasaInteres: "3.8%",
        plazo: "20 años",
        montoTotal: "$120,000,000"
      }
    },
    {
      id: "PRD-002",
      nombre: "Cuenta Corriente Premium",
      tipo: "Cuenta",
      fechaContratacion: new Date(2022, 2, 15),
      estado: "Activo",
      detalles: {
        saldo: "$3,450,000",
        tipo: "Cuenta Corriente",
        mantencion: "$0"
      }
    },
    {
      id: "PRD-003",
      nombre: "Tarjeta de Crédito Gold",
      tipo: "Tarjeta",
      fechaContratacion: new Date(2023, 1, 20),
      estado: "Activo",
      detalles: {
        cupoTotal: "$5,000,000",
        cupoUtilizado: "$1,800,000",
        tasaInteres: "2.2%"
      }
    }
  ];

  const llamadas: Llamada[] = [
    {
      id: "CALL-001",
      fecha: new Date(2025, 3, 12),
      duracion: "08:45",
      agente: "María González",
      tipoAgente: "humano",
      resultado: "Consulta resuelta",
      sentimiento: "positivo"
    },
    {
      id: "CALL-002",
      fecha: new Date(2025, 3, 5),
      duracion: "04:12",
      agente: "Asistente Virtual",
      tipoAgente: "bot",
      resultado: "Derivado a agente humano",
      sentimiento: "neutral"
    },
    {
      id: "CALL-003",
      fecha: new Date(2025, 2, 28),
      duracion: "12:30",
      agente: "Carlos Pérez",
      tipoAgente: "humano",
      resultado: "Reclamo registrado",
      sentimiento: "negativo"
    }
  ];

  const incidencias: Incidencia[] = [
    {
      id: "INC-001",
      fecha: new Date(2025, 3, 12),
      tipo: "Consulta",
      estado: "Resuelta",
      descripcion: "Cliente consultó por estado de su crédito hipotecario",
      resolucion: "Se entregó información detallada sobre el estado actual",
      sentimiento: "positivo"
    },
    {
      id: "INC-002",
      fecha: new Date(2025, 2, 28),
      tipo: "Reclamo",
      estado: "En Proceso",
      descripcion: "Cliente reportó cobros indebidos en su cuenta corriente",
      sentimiento: "negativo"
    }
  ];

  const totalLlamadas3Meses = llamadas.length;

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[250px]">
          <div className="text-lg font-semibold mb-1">Perfil de Cliente</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Nombre:</div>
            <div className="font-medium">{cliente.nombre}</div>
            <div className="text-muted-foreground">Empresa:</div>
            <div className="font-medium">{cliente.empresa}</div>
            <div className="text-muted-foreground">Último Contacto:</div>
            <div className="font-medium">
              {cliente.ultimoContacto instanceof Date 
                ? format(cliente.ultimoContacto, 'dd/MM/yyyy') 
                : cliente.ultimoContacto}
            </div>
            <div className="text-muted-foreground">Estado:</div>
            <div>
              <span className={`badge ${
                cliente.estado === "Activo" ? "badge-success" : 
                cliente.estado === "En Seguimiento" ? "badge-warning" : 
                cliente.estado === "Nuevo" ? "badge-primary" : "badge-neutral"
              }`}>{cliente.estado}</span>
            </div>
            <div className="text-muted-foreground">Llamadas (últimos 3 meses):</div>
            <div className="font-medium">{totalLlamadas3Meses}</div>
            <div className="text-muted-foreground">Productos activos:</div>
            <div className="font-medium">{productos.length}</div>
          </div>
        </div>

        <div className="flex-1 min-w-[250px]">
          <div className="text-lg font-semibold mb-1">Información Bancaria</div>
          <div className="text-sm mb-3">
            <div className="font-medium mb-1">Principal banco de ingresos:</div>
            {bancosMasIngresos.map((banco, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-success mr-1" />
                  <span>{banco.nombre}</span>
                </div>
                <span>{banco.monto}</span>
              </div>
            ))}
            <div className="font-medium my-1">Principal banco de egresos:</div>
            {bancosMasEgresos.map((banco, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <TrendingDown className="h-4 w-4 text-destructive mr-1" />
                  <span>{banco.nombre}</span>
                </div>
                <span>{banco.monto}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="transacciones" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-2 w-full">
          <TabsTrigger value="transacciones">
            <Banknote className="h-4 w-4 mr-1" /> Transacciones
          </TabsTrigger>
          <TabsTrigger value="productos">
            <Package className="h-4 w-4 mr-1" /> Productos
          </TabsTrigger>
          <TabsTrigger value="llamadas">
            <PhoneCall className="h-4 w-4 mr-1" /> Llamadas
          </TabsTrigger>
          <TabsTrigger value="incidencias">
            <MessageSquare className="h-4 w-4 mr-1" /> Incidencias
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="transacciones" className="mt-2">
          <Card className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-left py-2 px-2">Tipo</th>
                  <th className="text-left py-2 px-2">Monto</th>
                  <th className="text-left py-2 px-2">Banco</th>
                  <th className="text-left py-2 px-2">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((trans) => (
                  <tr key={trans.id} className="border-b border-border last:border-0">
                    <td className="py-2 px-2">{format(trans.fecha, 'dd/MM/yyyy')}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center">
                        {trans.tipo === "Ingreso" ? (
                          <TrendingUp className="h-4 w-4 text-success mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive mr-1" />
                        )}
                        {trans.tipo}
                      </div>
                    </td>
                    <td className="py-2 px-2">{trans.monto}</td>
                    <td className="py-2 px-2">{trans.banco}</td>
                    <td className="py-2 px-2">{trans.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="productos" className="mt-2">
          <Card className="p-4">
            <div className="space-y-6">
              {productos.map((producto) => (
                <div key={producto.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {producto.tipo === "Crédito" ? (
                        <CreditCard className="h-5 w-5 mr-2 text-primary" />
                      ) : (
                        <Package className="h-5 w-5 mr-2 text-primary" />
                      )}
                      <span className="font-medium">{producto.nombre}</span>
                    </div>
                    <span className={`badge ${producto.estado === "Activo" ? "badge-success" : "badge-neutral"}`}>
                      {producto.estado}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo: </span>
                      <span>{producto.tipo}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha Contratación: </span>
                      <span>{format(producto.fechaContratacion, 'dd/MM/yyyy')}</span>
                    </div>
                    
                    {producto.tipo === "Crédito" && (
                      <>
                        <div>
                          <span className="text-muted-foreground">Pago Mensual: </span>
                          <span>{producto.detalles.montoMensual}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tasa: </span>
                          <span>{producto.detalles.tasaInteres}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Plazo: </span>
                          <span>{producto.detalles.plazo}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Monto Total: </span>
                          <span>{producto.detalles.montoTotal}</span>
                        </div>
                      </>
                    )}
                    
                    {producto.tipo === "Cuenta" && (
                      <>
                        <div>
                          <span className="text-muted-foreground">Saldo Actual: </span>
                          <span>{producto.detalles.saldo}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mantención: </span>
                          <span>{producto.detalles.mantencion}</span>
                        </div>
                      </>
                    )}
                    
                    {producto.tipo === "Tarjeta" && (
                      <>
                        <div>
                          <span className="text-muted-foreground">Cupo Total: </span>
                          <span>{producto.detalles.cupoTotal}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cupo Utilizado: </span>
                          <span>{producto.detalles.cupoUtilizado}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tasa: </span>
                          <span>{producto.detalles.tasaInteres}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="llamadas" className="mt-2">
          <Card className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-left py-2 px-2">Duración</th>
                  <th className="text-left py-2 px-2">Agente</th>
                  <th className="text-left py-2 px-2">Tipo</th>
                  <th className="text-left py-2 px-2">Resultado</th>
                  <th className="text-left py-2 px-2">Sentimiento</th>
                  <th className="text-left py-2 px-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {llamadas.map((llamada) => (
                  <tr key={llamada.id} className="border-b border-border last:border-0">
                    <td className="py-2 px-2">{format(llamada.fecha, 'dd/MM/yyyy')}</td>
                    <td className="py-2 px-2">{llamada.duracion}</td>
                    <td className="py-2 px-2">{llamada.agente}</td>
                    <td className="py-2 px-2">
                      {llamada.tipoAgente === "humano" ? "Humano" : "Virtual"}
                    </td>
                    <td className="py-2 px-2">{llamada.resultado}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center">
                        {llamada.sentimiento === "positivo" ? (
                          <TrendingUp className="h-4 w-4 text-success mr-1" />
                        ) : llamada.sentimiento === "negativo" ? (
                          <TrendingDown className="h-4 w-4 text-destructive mr-1" />
                        ) : (
                          <span className="h-4 w-4 mr-1">-</span>
                        )}
                        {llamada.sentimiento.charAt(0).toUpperCase() + llamada.sentimiento.slice(1)}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                        onClick={() => handleTranscripcionClick(llamada.id)}
                      >
                        <FileText className="h-4 w-4 mr-1" /> Transcripción
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="incidencias" className="mt-2">
          <Card className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-left py-2 px-2">Tipo</th>
                  <th className="text-left py-2 px-2">Estado</th>
                  <th className="text-left py-2 px-2">Descripción</th>
                  <th className="text-left py-2 px-2">Sentimiento</th>
                </tr>
              </thead>
              <tbody>
                {incidencias.map((incidencia) => (
                  <tr key={incidencia.id} className="border-b border-border last:border-0">
                    <td className="py-2 px-2">{format(incidencia.fecha, 'dd/MM/yyyy')}</td>
                    <td className="py-2 px-2">{incidencia.tipo}</td>
                    <td className="py-2 px-2">
                      <span className={`badge ${incidencia.estado === "Resuelta" ? "badge-success" : "badge-warning"}`}>
                        {incidencia.estado}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div>
                        <div>{incidencia.descripcion}</div>
                        {incidencia.resolucion && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Resolución: {incidencia.resolucion}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center">
                        {incidencia.sentimiento === "positivo" ? (
                          <TrendingUp className="h-4 w-4 text-success mr-1" />
                        ) : incidencia.sentimiento === "negativo" ? (
                          <TrendingDown className="h-4 w-4 text-destructive mr-1" />
                        ) : (
                          <span className="h-4 w-4 mr-1">-</span>
                        )}
                        {incidencia.sentimiento.charAt(0).toUpperCase() + incidencia.sentimiento.slice(1)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClienteDetalle;
