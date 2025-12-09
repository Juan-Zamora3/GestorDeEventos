// src/modulos/administradorEventos/componentes/desengloseEvento/formulario/SeccionFormularioDesenglose.tsx
import React, { useEffect, useState } from "react";
import { FiDroplet, FiEye } from "react-icons/fi";
import { useParams } from "react-router-dom";

import FormularioPreview from "./components/FormularioPreview";
import PanelPersonalizacion from "./components/PanelPersonalizacion";
import { DEFAULT_THEME } from "./components/types";
import type { FormTheme } from "./components/types";

// 🔹 Firebase
import { db } from "../../../../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const SeccionFormularioDesenglose: React.FC = () => {
  const { id } = useParams();
  const idEvento = id ?? null;

  // Tema local (se sincroniza con Firestore cuando hay idEvento)
  const [theme, setTheme] = useState<FormTheme>(DEFAULT_THEME);
  const [showPanel, setShowPanel] = useState(false);

  // Link público que se muestra en el panel
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const [publicLink, setPublicLink] = useState<string>("");

  // URL para vista previa "real" (otro route que tú controles)
  const eventIdForUrl = id ?? "sin-id";
  const previewUrl = `${origin}/formulario/preview/${eventIdForUrl}`;

  // Cargar configuración inicial del formulario desde Firestore
  useEffect(() => {
    const cargarDesdeFirestore = async () => {
      if (!idEvento) {
        // Si no hay id evento, usamos el link por defecto y tema por defecto
        setPublicLink(`${origin}/formulario/${eventIdForUrl}`);
        return;
      }

      try {
        const formRef = doc(
          db,
          "eventos",
          idEvento,
          "formularios",
          "inscripcion", // 👈 idFormulario por defecto
        );
        const snap = await getDoc(formRef);

        if (!snap.exists()) {
          // Si no existe doc, usamos defaults y un link derivado del origin
          setPublicLink(`${origin}/formulario/${idEvento}`);
          return;
        }

        const data = snap.data() as any;

        // Tema guardado
        if (data.theme) {
          setTheme(data.theme as FormTheme);
        }

        // URL pública: si viene de BD la usamos, si no, generamos una base
        if (typeof data.publicUrl === "string" && data.publicUrl.trim()) {
          setPublicLink(data.publicUrl);
        } else {
          setPublicLink(`${origin}/formulario/${idEvento}`);
        }
      } catch (e) {
        console.error(
          "[SeccionFormularioDesenglose] Error al cargar formulario desde Firestore:",
          e,
        );
        // En caso de error, al menos dejamos una URL base
        setPublicLink(`${origin}/formulario/${eventIdForUrl}`);
      }
    };

    void cargarDesdeFirestore();
  }, [idEvento, origin, eventIdForUrl]);

  const handlePreview = () => {
    // Esta parte sigue usando localStorage para la vista previa
    // (tu ruta /formulario/preview/:id puede leer este dato también).
    try {
      localStorage.setItem(
        `formTheme:${eventIdForUrl}`,
        JSON.stringify(theme),
      );
    } catch (e) {
      console.error(
        "[SeccionFormularioDesenglose] Error al guardar theme en localStorage:",
        e,
      );
    }
    window.open(previewUrl, "_blank");
  };

  return (
    <section className="relative flex h-full w-full overflow-hidden bg-[#F0F2F5]">
      {/* Panel de personalización (sidebar derecha) */}
      {showPanel && (
        <div className="h-full relative z-20">
          <PanelPersonalizacion
            theme={theme}
            onChange={setTheme}
            onClose={() => setShowPanel(false)}
            eventLink={publicLink}
            idEvento={idEvento ?? undefined}
            idFormulario="inscripcion"
          />
        </div>
      )}

      {/* Zona principal: preview del formulario */}
      <div className="flex-1 relative flex flex-col h-full min-w-0">
        {/* Botones flotantes arriba a la derecha */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowPanel((v) => !v)}
            className="h-12 w-12 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-[#5B4AE5] transition-all hover:scale-110 tooltip-container group relative"
            title="Personalizar tema"
          >
            <FiDroplet size={22} />
            <span className="absolute right-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Personalizar tema
            </span>
          </button>

          <button
            type="button"
            onClick={handlePreview}
            className="h-12 w-12 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-[#5B4AE5] transition-all hover:scale-110 group relative"
            title="Vista previa"
          >
            <FiEye size={22} />
            <span className="absolute right-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Vista previa real
            </span>
          </button>
        </div>

        {/* Contenido: preview del formulario con el tema actual */}
        <FormularioPreview theme={theme} />
      </div>
    </section>
  );
};

export default SeccionFormularioDesenglose;
