
import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  UserSquare2,
  Settings, 
  Calendar, 
  CreditCard,
  ChevronDown,
  ChevronRight
} from "lucide-react";
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
  return (
    <button 
      className={`sidebar-item sidebar-item-hover w-full flex justify-between ${isActive ? 'sidebar-item-active' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`${isActive ? 'text-primary' : 'text-sidebar-foreground'}`}>
          {icon}
        </div>
        <span>{text}</span>
      </div>
      {hasChildren && (
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </div>
      )}
    </button>
  );
};

interface SubMenuItemProps {
  text: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SubMenuItem: React.FC<SubMenuItemProps> = ({ text, isActive = false, onClick }) => {
  return (
    <button 
      className={`sidebar-item sidebar-item-hover w-full pl-10 ${isActive ? 'sidebar-item-active' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <ChevronRight className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-sidebar-foreground'}`} />
        <span>{text}</span>
      </div>
    </button>
  );
};

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [openSubMenu, setOpenSubMenu] = useState<string | null>("clients");

  const toggleSubMenu = (key: string) => {
    setOpenSubMenu(openSubMenu === key ? null : key);
  };

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border p-4 overflow-y-auto">
      <nav className="space-y-1">
        <SidebarItem 
          icon={<LayoutDashboard className="h-5 w-5" />} 
          text="Resumen General" 
          isActive={activeItem === "dashboard"}
          onClick={() => setActiveItem("dashboard")}
        />
        <SidebarItem 
          icon={<Users className="h-5 w-5" />} 
          text="Centro de Llamadas" 
          hasChildren={true}
          isOpen={openSubMenu === "callcenter"}
          isActive={activeItem === "agents"}
          onClick={() => toggleSubMenu("callcenter")}
        />
        {openSubMenu === "callcenter" && (
          <div className="animate-accordion-down overflow-hidden">
            <div className="pt-1 pb-1">
              <SubMenuItem 
                text="Agentes IA" 
                isActive={activeItem === "agents"}
                onClick={() => setActiveItem("agents")}
              />
            </div>
          </div>
        )}
        <SidebarItem 
          icon={<Megaphone className="h-5 w-5" />} 
          text="Campañas" 
          isActive={activeItem === "campaigns"}
          onClick={() => setActiveItem("campaigns")}
        />
        <SidebarItem 
          icon={<UserSquare2 className="h-5 w-5" />} 
          text="Información de Clientes" 
          hasChildren={true}
          isOpen={openSubMenu === "clients"}
          isActive={["clientDashboard", "accounts", "contacts", "prospects", "clientConfig"].includes(activeItem)}
          onClick={() => toggleSubMenu("clients")}
        />
        {openSubMenu === "clients" && (
          <div className="animate-accordion-down overflow-hidden">
            <div className="pt-1 space-y-1">
              <SubMenuItem 
                text="Panel Principal" 
                isActive={activeItem === "clientDashboard"}
                onClick={() => setActiveItem("clientDashboard")}
              />
              <SubMenuItem 
                text="Cuentas" 
                isActive={activeItem === "accounts"}
                onClick={() => setActiveItem("accounts")}
              />
              <SubMenuItem 
                text="Contactos" 
                isActive={activeItem === "contacts"}
                onClick={() => setActiveItem("contacts")}
              />
              <SubMenuItem 
                text="Prospectos" 
                isActive={activeItem === "prospects"}
                onClick={() => setActiveItem("prospects")}
              />
              <SubMenuItem 
                text="Configuración" 
                isActive={activeItem === "clientConfig"}
                onClick={() => setActiveItem("clientConfig")}
              />
            </div>
          </div>
        )}
        <SidebarItem 
          icon={<Calendar className="h-5 w-5" />} 
          text="Calendario" 
          isActive={activeItem === "calendar"}
          onClick={() => setActiveItem("calendar")}
        />
        <SidebarItem 
          icon={<CreditCard className="h-5 w-5" />} 
          text="Info. Bancaria" 
          isActive={activeItem === "banking"}
          onClick={() => setActiveItem("banking")}
        />
        <SidebarItem 
          icon={<Settings className="h-5 w-5" />} 
          text="Configuración" 
          isActive={activeItem === "settings"}
          onClick={() => setActiveItem("settings")}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;
