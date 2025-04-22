
import React from "react";
import ClienteTable from "@/components/cliente/ClienteTable";

const InformacionCliente: React.FC = () => {
  return (
    <div className="py-8 px-2 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Información de Clientes y Prospectos</h1>
      <ClienteTable />
    </div>
  );
};

export default InformacionCliente;
