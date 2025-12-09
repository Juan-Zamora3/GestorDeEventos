// src/modulos/administradorEventos/componentes/desengloseEvento/formulario/PanelPersonalizacion.tsx
import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FiX,
  FiImage,
  FiPlus,
  FiCheck,
  FiDroplet,
  FiUpload,
} from "react-icons/fi";
import type { FormTheme, FormFont } from "./types";

import { db } from "../../../../../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

interface Props {
  theme: FormTheme;
  onChange: (newTheme: FormTheme) => void;
  onClose: () => void;
  /**
   * URL pública del formulario (opcional).
   * Si no viene, el panel intentará leer `publicUrl` desde Firestore.
   */
  eventLink?: string;
  /**
   * Id del evento al que pertenece este formulario.
   * Si no se pasa, NO se harán lecturas/escrituras a Firestore.
   */
  idEvento?: string;
  /**
   * Id del formulario dentro del evento (por ejemplo "inscripcion").
   * Default sugerido: "inscripcion".
   */
  idFormulario?: string;
}

const PRESET_COLORS = [
  "#db4437",
  "#673AB7",
  "#3F51B5",
  "#4285F4",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#FF9800",
  "#795548",
  "#607D8B",
];

const BACKGROUND_COLORS = [
  "#F0F2F5",
  "#FFFFFF",
  "#FFF8E1",
  "#E8F5E9",
  "#E3F2FD",
  "#F3E5F5",
  "#FBE9E7",
];

const BACKGROUND_IMAGES = [
  // Gradient
  "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1000&q=80",
  // Abstract
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80",
  // Texture
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80",
];

const FONTS: { label: string; value: FormFont }[] = [
  { label: "Roboto", value: "Roboto" },
  { label: "Merriweather", value: "Merriweather" },
  { label: "Lobster", value: "Lobster" },
  { label: "Playfair", value: "Playfair Display" },
  { label: "Open Sans", value: "Open Sans" },
];

const FONT_SIZES = [10, 11, 12, 14, 16, 18, 24, 30, 36];

const HEADER_IMAGES = [
  {
    id: "tech",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
    label: "Tecnología",
  },
  {
    id: "books",
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80",
    label: "Educación",
  },
  {
    id: "nature",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80",
    label: "Naturaleza",
  },
];

