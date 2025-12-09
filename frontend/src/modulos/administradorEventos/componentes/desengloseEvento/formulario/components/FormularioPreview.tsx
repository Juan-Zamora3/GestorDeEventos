// src/modulos/administradorEventos/componentes/desengloseEvento/formulario/FormularioPreview.tsx
import React, {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useParams } from "react-router-dom";
import { FiLock, FiCalendar } from "react-icons/fi";

import type { FormTheme } from "./types";
import IconoTipo from "./IconoTipo";
import {
  MOCK_PREGUNTAS,
  mapPreguntaDoc,
  type PreguntaView,
} from "./constants";

import { db } from "../../../../../../firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

interface Props {
  theme: FormTheme;
  interactive?: boolean;
  /**
   * Si ya tienes las preguntas cargadas en el padre, las puedes pasar aquí.
   * Si no, este componente intentará leerlas desde Firestore.
   */
  preguntas?: PreguntaView[];
  /**
   * Id del evento explícito (opcional). Si no se pasa, se usa useParams().id
   */
  idEvento?: string;
  /**
   * Id del formulario dentro del evento.
   * Default sugerido: "inscripcion".
   */
  idFormulario?: string;
}

const FormularioPreview: React.FC<Props> = ({
  theme,
  interactive,
  preguntas: preguntasProp,
  idEvento: idEventoProp,
  idFormulario = "inscripcion",
}) => {
  const params = useParams<{ id: string }>();
  const idEventoFinal = idEventoProp ?? params.id;

  const [preguntas, setPreguntas] = useState<PreguntaView[]>([]);
  const [titulo, setTitulo] = useState("Formulario de inscripción");
  const [descripcion, setDescripcion] = useState(
    "Por favor complete todos los campos obligatorios.",
  );
  const [correoDummy, setCorreoDummy] = useState("correo@usuario.com");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Construir URL de Google Fonts (simple carga de varias)
  const fontUrl =
    "https://fonts.googleapis.com/css2?family=Lobster&family=Merriweather:wght@300;400;700&family=Open+Sans:wght@400;600&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;500;700&display=swap";

  // Fondo (imagen o color)
  const backgroundStyle: CSSProperties = theme.backgroundImage
    ? {
        backgroundImage: `url(${theme.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }
    : { backgroundColor: theme.backgroundColor };

  // 🔹 Cargar información desde Firebase si no pasas preguntas por props
  useEffect(() => {
    const cargar = async () => {
      try {
        // Si el padre ya mandó las preguntas, solo las usamos.
        if (preguntasProp && preguntasProp.length > 0) {
          setPreguntas(preguntasProp);
          setCargando(false);
          return;
        }

        // Si no hay idEvento, hacemos fallback a mock
        if (!idEventoFinal) {
          setPreguntas(MOCK_PREGUNTAS);
          setCargando(false);
          return;
        }

        setCargando(true);
        setError(null);

        // 1) Info del evento (nombre, etc.)
        const eventoRef = doc(db, "eventos", idEventoFinal);
        const eventoSnap = await getDoc(eventoRef);
        if (eventoSnap.exists()) {
          const data = eventoSnap.data() as any;
          // Si el evento tiene nombre, usamos algo del estilo:
          if (data.nombre) {
            setTitulo(`${data.nombre} - Formulario de inscripción`);
          }
          if (data.descripcionFormulario) {
            setDescripcion(data.descripcionFormulario);
          } else if (data.descripcion) {
            setDescripcion(data.descripcion);
          }
          if (data.correoContacto) {
            setCorreoDummy(data.correoContacto);
          }
        }

        // 2) Info específica del formulario (si existe)
        const formRef = doc(
          db,
          "eventos",
          idEventoFinal,
          "formularios",
          idFormulario,
        );
        const formSnap = await getDoc(formRef);
        if (formSnap.exists()) {
          const dataForm = formSnap.data() as any;
          if (dataForm.titulo) {
            setTitulo(dataForm.titulo);
          }
          if (dataForm.descripcion) {
            setDescripcion(dataForm.descripcion);
          }
          if (dataForm.correoDummy) {
            setCorreoDummy(dataForm.correoDummy);
          }
        }

        // 3) Preguntas del formulario
        const preguntasRef = collection(
          db,
          "eventos",
          idEventoFinal,
          "formularios",
          idFormulario,
          "preguntas",
        );
        const q = query(preguntasRef, orderBy("orden"));
        const snap = await getDocs(q);

        if (snap.empty) {
          // Si no hay nada en BD, fallback al mock
          setPreguntas(MOCK_PREGUNTAS);
        } else {
          const arr = snap.docs.map((d) =>
            mapPreguntaDoc(d.id, d.data()),
          );
          setPreguntas(arr);
        }
      } catch (e) {
        console.error("[FormularioPreview] Error al cargar formulario:", e);
        setError("No se pudo cargar el formulario desde la base de datos.");
        // Fallback para que no se quede vacío
        setPreguntas(MOCK_PREGUNTAS);
      } finally {
        setCargando(false);
      }
    };

    void cargar();
  }, [preguntasProp, idEventoFinal, idFormulario]);

  const preguntasRender = useMemo(
    () => preguntas,
    [preguntas],
  );

  return (
    <div
      className="flex-1 h-full overflow-y-auto transition-all duration-500 ease-in-out relative"
      style={backgroundStyle}
    >
      {/* Fuentes */}
      <link href={fontUrl} rel="stylesheet" />

      <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">
        {/* HEADER CARD */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 border-t-0 relative group">
          {/* Banner: imagen o franja de color */}
          {theme.headerImage ? (
            <div className="h-36 w-full relative bg-slate-100">
              <img
                src={theme.headerImage}
                alt="Header"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="h-3 w-full transition-colors duration-300"
              style={{ backgroundColor: theme.accentColor }}
            />
          )}

          <div className="px-6 py-6">
            <h1
              className="font-bold mb-2 transition-colors leading-tight"
              style={{
                color: theme.textStyles.header.color,
                fontFamily: theme.textStyles.header.font,
                fontSize: `${theme.textStyles.header.size}px`,
              }}
            >
              {titulo}
            </h1>
            <p
              className="text-slate-600"
              style={{
                fontFamily: theme.textStyles.text.font,
                fontSize: `${theme.textStyles.text.size}px`,
              }}
            >
              {descripcion}
            </p>
          </div>

          <div className="px-6 py-2 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <span
              className="text-slate-500 font-medium"
              style={{
                fontSize: "11px",
                fontFamily: theme.textStyles.text.font,
              }}
            >
              {correoDummy}{" "}
              <span className="text-slate-400">(no compartido)</span>
            </span>
            <span
              className="font-medium cursor-pointer transition-colors"
              style={{
                color: theme.accentColor,
                fontSize: "11px",
                fontFamily: theme.textStyles.text.font,
              }}
            >
              Cambiar cuenta
            </span>
          </div>
        </div>

        {/* Mensajes de estado */}
        {cargando && (
          <p className="text-xs text-slate-500">
            Cargando previsualización del formulario…
          </p>
        )}
        {error && (
          <p className="text-xs text-rose-600 font-semibold">
            {error}
          </p>
        )}

        {/* PREGUNTAS */}
        {preguntasRender.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-xl shadow-sm border border-transparent px-6 py-6 transition-all hover:shadow-md relative`}
          >
            {/* Barra lateral para indicar campos auto (participantes) */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-colors duration-300"
              style={{
                backgroundColor:
                  p.source === "participantes" ? "#cbd5e1" : "transparent",
              }}
            />

            <div className="mb-4">
              <div className="flex justify-between items-start gap-4">
                <label
                  className="font-medium block"
                  style={{
                    color: theme.textStyles.question.color,
                    fontFamily: theme.textStyles.question.font,
                    fontSize: `${theme.textStyles.question.size}px`,
                  }}
                >
                  {p.nombre}
                  {p.obligatorio && (
                    <span className="text-rose-500 ml-1">*</span>
                  )}
                </label>
                {p.source === "participantes" && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500">
                    <FiLock size={10} />
                    <span>{p.tipoLabel ?? "Auto"}</span>
                  </div>
                )}
              </div>
              {p.placeholder && (
                <p
                  className="mt-1"
                  style={{
                    color: theme.textStyles.text.color,
                    fontFamily: theme.textStyles.text.font,
                    fontSize: `${Math.max(
                      10,
                      theme.textStyles.text.size - 2,
                    )}px`,
                  }}
                >
                  {p.placeholder}
                </p>
              )}
            </div>

            <div className="mt-2">
              {/* Texto corto / email / tel / número */}
              {(p.tipo === "texto_corto" ||
                p.tipo === "email" ||
                p.tipo === "telefono" ||
                p.tipo === "numero") && (
                <div className="border-b border-slate-200 py-2 w-full md:w-1/2 flex items-center gap-2 transition-colors duration-300">
                  <IconoTipo tipo={p.tipo} />
                  <input
                    disabled={!interactive}
                    className="bg-transparent w-full outline-none placeholder:text-slate-300"
                    placeholder="Tu respuesta"
                    style={{
                      color: theme.textStyles.text.color,
                      fontFamily: theme.textStyles.text.font,
                      fontSize: `${theme.textStyles.text.size}px`,
                    }}
                  />
                </div>
              )}

              {/* Texto largo */}
              {p.tipo === "texto_largo" && (
                <div className="border-b border-slate-200 py-2 w-full flex items-start gap-2">
                  <IconoTipo tipo={p.tipo} />
                  <textarea
                    disabled={!interactive}
                    className="bg-transparent w-full outline-none resize-none placeholder:text-slate-300"
                    rows={1}
                    placeholder="Tu respuesta"
                    style={{
                      color: theme.textStyles.text.color,
                      fontFamily: theme.textStyles.text.font,
                      fontSize: `${theme.textStyles.text.size}px`,
                    }}
                  />
                </div>
              )}

              {/* Fecha */}
              {p.tipo === "fecha" && (
                <div className="inline-flex items-center gap-3 border-b border-slate-200 py-2">
                  <input
                    type="date"
                    disabled={!interactive}
                    className="bg-transparent outline-none"
                    style={{
                      color: theme.textStyles.text.color,
                      fontFamily: theme.textStyles.text.font,
                      fontSize: `${theme.textStyles.text.size}px`,
                    }}
                  />
                  <FiCalendar className="text-slate-400" />
                </div>
              )}

              {/* Selección simple / múltiple */}
              {(p.tipo === "seleccion_simple" ||
                p.tipo === "seleccion_multiple") && (
                <div className="space-y-3 mt-3">
                  {p.config?.opciones?.map((op, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 opacity-70"
                    >
                      {p.tipo === "seleccion_simple" ? (
                        <input
                          type="radio"
                          disabled={!interactive}
                          className="h-4 w-4"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          disabled={!interactive}
                          className="h-4 w-4"
                        />
                      )}
                      <span
                        style={{
                          color: theme.textStyles.text.color,
                          fontFamily: theme.textStyles.text.font,
                          fontSize: `${theme.textStyles.text.size}px`,
                        }}
                      >
                        {op}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-6 pb-12 px-2">
          <button
            disabled={!interactive}
            className="px-8 py-2.5 rounded shadow-sm text-white font-semibold opacity-90 cursor-not-allowed transition-colors duration-300"
            style={{
              backgroundColor: theme.accentColor,
              fontSize: `${theme.textStyles.text.size}px`,
            }}
          >
            Enviar
          </button>

          <button
            className="font-medium hover:opacity-80 transition-opacity"
            style={{
              color: theme.accentColor,
              fontSize: `${theme.textStyles.text.size}px`,
            }}
          >
            Borrar formulario
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioPreview;
