// src/modulos/administradorEventos/componentes/GridEventosAdminEventos.tsx
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import type { EventoCardAdminEventos } from "./tiposAdminEventos";

interface Props {
  eventos: EventoCardAdminEventos[];
}

const GridEventosAdminEventos: FC<Props> = ({ eventos }) => {
  const navigate = useNavigate();

  if (eventos.length === 0) {
    return (
      <p className="text-sm text-slate-500 mt-4">
        No hay eventos registrados.
      </p>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {eventos.map((e) => (
        <button
          key={e.id}
          type="button"
          onClick={() => navigate(`/admin-eventos/evento/${e.id}`)}
          className="text-left bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow p-4"
        >
          <div className="h-32 rounded-2xl overflow-hidden mb-3 bg-slate-100">
            <img
              src={e.imagen}
              alt={e.titulo}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            {e.titulo}
          </h3>
          <p className="text-xs text-slate-500 mb-1">
            {e.fechaInicio} — {e.fechaFin}
          </p>
          <p className="text-[11px] text-slate-400">
            {e.equipos} · {e.personas}
          </p>
        </button>
      ))}
    </div>
  );
};

export default GridEventosAdminEventos;
