import React, { useState } from "react";
import { FiDroplet, FiEye } from "react-icons/fi";
import FormularioPreview from "./components/FormularioPreview";
import PanelPersonalizacion from "./components/PanelPersonalizacion";
import { DEFAULT_THEME } from "./components/types";
import type { FormTheme } from "./components/types";
import { useParams } from "react-router-dom";

const SeccionFormularioDesenglose: React.FC = () => {
  const [theme, setTheme] = useState<FormTheme>(DEFAULT_THEME);
  const [showPanel, setShowPanel] = useState(false);
  const { id } = useParams();

  const eventId = id ?? "sin-id";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const previewUrl = `${origin}/formulario/preview/${eventId}`;
  const publicUrl = `${origin}/formulario/${eventId}`;

  const handlePreview = () => {
    localStorage.setItem(`formTheme:${eventId}`, JSON.stringify(theme));
    window.open(previewUrl, "_blank");
  };

  return (
    <section className="relative flex h-full w-full overflow-hidden bg-[#F0F2F5]">

      {/* Left Sidebar (Customization) */}
      {showPanel && (
        <div className="h-full relative z-20">
           <PanelPersonalizacion 
              theme={theme} 
              onChange={setTheme} 
              onClose={() => setShowPanel(false)} 
              eventLink={publicUrl}
           />
        </div>
      )}

      {/* Main Preview Area */}
      <div className="flex-1 relative flex flex-col h-full min-w-0">
        
        {/* Toolbar Floating Actions (Top Right) */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="h-12 w-12 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-[#5B4AE5] transition-all hover:scale-110 tooltip-container group"
            title="Personalizar tema"
          >
            <FiDroplet size={22} />
            <span className="absolute right-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Personalizar tema
            </span>
          </button>

          <button
            onClick={handlePreview}
            className="h-12 w-12 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-[#5B4AE5] transition-all hover:scale-110 group"
            title="Vista previa"
          >
            <FiEye size={22} />
             <span className="absolute right-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Vista previa real
            </span>
          </button>
        </div>

        {/* Content */}
        <FormularioPreview theme={theme} />
      </div>

    </section>
  );
};

export default SeccionFormularioDesenglose;
