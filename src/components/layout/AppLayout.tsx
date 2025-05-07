
import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Chatbot from "../chat/Chatbot";
import { useMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarCollapsedChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-x-hidden">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        onCollapsedChange={handleSidebarCollapsedChange} 
      />
      <main 
        className={`flex-1 pt-16 transition-all duration-300
          ${sidebarOpen 
            ? (sidebarCollapsed ? 'md:pl-16' : 'md:pl-64') 
            : 'pl-0'
          }
        `}
      >
        <div className="p-4 sm:p-6 max-w-[100rem] mx-auto">
          {isMobile && (
            <Button
              variant="outline"
              size="icon"
              className="mb-4 md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          )}
          {children}
        </div>
      </main>
      
      {/* Chatbot component */}
      <Chatbot />
    </div>
  );
};

export default AppLayout;
