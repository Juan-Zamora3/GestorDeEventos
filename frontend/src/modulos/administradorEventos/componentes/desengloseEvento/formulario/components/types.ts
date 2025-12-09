// src/modulos/administradorEventos/componentes/desengloseEvento/formulario/types.ts

export type FormFont =
  | "Roboto"
  | "Merriweather"
  | "Open Sans"
  | "Playfair Display"
  | "Lobster";

export interface TextStyle {
  font: FormFont;
  size: number;
  color: string;
}

export interface FormTheme {
  textStyles: {
    header: TextStyle;
    question: TextStyle;
    text: TextStyle;
  };
  headerImage?: string;
  accentColor: string;       // Color de acentos (botones, links, etc.)
  backgroundColor: string;   // Color de fondo del formulario
  backgroundImage?: string;  // Imagen de fondo
}

/**
 * Tema por defecto del formulario si no hay nada en BD.
 */
export const DEFAULT_THEME: FormTheme = {
  textStyles: {
    header: { font: "Roboto", size: 24, color: "#1f2937" },   // slate-800
    question: { font: "Roboto", size: 14, color: "#1f2937" }, // slate-800
    text: { font: "Roboto", size: 12, color: "#4b5563" },     // slate-600
  },
  headerImage: undefined,
  accentColor: "#673AB7",      // morado
  backgroundColor: "#F0F2F5",  // gris claro
  backgroundImage: undefined,
};
