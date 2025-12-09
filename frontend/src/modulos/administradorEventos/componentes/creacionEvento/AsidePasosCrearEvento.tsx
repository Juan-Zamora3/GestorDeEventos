// src/modulos/administradorEventos/componentes/creacionEvento/AsidePasosCrearEvento.tsx

import type { FC } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  pasoActual: number;
  onCancel?: () => void;
}

const pasos = [
  {
    id: 1,
    titulo: "Información",
    descripcion: "Danos los datos básicos para comenzar.",
  },
  {
    id: 2,
    titulo: "Personal",
    descripcion: "Define el equipo que participa.",
  },
  {
    id: 3,
    titulo: "Integrantes",
    descripcion: "Configura integrantes por rol.",
  },
  {
    id: 4,
    titulo: "Ajuste del evento",
    descripcion: "Configura fechas y estructura.",
  },
  {
    id: 5,
    titulo: "Formulario",
    descripcion: "Define los datos a capturar.",
  },
];

const AsidePasosCrearEvento: FC<Props> = ({ pasoActual, onCancel }) => {
  const navigate = useNavigate();

  return (
    <aside className="w-80 h-full min-h-0 bg-[#F4F2FF] px-10 py-10 flex flex-col border-r border-[#E0DDFB]">
      <h2 className="text-2xl font-semibold text-slate-900 mb-10">
        Crear Evento
      </h2>
      <ol className="space-y-1 text-sm">
        {pasos.map((p, idx) => {
          const estado =
            p.id < pasoActual
              ? "done"
              : p.id === pasoActual
              ? "current"
              : "todo";

          const seleccionado = estado !== "todo";
          const esPrevio = p.id === pasoActual - 1;
          const esActual = p.id === pasoActual;
          const ultimo = idx === pasos.length - 1;

          return (
            <li key={p.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-1">
                <div
                  className={`h-8 w-8 rounded-2xl flex items-center justify-center text-sm font-semibold transition-all duration-200 ease-out ${
                    seleccionado
                      ? "bg-[#5B4AE5] text-white shadow-md"
                      : "bg-white text-slate-400 border border-[#E0DDFB]"
                  } ${esActual ? "scale-105 ring-1 ring-[#8B7BED]/40" : "scale-100"}`}
                >
                  {p.id}
                </div>
                {!ultimo && (
                  <div className="relative w-[2px] h-10 mt-1 rounded-full bg-[#E5E4FA] overflow-hidden">
                    <span
                      className={`absolute left-0 top-0 w-full rounded-full transition-all duration-300 ease-out ${
                        estado === "done"
                          ? "bg-[#5B4AE5]"
                          : estado === "current"
                          ? "bg-[#8B7BED]"
                          : "bg-transparent"
                      }`}
                      style={{
                        height:
                          estado === "done"
                            ? "100%"
                            : estado === "current"
                            ? "50%"
                            : "0%",
                        transitionDelay: esPrevio
                          ? "0ms"
                          : esActual
                          ? "160ms"
                          : "0ms",
                        transitionDuration: esPrevio
                          ? "240ms"
                          : esActual
                          ? "260ms"
                          : "240ms",
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200 ${
                    seleccionado ? "text-[#5B4AE5]" : "text-slate-600"
                  }`}
                >
                  {p.titulo}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[170px]">
                  {p.descripcion}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={() =>
          onCancel ? onCancel() : navigate("/admin-eventos/lista")
        }
        className="mt-auto w-full rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white font-semibold py-3 text-sm shadow-md"
      >
        Cancelar
      </button>
    </aside>
  );
};

export default AsidePasosCrearEvento;
