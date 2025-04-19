import React, { useState, useEffect } from "react";
import { LayoutDashboard, Users, Megaphone, UserSquare2, Settings, Calendar, CreditCard, ChevronDown, ChevronRight, PhoneCall, BarChart } from "lucide-react";
import { useDashboard } from "../../contexts/DashboardContext";
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
  return;
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
        <span className="text-left">{text}</span>
      </div>
    </button>;
};
const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView
  } = useDashboard();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>("clients");
  const toggleSubMenu = (key: string) => {
    setOpenSubMenu(openSubMenu === key ? null : key);
  };

  // Manejar el cambio de vista
  const handleViewChange = (view: string) => {
    setActiveView(view as any);
  };
  return <aside className="fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border p-4 overflow-y-auto">
      <nav className="space-y-1">
        <SidebarItem icon={<LayoutDashboard className="h-5 w-5" />} text="Resumen General" isActive={activeView === "dashboard"} onClick={() => handleViewChange("dashboard")} />
        <SidebarItem icon={<Users className="h-5 w-5" />} text="Centro de Llamadas" hasChildren={true} isOpen={openSubMenu === "callcenter"} isActive={activeView === "agents" || activeView === "callAnalysis"} onClick={() => toggleSubMenu("callcenter")} />
        {openSubMenu === "callcenter" && <div className="animate-accordion-down overflow-hidden">
            <div className="pt-1 pb-1 space-y-1">
              <SubMenuItem text="Agentes IA" isActive={activeView === "agents"} onClick={() => handleViewChange("agents")} />
              <SubMenuItem text="Análisis de Llamadas" isActive={activeView === "callAnalysis"} onClick={() => handleViewChange("callAnalysis")} />
            </div>
          </div>}
        <SidebarItem icon={<Megaphone className="h-5 w-5" />} text="Campañas" isActive={activeView === "campaigns"} onClick={() => handleViewChange("campaigns")} />
        <SidebarItem icon={<UserSquare2 className="h-5 w-5" />} text="Información de Clientes" hasChildren={true} isOpen={openSubMenu === "clients"} isActive={["clientDashboard", "accounts", "contacts", "prospects", "clientConfig"].includes(activeView)} onClick={() => toggleSubMenu("clients")} />
        {openSubMenu === "clients" && <div className="animate-accordion-down overflow-hidden">
            <div className="pt-1 space-y-1">
              <SubMenuItem text="Panel Principal" isActive={activeView === "clientDashboard"} onClick={() => handleViewChange("clientDashboard")} />
              <SubMenuItem text="Cuentas" isActive={activeView === "accounts"} onClick={() => handleViewChange("accounts")} />
              <SubMenuItem text="Contactos" isActive={activeView === "contacts"} onClick={() => handleViewChange("contacts")} />
              <SubMenuItem text="Prospectos" isActive={activeView === "prospects"} onClick={() => handleViewChange("prospects")} />
              <SubMenuItem text="Configuración" isActive={activeView === "clientConfig"} onClick={() => handleViewChange("clientConfig")} />
            </div>
          </div>}
        <SidebarItem icon={<Calendar className="h-5 w-5" />} text="Calendario" isActive={activeView === "calendar"} onClick={() => handleViewChange("calendar")} />
        <SidebarItem icon={<CreditCard className="h-5 w-5" />} text="Info. Bancaria" isActive={activeView === "banking"} onClick={() => handleViewChange("banking")} />
        <SidebarItem icon={<Settings className="h-5 w-5" />} text="Configuración" isActive={activeView === "settings"} onClick={() => handleViewChange("settings")} />
      </nav>
    </aside>;
};
export default Sidebar;