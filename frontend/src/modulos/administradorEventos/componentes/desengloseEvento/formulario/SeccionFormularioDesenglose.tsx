import type { FC } from "react";
import { FiLock, FiCheckSquare, FiCalendar, FiType, FiHash, FiMail, FiPhone, FiAlignLeft } from "react-icons/fi";

// Tipos reutilizados (idealmente importar, pero definidos aquí para el mock)
type TipoCampo =
  | "texto_corto"
  | "texto_largo"
  | "email"
  | "telefono"
  | "seleccion_simple"
  | "seleccion_multiple"
  | "numero"
  | "fecha";

interface PreguntaView {
  id: string;
  nombre: string;
  tipo: TipoCampo;
  placeholder?: string;
  obligatorio: boolean;
  config?: { opciones?: string[] };
  source?: "manual" | "participantes";
  tipoLabel?: string;
}

// Mock data simulando un evento configurado en modo "Equipos"
const mockPreguntas: PreguntaView[] = [
  // Auto-generados (Participantes)
  { id: "auto-equipo", nombre: "Nombre del Equipo", tipo: "texto_corto", tipoLabel: "Equipo", placeholder: "ej. Astros", obligatorio: true, source: "participantes" },
  { id: "auto-lider-nombre", nombre: "Líder: Nombre Completo", tipo: "texto_corto", tipoLabel: "Líder", placeholder: "Nombre del líder", obligatorio: true, source: "participantes" },
  { id: "auto-lider-correo", nombre: "Líder: Correo", tipo: "email", tipoLabel: "Líder", placeholder: "correo@lider.com", obligatorio: true, source: "participantes" },
  { id: "auto-int-1", nombre: "Integrante 1: Nombre", tipo: "texto_corto", tipoLabel: "Integrante", placeholder: "Nombre completo", obligatorio: true, source: "participantes" },
  { id: "auto-int-2", nombre: "Integrante 2: Nombre", tipo: "texto_corto", tipoLabel: "Integrante", placeholder: "Nombre completo", obligatorio: true, source: "participantes" },
  { id: "auto-int-3", nombre: "Integrante 3: Nombre", tipo: "texto_corto", tipoLabel: "Integrante", placeholder: "Nombre completo", obligatorio: false, source: "participantes" },
  // Manuales (Formulario)
  { id: "manual-robot", nombre: "Nombre del Robot", tipo: "texto_corto", placeholder: "ej. Wall-E", obligatorio: true, source: "manual" },
  { id: "manual-cat", nombre: "Categoría de peso", tipo: "seleccion_simple", placeholder: "Selecciona una", obligatorio: true, source: "manual", config: { opciones: ["Ligero (3kg)", "Medio (10kg)", "Pesado (Libre)"] } },
  { id: "manual-desc", nombre: "Descripción técnica", tipo: "texto_largo", placeholder: "Breve descripción del funcionamiento...", obligatorio: false, source: "manual" },
  { id: "manual-fecha", nombre: "Fecha de llegada estimada", tipo: "fecha", placeholder: "dd/mm/aaaa", obligatorio: false, source: "manual" },
];

const IconoTipo = ({ tipo }: { tipo: TipoCampo }) => {
  switch (tipo) {
    case "texto_corto": return <FiType className="text-slate-400" />;
    case "texto_largo": return <FiAlignLeft className="text-slate-400" />;
    case "email": return <FiMail className="text-slate-400" />;
    case "telefono": return <FiPhone className="text-slate-400" />;
    case "numero": return <FiHash className="text-slate-400" />;
    case "fecha": return <FiCalendar className="text-slate-400" />;
    case "seleccion_simple":
    case "seleccion_multiple": return <FiCheckSquare className="text-slate-400" />;
    default: return <FiType className="text-slate-400" />;
  }
};

