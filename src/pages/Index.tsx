import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import ResumenGeneral from './dashboard/ResumenGeneral';
import AgentesIA from './dashboard/AgentesIA';
import Campanas from './dashboard/Campanas';
import InformacionCliente from './dashboard/InformacionCliente';
import InformacionBancaria from './dashboard/InformacionBancaria';
import AnalisisLlamadas from './dashboard/AnalisisLlamadas';
import Asistentes from './dashboard/Asistentes';
import Audiencias from './dashboard/Audiencias';
import Churn from './dashboard/Churn';
import TopCustomers from './dashboard/TopCustomers';
import NextBestAction from './dashboard/NextBestAction';
import { useDashboard } from '../contexts/DashboardContext';
import AumentoUso from './dashboard/AumentoUso';

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
      {activeView === 'audiencias' && <Audiencias />}
      {activeView === 'churn' && <Churn />}
      {activeView === 'tc' && <TopCustomers />}
  {activeView === 'nba' && <NextBestAction />}
  {activeView === 'aumento-uso' && <AumentoUso />}
    </AppLayout>
  );
};

export default Index;
