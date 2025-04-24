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
        <h1 className="text-xl font-bold text-primary">Aval IA</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-5">
        <h1 className="text-lg font-bold text-primary hidden sm:block">Aval Digital Labs</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="icon-button group hidden sm:flex">
            <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            <span className="tooltip -bottom-8 hidden sm:group-hover:inline-flex">Perfil de usuario</span>
          </button>
          <button className="icon-button relative group hidden sm:flex">
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            <div className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full"></div>
            <span className="tooltip -bottom-8 hidden sm:group-hover:inline-flex">Notificaciones</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
