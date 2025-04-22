
import React from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center md:items-center md:justify-end">
      <div className="bg-white w-full max-w-md md:max-w-xl h-[80vh] rounded-t-2xl md:rounded-l-2xl p-6 shadow-2xl overflow-y-auto relative animate-slide-in-right">
        <button className="absolute top-3 right-3 text-lg" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        {title && <div className="font-semibold text-lg mb-2">{title}</div>}
        {children}
      </div>
      <div className="absolute inset-0 z-0" onClick={onClose} />
    </div>
  );
};
