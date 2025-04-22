
import React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Banknote, CreditCard, FileBarChart, Users } from "lucide-react";

interface ClientePerfilDrawerProps {
  open: boolean;
  onClose: () => void;
  cliente: any | null;
}

const ClientePerfilDrawer: React.FC<ClientePerfilDrawerProps> = ({
  open,
  onClose,
  cliente,
}) => {
  if (!cliente) return null;

  // KPIs creativos y simulados
  const transaccionReciente = {
    fecha: "21/04/2025",
    monto: "$1,000,000",
    tipo: "Ingreso",
    banco: "Banco Chile"
  };
  const bancoMasIngreso = { nombre: "Banco Chile", monto: "$3,800,000" };
  const bancoMasFuga = { nombre: "Banco Estado", monto: "$1,500,000" };
  const llamadas = 5;
  const productos = [
    { nombre: "Crédito Hipotecario", tipo: "Crédito", cuota: "$600,000", tasa: "2.4%" },
    { nombre: "Cuenta Corriente", tipo: "Cuenta", cuota: "$0", tasa: "-" },
    { nombre: "Cuenta de Ahorro", tipo: "Cuenta", cuota: "$0", tasa: "-" },
  ];
  const ultimaLlamada = { fecha: "15/04/2025", sentimiento: "negativo", descripcion: "Consultó por cobro inesperado" };
  const ultimaIncidencia = { fecha: "10/04/2025", sentimiento: "positivo", descripcion: "Felicitó por buena atención" };

  return (
    <Drawer open={open} onClose={onClose} title={`Perfil de ${cliente.nombre}`}>
      <div className="space-y-4 py-1">
        <div>
          <span className="font-medium">Empresa: </span>{cliente.empresa}
        </div>
        <div className="grid grid-cols-2 gap-2 my-2">
          <div>
            <span className="text-muted-foreground text-xs">Última transacción:</span>
            <div className="font-medium">{transaccionReciente.monto} ({transaccionReciente.tipo})</div>
            <div className="text-xs">{transaccionReciente.fecha} - {transaccionReciente.banco}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Banco más dinero entra:</span>
            <div>
              <TrendingUp className="inline h-4 w-4 text-green-600" /> {bancoMasIngreso.nombre}
            </div>
            <div className="text-xs">{bancoMasIngreso.monto}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Banco más fuga dinero:</span>
            <div>
              <TrendingDown className="inline h-4 w-4 text-red-600" /> {bancoMasFuga.nombre}
            </div>
            <div className="text-xs">{bancoMasFuga.monto}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Llamadas últimos 3 meses:</span>
            <div className="font-bold">{llamadas}</div>
          </div>
        </div>
        <div>
          <span className="font-medium">Productos:</span>
          <ul className="my-1 pl-4 list-disc">
            {productos.map((prod, i) => (
              <li key={i}>
                {prod.nombre}{" "}
                <Badge variant="default" className="mx-1">{prod.tipo}</Badge>
                {prod.tipo === "Crédito" && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    Cuota: {prod.cuota}, Tasa: {prod.tasa}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-2 text-xs">
            {cliente.cuentaAhorro
              ? "Cuenta de ahorro activa: aprovecha su alto flujo en red transaccional."
              : "Sin cuenta de ahorro: ofrecer cuenta y aumentar engagement transaccional."}
          </div>
          <div className="mt-1 text-xs">
            Próx. mejor producto: <span className="font-semibold">{cliente.proximoProducto}</span>
          </div>
        </div>
        <div>
          <span className="font-medium">Última llamada:</span>
          <div className="flex items-center gap-2">
            <span>{ultimaLlamada.fecha}</span>
            <Badge variant={ultimaLlamada.sentimiento === "positivo" ? "default" : "destructive"}>
              {ultimaLlamada.sentimiento === "positivo" ? "🙂" : "🙁"} {ultimaLlamada.sentimiento}
            </Badge>
            <span className="text-xs">{ultimaLlamada.descripcion}</span>
          </div>
        </div>
        <div>
          <span className="font-medium">Última incidencia:</span>
          <div className="flex items-center gap-2">
            <span>{ultimaIncidencia.fecha}</span>
            <Badge variant={ultimaIncidencia.sentimiento === "positivo" ? "default" : "destructive"}>
              {ultimaIncidencia.sentimiento === "positivo" ? "🙂" : "🙁"} {ultimaIncidencia.sentimiento}
            </Badge>
            <span className="text-xs">{ultimaIncidencia.descripcion}</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex gap-2 items-center">
            <Banknote className="h-4 w-4 text-green-700" />
            <span className="font-medium">Total Crédito en el año:</span>
            <span className="ml-1 text-primary">${cliente.creditoAnual?.toLocaleString("es-CL")}</span>
          </div>
          <div className="flex gap-2 items-center mt-2">
            <CreditCard className="h-4 w-4 text-blue-700" />
            <span>Importancia red transaccional:</span>
            <span className="font-bold ml-1">{cliente.redTransaccionalImportancia}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ClientePerfilDrawer;
