
import React, { useEffect } from "react";
import { 
  LayoutDashboard, Users, Megaphone, UserSquare2, MessageSquare, 
  ChevronDown, PanelLeft, ChevronRight, X, PhoneCall, BarChart, HeartPulse 
} from "lucide-react";
import { useDashboard } from "../../contexts/DashboardContext";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  isActive?: boolean;
  hasChildren?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  text,
  isActive = false,
  hasChildren = false,
  isOpen = false,
  onClick,
  collapsed = false
}) => {
  return (
    <button 
      className={`sidebar-item sidebar-item-hover w-full flex justify-between ${
        isActive ? 'sidebar-item-active' : ''
      } ${collapsed ? 'justify-center' : ''}`} 
      onClick={onClick}
      title={collapsed ? text : undefined}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className={`${isActive ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>
          {icon}
        </div>
        {!collapsed && <span className="my-0 text-left">{text}</span>}
      </div>
      {hasChildren && !collapsed && (
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
  icon?: React.ReactNode;
  collapsed?: boolean;
}

const SubMenuItem: React.FC<SubMenuItemProps> = ({
  text,
  isActive = false,
  onClick,
  icon,
  collapsed = false
}) => {
  return (
    <button 
      className={`sidebar-item sidebar-item-hover w-full ${
        collapsed ? 'justify-center' : 'pl-10'
      } ${isActive ? 'sidebar-item-active' : ''}`} 
      onClick={onClick}
      title={collapsed ? text : undefined}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        {icon ? (
          <div className={`${isActive ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>
            {icon}
          </div>
        ) : (
          <ChevronRight className={`h-4 w-4 ${
            isActive ? 'text-white' : 'text-[var(--color-text-secondary)]'
          }`} />
        )}
        {!collapsed && <span className="text-left text-base">{text}</span>}
      </div>
    </button>
  );
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onCollapsedChange }) => {
  const { activeView, setActiveView } = useDashboard();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [openSubMenu, setOpenSubMenu] = React.useState<string | null>(null);
  const isMobile = useMobile();
  
  const toggleSubMenu = (key: string) => {
    setOpenSubMenu(openSubMenu === key ? null : key);
  };
  
  const handleViewChange = (view: string) => {
    setActiveView(view as any);
    if (isMobile) {
      setIsOpen(false); // Close sidebar on mobile after selection
    }
  };

  // Notify parent component when collapsed state changes
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, onCollapsedChange]);

  useEffect(() => {
    // Close sidebar on mobile devices by default
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile, setIsOpen]);

  return (
    <>
      {/* Overlay to close sidebar on mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside 
        className={`fixed left-0 top-16 bottom-0 bg-[var(--color-background-sidebar)] border-r border-[var(--color-border-subtle)] p-4 overflow-y-auto transition-all duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isCollapsed ? 'w-16' : 'w-[260px]'} 
          ${isMobile ? 'shadow-xl' : ''}
        `}
      >
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <nav className="space-y-1 mt-6">
          <SidebarItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            text="Resumen General" 
            isActive={activeView === "dashboard"}
            onClick={() => handleViewChange("dashboard")} 
            collapsed={isCollapsed}
          />

          {/* Centro de Llamadas con subopciones */}
          <div>
            <SidebarItem 
              icon={<Users className="h-5 w-5" />} 
              text="Centro de Llamadas" 
              isActive={activeView === "agents" || activeView === "callAnalysis"}
              hasChildren={!isCollapsed}
              isOpen={openSubMenu === "callcenter"}
              onClick={() => isCollapsed ? handleViewChange("agents") : toggleSubMenu("callcenter")} 
              collapsed={isCollapsed}
            />
            
            {openSubMenu === "callcenter" && !isCollapsed && (
              <div className="mt-1 ml-2 space-y-1 border-l-2 border-[var(--color-border-subtle)] pl-2">
                <SubMenuItem 
                  icon={<PhoneCall className="h-4 w-4" />}
                  text="Agentes IA" 
                  isActive={activeView === "agents"}
                  onClick={() => handleViewChange("agents")} 
                />
                <SubMenuItem 
                  icon={<BarChart className="h-4 w-4" />}
                  text="Análisis de Llamadas" 
                  isActive={activeView === "callAnalysis"}
                  onClick={() => handleViewChange("callAnalysis")} 
                />
              </div>
            )}
          </div>

          {/* Asistentes con subopciones si es necesario */}
          <SidebarItem 
            icon={<MessageSquare className="h-5 w-5" />} 
            text="Asistentes" 
            isActive={activeView === "asistentes"}
            onClick={() => handleViewChange("asistentes")} 
            collapsed={isCollapsed}
          />

          {/* Campañas con subopciones */}
          <div>
            <SidebarItem 
              icon={<Megaphone className="h-5 w-5" />} 
              text="Campañas" 
              isActive={activeView === "campaigns"}
              hasChildren={!isCollapsed}
              isOpen={openSubMenu === "campaigns"}
              onClick={() => isCollapsed ? handleViewChange("campaigns") : toggleSubMenu("campaigns")} 
              collapsed={isCollapsed}
            />
            
            {openSubMenu === "campaigns" && !isCollapsed && (
              <div className="mt-1 ml-2 space-y-1 border-l-2 border-[var(--color-border-subtle)] pl-2">
                <SubMenuItem
                  text="Campañas"
                  isActive={activeView === "campaigns"}
                  onClick={() => handleViewChange("campaigns")}
                />
                <SubMenuItem
                  text="Audiencias"
                  isActive={activeView === "audiencias"}
                  onClick={() => handleViewChange("audiencias")}
                />
              </div>
            )}
          </div>

          {/* Información de Clientes con subopciones */}
          <div>
            <SidebarItem 
              icon={<UserSquare2 className="h-5 w-5" />} 
              text="Información de Clientes" 
              isActive={activeView === "clientDashboard"}
              hasChildren={!isCollapsed}
              isOpen={openSubMenu === "clients"}
              onClick={() => {
                handleViewChange("clientDashboard");
                if (!isCollapsed) toggleSubMenu("clients");
              }} 
              collapsed={isCollapsed}
            />
            
            {openSubMenu === "clients" && !isCollapsed && (
              <div className="mt-1 ml-2 space-y-1 border-l-2 border-[var(--color-border-subtle)] pl-2">
                <SubMenuItem 
                  text="Dashboard Cliente" 
                  isActive={activeView === "clientDashboard"}
                  onClick={() => handleViewChange("clientDashboard")} 
                />
              </div>
            )}
          </div>
        </nav>

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-4 left-4"
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              // Close submenus when collapsing
              if (!isCollapsed) {
                setOpenSubMenu(null);
              }
            }}
          >
            <PanelLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
