import React from "react";
import { Bell, Menu, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const isMobile = useMobile();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-50 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <h1 className="text-xl font-bold text-primary">Avalia</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-5">
        {!isMobile && (
          <div className="text-sm font-medium hidden sm:block">
            Agentes en Vivo: <span className="text-primary">3</span>
          </div>
        )}
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="icon-button relative group">
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            <div className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full"></div>
            <span className="tooltip -bottom-8 hidden sm:group-hover:inline-flex">Notificaciones</span>
          </button>
          
          <button className="icon-button group hidden sm:flex">
            <Moon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            <span className="tooltip -bottom-8 hidden sm:group-hover:inline-flex">Cambiar tema</span>
          </button>
          
          <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white">
              ADL
            </div>
            <button className="icon-button group hidden sm:flex">
              <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              <span className="tooltip -bottom-8 hidden sm:group-hover:inline-flex">Perfil de usuario</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
