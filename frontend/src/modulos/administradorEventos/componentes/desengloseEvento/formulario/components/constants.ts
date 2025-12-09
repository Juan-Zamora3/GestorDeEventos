// src/modulos/administradorEventos/componentes/desengloseEvento/formulario/constants.ts
export type TipoCampo =
  | "texto_corto"
  | "texto_largo"
  | "email"
  | "telefono"
  | "seleccion_simple"
  | "seleccion_multiple"
  | "numero"
  | "fecha";

export interface PreguntaView {
  id: string;
  nombre: string;
  tipo: TipoCampo;
  placeholder?: string;
  obligatorio: boolean;
  config?: { opciones?: string[] };
  source?: "manual" | "participantes";
  tipoLabel?: string;
  orden?: number; // opcional para ordenar en Firestore
}

/**
 * Fallback local para vistas de preview cuando no hay nada en BD.
 */
export const MOCK_PREGUNTAS: PreguntaView[] = [
  {
    id: "auto-equipo",
    nombre: "Nombre del Equipo",
    tipo: "texto_corto",
    tipoLabel: "Equipo",
    placeholder: "ej. Astros",
    obligatorio: true,
    source: "participantes",
  },
  {
    id: "auto-lider-nombre",
    nombre: "Líder: Nombre Completo",
    tipo: "texto_corto",
    tipoLabel: "Líder",
    placeholder: "Nombre del líder",
    obligatorio: true,
    source: "participantes",
  },
  {
    id: "auto-lider-correo",
    nombre: "Líder: Correo",
    tipo: "email",
    tipoLabel: "Líder",
    placeholder: "correo@lider.com",
    obligatorio: true,
    source: "participantes",
  },
  {
    id: "manual-robot",
    nombre: "Nombre del Robot",
    tipo: "texto_corto",
    placeholder: "ej. Wall-E",
    obligatorio: true,
    source: "manual",
  },
  {
    id: "manual-cat",
    nombre: "Categoría de peso",
    tipo: "seleccion_simple",
    placeholder: "Selecciona una",
    obligatorio: true,
    source: "manual",
    config: {
      opciones: ["Ligero (3kg)", "Medio (10kg)", "Pesado (Libre)"],
    },
  },
  {
    id: "manual-desc",
    nombre: "Descripción técnica",
    tipo: "texto_largo",
    placeholder: "Breve descripción del funcionamiento...",
    obligatorio: false,
    source: "manual",
  },
];

/**
 * Helper para mapear un doc de Firestore a PreguntaView.
 * (Por si quieres reutilizarlo en otros lados).
 */
export function mapPreguntaDoc(
  id: string,
  data: any,
): PreguntaView {
  return {
    id,
    nombre: data.nombre ?? "Pregunta sin nombre",
    tipo: (data.tipo ?? "texto_corto") as TipoCampo,
    placeholder: data.placeholder ?? "",
    obligatorio: !!data.obligatorio,
    config: data.config ?? undefined,
    source: data.source ?? "manual",
    tipoLabel: data.tipoLabel ?? undefined,
    orden: typeof data.orden === "number" ? data.orden : undefined,
  };
}
