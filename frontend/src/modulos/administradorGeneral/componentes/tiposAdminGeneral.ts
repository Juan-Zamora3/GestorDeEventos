// src/modulos/administradorGeneral/componentes/tiposAdminGeneral.ts

export interface EventoCard {
  id: number;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  equipos: string;
  personas: string;
  imagen: string;
  activo: boolean;
}

export interface UsuarioRow {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  evento: string;
  rol: string;
  status: "Activo" | "Finalizado";
}

export interface EntradaHistorial {
  id: number;
  nombre: string;
  rol: string;
  evento: string;
  accion: string;
  fecha: string;
  hora: string;
}
