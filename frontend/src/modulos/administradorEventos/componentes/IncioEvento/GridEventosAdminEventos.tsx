// src/modulos/administradorEventos/componentes/GridEventosAdminEventos.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { EventoCardAdminEventos } from "../tiposAdminEventos";

interface Props {
  eventos: EventoCardAdminEventos[];
  stagger?: boolean;
  onEventoClick?: (id: string) => void;
}

const GridEventosAdminEventos: React.FC<Props> = ({ eventos, stagger = false, onEventoClick }) => {
  const navigate = useNavigate();
  const [entered, setEntered] = React.useState<boolean>(!stagger);
  React.useEffect(() => {
    if (stagger) {
      const t = window.setTimeout(() => setEntered(true), 20);
      return () => window.clearTimeout(t);
    }
  }, [stagger]);
  return (
    <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 h-full">
      {eventos.map((evento, idx) => (
        <article
          key={evento.id}
          className={`bg-white rounded-3xl overflow-hidden cursor-pointer relative transform-gpu transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg ${stagger ? (entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8") : ""}`}
          style={{ aspectRatio: "4 / 3", ...(stagger ? { transitionDelay: `${idx * 120}ms` } : {}) }}
          onClick={() => (onEventoClick ? onEventoClick(evento.id) : navigate(`/admin-eventos/evento/${evento.id}`))}
        >
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-[2] basis-2/3 w-full overflow-hidden">
              <img src={evento.imagen} alt={evento.titulo} className="w-full h-full object-cover" />
            </div>
            <div className="flex-[1] basis-1/3 px-4 pt-2 pb-3 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-800 leading-snug">{evento.titulo}</h3>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>{evento.fechaInicio}</span>
                <span>{evento.fechaFin}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>{evento.equipos}</span>
                <span>{evento.personas}</span>
              </div>
              <div className="mt-auto flex items-center justify-end">
                <span className={`h-3 w-3 rounded-full ${evento.activo ? "bg-emerald-400" : "bg-slate-300"}`} />
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};

export default GridEventosAdminEventos;
