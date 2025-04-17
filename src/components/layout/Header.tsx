
import React from "react";
import { Bell, Moon, User } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-50 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary">Avalia</h1>
      </div>
      <div className="flex items-center gap-5">
        <div className="text-sm font-medium">
          Agentes en Vivo: <span className="text-primary">3</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="icon-button relative group">
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            <div className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full"></div>
            <span className="tooltip -bottom-8 left-1/2 -translate-x-1/2">Notificaciones</span>
          </button>
          <button className="icon-button group">
            <Moon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            <span className="tooltip -bottom-8 left-1/2 -translate-x-1/2">Cambiar tema</span>
          </button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white">
              ADL
            </div>
            <button className="icon-button group">
              <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              <span className="tooltip -bottom-8 left-1/2 -translate-x-1/2">Perfil de usuario</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
