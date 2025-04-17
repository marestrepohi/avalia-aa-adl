
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
}

const SlidePanel: React.FC<SlidePanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "md",
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Set width class
  const widthClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[width];

  // Close when pressing escape
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex">
          <div className="ml-auto">
            <div
              ref={panelRef}
              className={`bg-white h-full ${widthClass} w-full animate-slide-in-right flex flex-col`}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="font-semibold text-lg">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive-light rounded-full p-1.5 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">{children}</div>
              {footer && (
                <div className="p-6 border-t border-border flex justify-end space-x-3">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SlidePanel;
