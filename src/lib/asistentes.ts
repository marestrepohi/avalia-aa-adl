export interface Asistente {
  id: string;
  nombre: string;
  descripcion: string;
  fuentes: number;
  icono: string;
  color: string;
  ultimaConversacion: Date;
}

export const asistentesData: Asistente[] = [
  {
    id: "ast-001",
    nombre: "Asistente Ventas",
    descripcion: "Especializado en productos financieros y ventas",
    fuentes: 12,
    icono: "MessageSquare",
    color: "#9b87f5",
    ultimaConversacion: new Date(2025, 3, 18)
  },
  {
    id: "ast-002",
    nombre: "Soporte Cliente",
    descripcion: "Ayuda con consultas frecuentes y problemas técnicos",
    fuentes: 8,
    icono: "Users",
    color: "#33C3F0",
    ultimaConversacion: new Date(2025, 3, 15)
  },
  {
    id: "ast-003",
    nombre: "Asesor Inversiones",
    descripcion: "Orientación sobre productos de inversión",
    fuentes: 15,
    icono: "Settings",
    color: "#7E69AB",
    ultimaConversacion: new Date(2025, 3, 10)
  },
  {
    id: "ast-004",
    nombre: "Asistente Créditos",
    descripcion: "Especializado en productos de crédito y préstamos",
    fuentes: 7,
    icono: "User",
    color: "#1EAEDB",
    ultimaConversacion: new Date(2025, 3, 12)
  }
];