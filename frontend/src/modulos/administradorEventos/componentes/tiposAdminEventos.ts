// src/modulos/administradorEventos/componentes/tiposAdminEventos.ts

// Tarjetas de eventos que se muestran en los grids
export interface EventoCardAdminEventos {
  id: string;
  titulo: string;
  imagen: string;
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
  tipo: "texto" | "numero" | "opciones" | "fecha";
  immutable?: boolean;
}
