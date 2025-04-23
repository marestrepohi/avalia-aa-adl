import React, { useState } from "react";
import { LayoutDashboard, Users, Megaphone, UserSquare2, MessageSquare, ChevronDown, PanelLeft, ChevronRight } from "lucide-react";
import { useDashboard } from "../../contexts/DashboardContext";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  isActive?: boolean;
  hasChildren?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  text,
  isActive = false,
  hasChildren = false,
  isOpen = false,
  onClick
}) => {
  return <button className={`sidebar-item sidebar-item-hover w-full flex justify-between ${isActive ? 'sidebar-item-active' : ''}`} onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className={`${isActive ? 'text-primary' : 'text-sidebar-foreground'}`}>
          {icon}
        </div>
        <span className="my-0 text-left">{text}</span>
      </div>
      {hasChildren && <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </div>}
    </button>;
};

interface SubMenuItemProps {
  text: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SubMenuItem: React.FC<SubMenuItemProps> = ({
  text,
  isActive = false,
  onClick
}) => {
  return <button className={`sidebar-item sidebar-item-hover w-full pl-10 ${isActive ? 'sidebar-item-active' : ''}`} onClick={onClick}>
      <div className="flex items-center gap-3">
        <ChevronRight className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-sidebar-foreground'}`} />
        <span className="text-left text-base">{text}</span>
      </div>
    </button>;
};

const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useDashboard();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>("clients");
  const toggleSubMenu = (key: string) => {
    setOpenSubMenu(openSubMenu === key ? null : key);
  };
  
  const handleViewChange = (view: string) => {
    setActiveView(view as any);
  };

  return (
    <aside className={`fixed left-0 top-16 bottom-0 ${isCollapsed ? 'w-16' : 'w-64'} bg-sidebar border-r border-sidebar-border p-4 overflow-y-auto transition-all duration-300`}>
      <nav className="space-y-1">
        <SidebarItem 
          icon={<LayoutDashboard className="h-5 w-5" />} 
          text={isCollapsed ? "" : "Resumen General"} 
          isActive={activeView === "dashboard"}
          onClick={() => handleViewChange("dashboard")} 
        />

        <SidebarItem 
          icon={<Users className="h-5 w-5" />} 
          text={isCollapsed ? "" : "Centro de Llamadas"} 
          isActive={activeView === "agents" || activeView === "callAnalysis"}
          onClick={() => handleViewChange("agents")} 
        />

        <SidebarItem 
          icon={<MessageSquare className="h-5 w-5" />} 
          text={isCollapsed ? "" : "Asistentes"} 
          isActive={activeView === "asistentes"}
          onClick={() => handleViewChange("asistentes")} 
        />

        <SidebarItem 
          icon={<Megaphone className="h-5 w-5" />} 
          text={isCollapsed ? "" : "Campañas"} 
          isActive={activeView === "campaigns"}
          onClick={() => handleViewChange("campaigns")} 
        />

        <SidebarItem 
          icon={<UserSquare2 className="h-5 w-5" />} 
          text={isCollapsed ? "" : "Información de Clientes"} 
          isActive={activeView === "clientDashboard"}
          onClick={() => handleViewChange("clientDashboard")} 
        />
      </nav>

      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-4 left-4"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <PanelLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </Button>
    </aside>
  );
};

export default Sidebar;
