
import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import ResumenGeneral from './dashboard/ResumenGeneral';
import AgentesIA from './dashboard/AgentesIA';
import Campanas from './dashboard/Campanas';
import InformacionCliente from './dashboard/InformacionCliente';
import InformacionBancaria from './dashboard/InformacionBancaria';
import AnalisisLlamadas from './dashboard/AnalisisLlamadas';
import Asistentes from './dashboard/Asistentes';
import { useDashboard } from '../contexts/DashboardContext';

const Index = () => {
  const { activeView, setActiveView } = useDashboard();
  
  // Sincronizar con el sidebar al cargar
  useEffect(() => {
    // Mantener el estado sincronizado
  }, []);
  
  return (
    <AppLayout>
      {activeView === 'dashboard' && <ResumenGeneral />}
      {activeView === 'agents' && <AgentesIA />}
      {activeView === 'campaigns' && <Campanas />}
      {activeView === 'clientDashboard' && <InformacionCliente />}
      {activeView === 'banking' && <InformacionBancaria />}
      {activeView === 'callAnalysis' && <AnalisisLlamadas />}
      {activeView === 'asistentes' && <Asistentes />}
    </AppLayout>
  );
};

export default Index;
