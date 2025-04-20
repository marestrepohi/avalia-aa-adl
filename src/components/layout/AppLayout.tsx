
import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Chatbot from "../chat/Chatbot";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className="flex-1 pt-16 pl-64 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Chatbot />
    </div>
  );
};

export default AppLayout;
