
import React from "react";
import PanelPrincipal from "@/components/cliente/PanelPrincipal";

const InformacionCliente: React.FC = () => {
  return (
    <div className="py-8 px-2 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Panel Principal de Información de Clientes</h1>
      <PanelPrincipal />
    </div>
  );
};

export default InformacionCliente;
