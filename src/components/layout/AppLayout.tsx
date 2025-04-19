
import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { DashboardProvider } from "../../contexts/DashboardContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen bg-background">
        <Header />
        <Sidebar />
        <main className="flex-1 pt-16 pl-64 min-h-screen">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
};

export default AppLayout;