const PanelPersonalizacion: React.FC<Props> = ({
  theme,
  onChange,
  onClose,
  eventLink,
  idEvento,
  idFormulario = "inscripcion",
}) => {
  const [showHeaderImages, setShowHeaderImages] = useState(false);
  const [showBgImages, setShowBgImages] = useState(false);

  const [isPublished, setIsPublished] = useState(false);
  const [linkLocal, setLinkLocal] = useState(eventLink ?? "");

  const headerInputRef = useRef<HTMLInputElement | null>(null);
  const bgInputRef = useRef<HTMLInputElement | null>(null);

  // Para evitar guardar el tema en la primera carga
  const firstThemeSave = useRef(true);

  type TextSection = "header" | "question" | "text";
  type TextField = "font" | "size" | "color";

  const updateTextStyle = (
    section: TextSection,
    field: TextField,
    value: string | number,
  ) => {
    onChange({
      ...theme,
      textStyles: {
        ...theme.textStyles,
        [section]: {
          ...theme.textStyles[section],
          [field]: value,
        },
      },
    });
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "header" | "background",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // 🔹 IMPORTANTE:
      // Esto usa un object URL temporal (NO se sube a Storage).
      // Si quieres que sea permanente, habría que integrarlo con Firebase Storage.
      const url = URL.createObjectURL(file);
      if (type === "header") {
        onChange({ ...theme, headerImage: url });
        setShowHeaderImages(false);
      } else {
        onChange({
          ...theme,
          backgroundImage: url,
          backgroundColor: "#FFFFFF",
        });
        setShowBgImages(false);
      }
    }
  };

  // Sincronizar linkLocal cuando cambie eventLink desde fuera
  React.useEffect(() => {
    setLinkLocal(eventLink ?? "");
  }, [eventLink]);

  const hasFirestoreIds = Boolean(idEvento && idFormulario);
  const formDocRef = hasFirestoreIds
    ? doc(db, "eventos", idEvento!, "formularios", idFormulario)
    : null;

  // 🔹 Cargar estado inicial (published, publicUrl, theme) desde Firestore
  useEffect(() => {
    const cargarConfig = async () => {
      if (!formDocRef) return;
      try {
        const snap = await getDoc(formDocRef);
        if (!snap.exists()) return;

        const data = snap.data() as any;

        if (typeof data.published === "boolean") {
          setIsPublished(data.published);
        }

        // Si hay publicUrl en BD y no viene por props, la usamos
        if (data.publicUrl && !eventLink) {
          setLinkLocal(data.publicUrl as string);
        }

        // Si el doc tiene theme guardado, lo mandamos al padre
        if (data.theme) {
          onChange(data.theme as FormTheme);
        }
      } catch (e) {
        console.error(
          "[PanelPersonalizacion] Error al cargar configuración del formulario:",
          e,
        );
      }
    };

    void cargarConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEvento, idFormulario]);

  // 🔹 Guardar cambios de theme en Firestore cada vez que cambie (auto-save simple)
  useEffect(() => {
    const guardarTheme = async () => {
      if (!formDocRef) return;
      if (firstThemeSave.current) {
        // Saltamos el primer render para no sobreescribir datos recién cargados
        firstThemeSave.current = false;
        return;
      }
      try {
        await updateDoc(formDocRef, {
          theme,
          actualizadoEn: new Date(),
        });
      } catch (e) {
        console.error(
          "[PanelPersonalizacion] Error al guardar theme en Firestore:",
          e,
        );
      }
    };

    void guardarTheme();
  }, [theme, formDocRef]);

  const publicarFormulario = async () => {
    setIsPublished(true);
    try {
      if (formDocRef) {
        await updateDoc(formDocRef, {
          published: true,
          // Si quieres, puedes guardar también la URL pública aquí:
          // publicUrl: linkLocal || (alguna_generada_por_ti)
        });
      }
    } catch (e) {
      console.error(
        "[PanelPersonalizacion] Error al publicar formulario:",
        e,
      );
    }
  };

  const despublicarFormulario = async () => {
    setIsPublished(false);
    try {
      if (formDocRef) {
        await updateDoc(formDocRef, {
          published: false,
        });
      }
    } catch (e) {
      console.error(
        "[PanelPersonalizacion] Error al despublicar formulario:",
        e,
      );
    }
  };

  const copiarLink = () => {
    if (!linkLocal) return;
    void navigator.clipboard.writeText(linkLocal);
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-20">
      <header className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <FiDroplet className="text-[#5B4AE5]" size={20} />
          <span>Tema</span>
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500"
        >
          <FiX size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        {/* 0. ACCIONES (Publicar / Link) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Acciones
          </h4>

          {!isPublished ? (
            <button
              onClick={publicarFormulario}
              className="w-full px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60"
              disabled={!hasFirestoreIds}
            >
              Publicar formulario
            </button>
          ) : (
            <div className="space-y-2 animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <FiCheck /> Publicado
                </span>
                <button
                  onClick={despublicarFormulario}
                  className="text-[10px] text-slate-400 underline"
                  type="button"
                >
                  Despublicar
                </button>
              </div>

              <label className="text-xs font-semibold text-slate-700">
                Enlace del evento
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={linkLocal}
                  className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm bg-white"
                />
                <button
                  onClick={copiarLink}
                  className="px-3 py-2 rounded bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
                  type="button"
                  disabled={!linkLocal}
                >
                  Copiar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 1. ESTILO DEL TEXTO */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Estilo del texto
          </h4>

          {/* Encabezado */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Encabezado
            </label>
            <div className="flex gap-2">
              <select
                className="flex-1 rounded border border-slate-200 text-sm py-1.5 px-2 bg-white outline-none focus:border-blue-500"
                value={theme.textStyles.header.font}
                onChange={(e) =>
                  updateTextStyle("header", "font", e.target.value)
                }
                style={{ fontFamily: theme.textStyles.header.font }}
              >
                {FONTS.map((f) => (
                  <option
                    key={f.value}
                    value={f.value}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </option>
                ))}
              </select>
              <select
                className="w-20 rounded border border-slate-200 text-sm py-1.5 px-2 bg-white outline-none focus:border-blue-500"
                value={theme.textStyles.header.size}
                onChange={(e) =>
                  updateTextStyle("header", "size", Number(e.target.value))
                }
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {/* Color picker for header */}
              <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <input
                  type="color"
                  value={theme.textStyles.header.color}
                  onChange={(e) =>
                    updateTextStyle("header", "color", e.target.value)
                  }
                  className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                />
                <span
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: theme.textStyles.header.color }}
                />
              </div>
            </div>
          </div>

          {/* Pregunta */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Pregunta
            </label>
            <div className="flex gap-2">
              <select
                className="flex-1 rounded border border-slate-200 text-sm py-1.5 px-2 bg-white outline-none focus:border-blue-500"
                value={theme.textStyles.question.font}
                onChange={(e) =>
                  updateTextStyle("question", "font", e.target.value)
                }
                style={{ fontFamily: theme.textStyles.question.font }}
              >
                {FONTS.map((f) => (
                  <option
                    key={f.value}
                    value={f.value}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </option>
                ))}
              </select>
              <select
                className="w-20 rounded border border-slate-200 text-sm py-1.5 px-2 bg-white outline-none focus:border-blue-500"
                value={theme.textStyles.question.size}
                onChange={(e) =>
                  updateTextStyle("question", "size", Number(e.target.value))
                }
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {/* Color picker for question */}
              <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <input
                  type="color"
                  value={theme.textStyles.question.color}
                  onChange={(e) =>
                    updateTextStyle("question", "color", e.target.value)
                  }
                  className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                />
                <span
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: theme.textStyles.question.color }}
                />
              </div>
            </div>
          </div>

          {/* Texto */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Texto
            </label>
            <div className="flex gap-2">
              <select
                className="flex-1 rounded border border-slate-200 text-sm py-1.5 px-2 bg-white outline-none focus:border-blue-500"
                value={theme.textStyles.text.font}
                onChange={(e) =>
                  updateTextStyle("text", "font", e.target.value)
                }
                style={{ fontFamily: theme.textStyles.text.font }}
              >
                {FONTS.map((f) => (
                  <option
                    key={f.value}
                    value={f.value}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </option>
                ))}
              </select>
              <select
                className="w-20 rounded border border-slate-200 text-sm py-1.5 px-2 bg-white outline-none focus:border-blue-500"
                value={theme.textStyles.text.size}
                onChange={(e) =>
                  updateTextStyle("text", "size", Number(e.target.value))
                }
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {/* Color picker for text */}
              <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <input
                  type="color"
                  value={theme.textStyles.text.color}
                  onChange={(e) =>
                    updateTextStyle("text", "color", e.target.value)
                  }
                  className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                />
                <span
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: theme.textStyles.text.color }}
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* 2. ENCABEZADO */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Encabezado
          </label>

          {!theme.headerImage ? (
            <button
              onClick={() => setShowHeaderImages(!showHeaderImages)}
              className="flex items-center gap-2 px-4 py-2 rounded border border-slate-300 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
              type="button"
            >
              <FiImage /> Elegir imagen
            </button>
          ) : (
            <div className="relative group rounded-lg overflow-hidden border border-slate-200">
              <img
                src={theme.headerImage}
                className="w-full h-24 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    onChange({ ...theme, headerImage: undefined })
                  }
                  className="text-white text-xs font-bold underline"
                  type="button"
                >
                  Quitar
                </button>
              </div>
            </div>
          )}

          {/* Selector de imágenes predefinidas / subir */}
          {showHeaderImages && !theme.headerImage && (
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-2">
                {HEADER_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      onChange({ ...theme, headerImage: img.url });
                      setShowHeaderImages(false);
                    }}
                    className="h-16 rounded-md overflow-hidden border border-slate-200 hover:ring-2 ring-blue-500"
                    type="button"
                  >
                    <img
                      src={img.url}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() => headerInputRef.current?.click()}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 text-xs font-semibold hover:bg-slate-50 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                type="button"
              >
                <FiUpload /> Subir imagen
              </button>
              <input
                ref={headerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "header")}
              />
            </div>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* 3. COLOR DE ACENTOS */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Color de acentos
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChange({ ...theme, accentColor: c })}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                  theme.accentColor === c
                    ? "ring-2 ring-offset-2 ring-slate-300 scale-110"
                    : ""
                }`}
                style={{ backgroundColor: c }}
                type="button"
              >
                {theme.accentColor === c && (
                  <FiCheck className="text-white/80" size={14} />
                )}
              </button>
            ))}
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) =>
                  onChange({ ...theme, accentColor: e.target.value })
                }
                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
              />
              <FiPlus className="text-slate-500" />
            </div>
          </div>
        </div>

        {/* 4. FONDO */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Fondo
          </label>
          <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-50 rounded-xl">
            {/* Colores */}
            {BACKGROUND_COLORS.map((c) => (
              <button
                key={c}
                onClick={() =>
                  onChange({
                    ...theme,
                    backgroundColor: c,
                    backgroundImage: undefined,
                  })
                }
                className={`w-8 h-8 rounded-full border border-slate-200 shadow-sm flex items-center justify-center ${
                  theme.backgroundColor === c && !theme.backgroundImage
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                style={{ backgroundColor: c }}
                type="button"
              >
                {theme.backgroundColor === c && !theme.backgroundImage && (
                  <FiCheck className="text-slate-400" size={14} />
                )}
              </button>
            ))}

            {/* Color custom */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-100 cursor-pointer">
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) =>
                  onChange({
                    ...theme,
                    backgroundColor: e.target.value,
                    backgroundImage: undefined,
                  })
                }
                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
              />
              <FiPlus className="text-slate-500" size={14} />
            </div>

            <div className="w-px h-8 bg-slate-300 mx-1" />

            {/* Selector de imágenes de fondo */}
            <button
              onClick={() => setShowBgImages(!showBgImages)}
              className={`w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 ${
                theme.backgroundImage ? "ring-2 ring-blue-500" : ""
              }`}
              title="Elegir imagen de fondo"
              type="button"
            >
              <FiImage className="text-slate-500" size={14} />
            </button>
          </div>

          {showBgImages && (
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-3 gap-2">
                {BACKGROUND_IMAGES.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onChange({ ...theme, backgroundImage: url });
                      setShowBgImages(false);
                    }}
                    className={`h-12 rounded-md overflow-hidden border border-slate-200 hover:ring-2 ring-blue-500 ${
                      theme.backgroundImage === url
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                    type="button"
                  >
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() => bgInputRef.current?.click()}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 text-xs font-semibold hover:bg-slate-50 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                type="button"
              >
                <FiUpload /> Subir imagen
              </button>
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "background")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelPersonalizacion;
