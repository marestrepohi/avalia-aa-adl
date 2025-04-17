
import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import ResumenGeneral from './dashboard/ResumenGeneral';
import AgentesIA from './dashboard/AgentesIA';

const Index = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'agents'>('dashboard');
  
  return (
    <AppLayout>
      {activeView === 'dashboard' && <ResumenGeneral />}
      {activeView === 'agents' && <AgentesIA />}
    </AppLayout>
  );
};

export default Index;
