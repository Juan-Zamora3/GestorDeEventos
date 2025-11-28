// Componente AsidePasosCrearEvento
// Notas: muestra los pasos del wizard y resalta el actual.
import type { FC } from "react";

interface Props { pasoActual: number }

// Lista de pasos del wizard y sus descripciones
const pasos = [
  { id: 1, titulo: "Información", descripcion: "Danos los datos básicos para comenzar." },
  { id: 2, titulo: "Personal", descripcion: "Define el equipo que participa." },
  { id: 3, titulo: "Integrantes", descripcion: "Configura integrantes por rol." },
  { id: 4, titulo: "Ajuste del evento", descripcion: "Configura fechas y estructura." },
  { id: 5, titulo: "Formulario", descripcion: "Define los datos a capturar." },
];

const AsidePasosCrearEvento: FC<Props> = ({ pasoActual }) => {
  return (
    // Aside lateral con indicador visual del paso activo
    <aside className="w-80 h-full min-h-0 bg-[#F4F2FF] px-10 py-10 flex flex-col border-r border-[#E0DDFB]">
      <h2 className="text-2xl font-semibold text-slate-900 mb-10">Crear Evento</h2>
      <ol className="space-y-6 text-sm">
        {pasos.map((p, idx) => {
          const activo = p.id === pasoActual;
          const ultimo = idx === pasos.length - 1;
          return (
            <li key={p.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-1">
                {/* Badge del número de paso con estado activo/inactivo */}
                <div className={`h-8 w-8 rounded-2xl flex items-center justify-center text-sm font-semibold ${activo ? "bg-[#5B4AE5] text-white shadow-md" : "bg-white text-slate-400 border border-[#E0DDFB]"}`}>{p.id}</div>
                {!ultimo && (<div className={`w-[2px] flex-1 mt-1 ${activo ? "bg-[#D4D0F7]" : "bg-[#E5E4FA]"}`} />)}
              </div>
              <div>
                {/* Título y descripción del paso */}
                <p className={`text-xs font-semibold uppercase tracking-[0.15em] ${activo ? "text-[#5B4AE5]" : "text-slate-600"}`}>{p.titulo}</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[170px]">{p.descripcion}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {/* Acción secundaria para abortar el proceso */}
      <button type="button" className="mt-auto w-full rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white font-semibold py-3 text-sm shadow-md">Cancelar</button>
    </aside>
  );
};

export default AsidePasosCrearEvento;