const SeccionFormularioDesenglose: FC = () => {
  return (
    <section className="flex-1 h-full min-h-0 overflow-y-auto bg-[#F0F2F5] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-4">
        
        {/* Header del Formulario */}
        <div className="bg-white rounded-xl shadow-sm border-t-[10px] border-t-[#5B4AE5] overflow-hidden">
          <div className="px-6 py-5">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Concurso de Robótica 2025</h1>
            <p className="text-sm text-slate-600">Formulario de inscripción para equipos participantes. Por favor complete todos los campos obligatorios.</p>
          </div>
          <div className="px-6 py-2 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
             <span className="text-xs text-slate-500 font-medium">correo@usuario.com <span className="text-slate-400">(no compartido)</span></span>
             <span className="text-xs text-[#5B4AE5] font-medium cursor-pointer">Cambiar cuenta</span>
          </div>
        </div>

        {/* Lista de Preguntas */}
        {mockPreguntas.map((p) => (
          <div key={p.id} className={`bg-white rounded-xl shadow-sm border border-transparent px-6 py-6 transition-all hover:shadow-md ${p.source === "participantes" ? "border-l-4 border-l-slate-300" : ""}`}>
            <div className="mb-3">
              <div className="flex justify-between items-start gap-4">
                <label className="text-base font-medium text-slate-800 block">
                  {p.nombre}
                  {p.obligatorio && <span className="text-rose-500 ml-1">*</span>}
                </label>
                {p.source === "participantes" && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500" title="Campo configurado en sección Participantes">
                    <FiLock size={10} />
                    <span>{p.tipoLabel ?? "Auto"}</span>
                  </div>
                )}
              </div>
              {p.placeholder && <p className="text-xs text-slate-400 mt-0.5">{p.placeholder}</p>}
            </div>

            <div className="mt-3">
              {/* Renderizado visual según tipo */}
              {(p.tipo === "texto_corto" || p.tipo === "email" || p.tipo === "telefono" || p.tipo === "numero") && (
                <div className="border-b border-slate-200 py-1 w-full md:w-1/2 focus-within:border-[#5B4AE5] focus-within:bg-slate-50 transition-colors flex items-center gap-2">
                  <IconoTipo tipo={p.tipo} />
                  <input disabled className="bg-transparent w-full text-sm text-slate-600 outline-none placeholder:text-slate-300" placeholder="Tu respuesta" />
                </div>
              )}

              {p.tipo === "texto_largo" && (
                <div className="border-b border-slate-200 py-1 w-full focus-within:border-[#5B4AE5] focus-within:bg-slate-50 transition-colors flex items-start gap-2">
                   <IconoTipo tipo={p.tipo} />
                   <textarea disabled className="bg-transparent w-full text-sm text-slate-600 outline-none resize-none placeholder:text-slate-300" rows={1} placeholder="Tu respuesta" />
                </div>
              )}

              {p.tipo === "fecha" && (
                 <div className="inline-flex items-center gap-3 border-b border-slate-200 py-1 focus-within:border-[#5B4AE5]">
                    <input type="date" disabled className="bg-transparent text-sm text-slate-400 outline-none" />
                    <FiCalendar className="text-slate-400" />
                 </div>
              )}

              {(p.tipo === "seleccion_simple" || p.tipo === "seleccion_multiple") && (
                <div className="space-y-2 mt-2">
                  {p.config?.opciones?.map((op, idx) => (
                    <div key={idx} className="flex items-center gap-2 opacity-70">
                      <div className={`h-4 w-4 border border-slate-400 ${p.tipo === "seleccion_simple" ? "rounded-full" : "rounded"}`} />
                      <span className="text-sm text-slate-700">{op}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Footer simulado */}
        <div className="flex justify-between items-center pt-4 px-2 pb-8">
           <div className="h-2 rounded bg-[#5B4AE5] w-full max-w-[100px]" />
           <button disabled className="px-6 py-2 rounded bg-[#5B4AE5] text-white font-semibold text-sm opacity-50 cursor-not-allowed">Enviar</button>
           <p className="text-xs text-slate-400">Nunca envíes contraseñas a través de Formularios.</p>
        </div>

      </div>
    </section>
  );
};

export default SeccionFormularioDesenglose;
