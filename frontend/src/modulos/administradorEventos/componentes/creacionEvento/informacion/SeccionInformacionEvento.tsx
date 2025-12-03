// Sección Información del Evento (wizard crear evento)
// Notas: encapsula campos básicos y navega al siguiente paso usando rutas.
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import FooterAdminEventos from "../../comunes/FooterAdminEventos";

const SeccionInformacionEvento: FC = () => {
  const navigate = useNavigate();
  return (
    // Contenedor principal con header fijo, contenido con scroll y footer fijo
    <section className="flex-1 h-full min-h-0 flex flex-col">
      <div className="px-10 pt-10">
        <h1 className="text-2xl font-semibold text-slate-900">Información del Evento</h1>
      </div>
      {/* Dropzone informativa para la imagen del evento */}
      <div className="flex-1 min-h-0 overflow-y-auto px-10 pb-6">
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-700 mb-2">Foto del Evento</p>
        <div className="border border-dashed border-[#D0D5FF] rounded-2xl h-40 flex flex-col items-center justify-center text-center text-xs text-slate-500 bg-[#F7F7FF]">
          <div className="mb-2 text-3xl">🖼️</div>
          <p className="mb-1"><span className="text-[#5B4AE5] font-semibold">Sube un archivo</span> o arrástralo aquí</p>
          <p className="text-[11px] text-slate-400">PNG, JPG o GIF hasta 10MB</p>
        </div>
      </div>
      {/* Inputs principales de información y fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Nombre del evento<span className="text-red-500">*</span></label>
          <input type="text" placeholder="Exp. InnovaTECNM 2026" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Fecha de Finalización del Evento<span className="text-red-500">*</span></label>
          <input type="text" placeholder="dd/mm/aaaa" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Fecha de inicio de Inscripciones<span className="text-red-500">*</span></label>
          <input type="text" placeholder="dd/mm/aaaa" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Fecha de fin de Inscripciones<span className="text-red-500">*</span></label>
          <input type="text" placeholder="dd/mm/aaaa" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
        </div>
      </div>
      {/* Descripción extendida del evento */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-700">Descripción<span className="text-red-500">*</span></label>
        <textarea rows={4} placeholder="Descripción del evento e información general." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] resize-none focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
      </div>
      </div>
      <FooterAdminEventos onNext={() => navigate("../personal")} step={{ current: 1, total: 5 }} />
    </section>
  );
};

export default SeccionInformacionEvento;
