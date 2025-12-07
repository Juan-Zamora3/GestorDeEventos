// src/modulos/administradorAsistencias/componentes/tiposAdminAsistencias.ts
export interface EventoResumen {
  id: string;
  titulo: string;
  imagen: string;
  tipo?: "Concurso" | "Curso" | "Congreso" | "Seminario" | "Otro";
  fechaInicio: string;
  fechaFin: string;
  equipos: string;
  personas: string;
  activo: boolean;
}

export interface Integrante {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol: string;
  institucion: string;
  correo: string;
  telefono: string;
}

export interface EquipoResumen {
  id: string;
  nombre: string;
  institucion: string;
  asesor: string;
  integrantes: number;
}

export interface AsistenciaRegistro {
  id: string;
  nombreCompleto: string;
  codigo: string;
  pagado: boolean;
  entrada: "Registrada" | "Pendiente";
  regreso: "Registrada" | "Pendiente";
}
