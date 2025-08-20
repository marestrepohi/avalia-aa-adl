
import React, { useEffect } from "react";
import { LayoutDashboard, Users, Megaphone, UserSquare2, MessageSquare, ChevronDown, PanelLeft, ChevronRight, X, PhoneCall, BarChart, HeartPulse, Brain, TrendingDown, Target, Zap } from "lucide-react";
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
  return <button 
    className={`sidebar-item sidebar-item-hover w-full flex ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center p-2 aspect-square h-10 w-10' : 'justify-between'}`} 
    onClick={onClick}
    title={collapsed ? text : undefined}
  >
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className={`${isActive ? 'text-primary' : 'text-sidebar-foreground'} flex-none`}>
          {icon}
        </div>
        {!collapsed && <span className="my-0 text-left">{text}</span>}
      </div>
      {hasChildren && !collapsed && <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </div>}
    </button>;
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
  return <button 
    className={`sidebar-item sidebar-item-hover w-full ${collapsed ? 'justify-center p-2 aspect-square h-10 w-10' : 'pl-4'} ${isActive ? 'sidebar-item-active' : ''}`} 
    onClick={onClick}
    title={collapsed ? text : undefined}
  >
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        {icon 
          ? <div className={`${isActive ? 'text-primary' : 'text-sidebar-foreground'} flex-none`}>{icon}</div>
          : <ChevronRight className={`h-4 w-4 flex-none ${isActive ? 'text-primary' : 'text-sidebar-foreground'}`} />
        }
        {!collapsed && <span className="text-left text-base">{text}</span>}
      </div>
    </button>;
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
      setIsOpen(false); // Cierra el sidebar en móviles después de la selección
    }
  };

  // Notificar al componente padre cuando cambia el estado contraído
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, onCollapsedChange]);

  useEffect(() => {
    // Cierra el sidebar en dispositivos móviles por defecto
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile, setIsOpen]);

  return (
    <>
      {/* Overlay para cerrar el sidebar en móviles */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside 
        className={`fixed left-0 top-16 bottom-0 bg-sidebar border-r border-sidebar-border p-4 overflow-y-auto transition-all duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isCollapsed ? 'w-16' : 'w-64'} 
          ${isMobile ? 'shadow-xl' : ''}
        `}
      >
        {/* Header controls */}
        <div className="flex items-center justify-between mb-6">
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
          
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => {
                setIsCollapsed(!isCollapsed);
                // Si contraemos el sidebar, cerramos los submenús abiertos
                if (!isCollapsed) {
                  setOpenSubMenu(null);
                }
              }}
            >
              <PanelLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </div>
        
        <nav className="space-y-1">
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
              <div className="mt-1 ml-1 space-y-1 border-l-2 border-muted pl-1">
                <SubMenuItem 
                  icon={<PhoneCall className="h-4 w-4" />} 
                  text="Agentes de Voz" 
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
            text="Asistentes de Texto" 
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
              <div className="mt-1 ml-1 space-y-1 border-l-2 border-muted pl-1">
                <SubMenuItem
                  icon={<Megaphone className="h-4 w-4" />}
                  text="Campañas"
                  isActive={activeView === "campaigns"}
                  onClick={() => handleViewChange("campaigns")}
                />
                <SubMenuItem
                  icon={<Users className="h-4 w-4" />}
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
              <div className="mt-1 ml-1 space-y-1 border-l-2 border-muted pl-1">
                <SubMenuItem
                  icon={<UserSquare2 className="h-4 w-4" />}
                  text="Dashboard Cliente"
                  isActive={activeView === "clientDashboard"}
                  onClick={() => handleViewChange("clientDashboard")} 
                />
              </div>
            )}
          </div>

          {/* Casos de Uso con subopciones */}
          <div>
            <SidebarItem 
              icon={<Brain className="h-5 w-5" />} 
              text="Casos de Uso" 
              isActive={activeView === "churn" || activeView === "tc" || activeView === "nba"}
              hasChildren={!isCollapsed}
              isOpen={openSubMenu === "casosuso"}
              onClick={() => isCollapsed ? handleViewChange("churn") : toggleSubMenu("casosuso")} 
              collapsed={isCollapsed}
            />
            
            {openSubMenu === "casosuso" && !isCollapsed && (
              <div className="mt-1 ml-1 space-y-1 border-l-2 border-muted pl-1">
                <SubMenuItem
                  icon={<TrendingDown className="h-4 w-4" />}
                  text="Churn Prediction"
                  isActive={activeView === "churn"}
                  onClick={() => handleViewChange("churn")}
                />
                <SubMenuItem
                  icon={<Target className="h-4 w-4" />}
                  text="Top Customers"
                  isActive={activeView === "tc"}
                  onClick={() => handleViewChange("tc")}
                />
                <SubMenuItem
                  icon={<Zap className="h-4 w-4" />}
                  text="Next Best Action"
                  isActive={activeView === "nba"}
                  onClick={() => handleViewChange("nba")}
                />
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
