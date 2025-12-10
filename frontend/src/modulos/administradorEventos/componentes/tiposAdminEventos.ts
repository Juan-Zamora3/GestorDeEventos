// Tarjetas de eventos que se muestran en los grids
export interface EventoCardAdminEventos {
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

// Tarjetas de plantillas (Evento en blanco, Concurso, Foro, etc.)
export interface PlantillaEvento {
  id: string;
  titulo: string;
  descripcion?: string;
  imagen: string;
}

export interface RolEvento {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface CampoEvento {
  id: string;
  nombre: string;
  tipo:
    | "texto"
    | "numero"
    | "opciones"
    | "fecha"
    | "email"
    | "telefono"
    | "texto_corto"
    | "texto_largo";
  immutable?: boolean;
  config?: { opciones?: string[] };
}

// 🔹 NUEVO: Info básica del evento para el wizard
export interface InfoEventoDraft {
  nombre: string;
  fechaInicioEvento: string;
  fechaFinEvento: string;
  fechaInicioInscripciones: string;
  fechaFinInscripciones: string;
  descripcion: string;
  /**
   * URL de la imagen de portada del evento en Firebase Storage.
   * Opcional porque al inicio puede no existir.
   */
  imagenPortadaUrl?: string;
}

export type PerfilId =
  | "participante"
  | "asesor"
  | "integrante"
  | "lider_equipo";

export interface ParticipantesDraft {
  modo: "individual" | "equipos";
  maxParticipantes: string;
  maxEquipos: string;
  minIntegrantes: string;
  maxIntegrantes: string;
  seleccion: Record<"asesor" | "lider_equipo", boolean>;
  camposPorPerfil: Record<PerfilId | string, CampoEvento[]>;
}
// (Definición consolidada de InfoEventoDraft se encuentra en la API)
