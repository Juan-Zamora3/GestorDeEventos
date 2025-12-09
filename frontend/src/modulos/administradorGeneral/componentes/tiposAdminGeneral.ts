// src/modulos/administradorGeneral/componentes/tiposAdminGeneral.ts

export interface EventoCard {
  id: string; // 👈 string, NO number
  titulo: string;
  tipo?: "Concurso" | "Curso" | "Congreso" | "Seminario" | "Otro";
  fechaInicio: string;
  fechaFin: string;
  equipos: string;
  personas: string;
  imagen: string;
  activo: boolean;
}

export interface UsuarioRow {
  id: string; // 👈 string, NO number (id del doc en eventos_usuarios_rol_evento)
  nombre: string;
  correo: string;
  telefono: string;
  evento: string;
  rol: string;
  status: "Activo" | "Finalizado";
}

export interface EntradaHistorial {
  id: string; // 👈 string también
  nombre: string;
  rol: string;
  evento: string;
  accion: string;
  fecha: string;
  hora: string;
}
