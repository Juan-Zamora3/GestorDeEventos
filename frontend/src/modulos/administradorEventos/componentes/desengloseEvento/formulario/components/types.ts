export type FormFont = "Roboto" | "Merriweather" | "Open Sans" | "Playfair Display" | "Lobster";

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
  accentColor: string; // "Color" (acentos)
  backgroundColor: string; // Color de fondo
  backgroundImage?: string; // Imagen de fondo
}

export const DEFAULT_THEME: FormTheme = {
  textStyles: {
    header: { font: "Roboto", size: 24, color: "#1f2937" }, // slate-800/900
    question: { font: "Roboto", size: 14, color: "#1f2937" },
    text: { font: "Roboto", size: 12, color: "#4b5563" }, // slate-600
  },
  headerImage: undefined,
  accentColor: "#673AB7", // Purple
  backgroundColor: "#F0F2F5",
  backgroundImage: undefined,
};
