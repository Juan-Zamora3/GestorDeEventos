// src/modulos/administradorEventos/componentes/GridEventosAdminEventos.tsx
import React from "react";
import type { EventoCardAdminEventos } from "./tiposAdminEventos";

interface Props {
  eventos: EventoCardAdminEventos[];
}

const GridEventosAdminEventos: React.FC<Props> = ({ eventos }) => {
  return (
    <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {eventos.map((evento) => (
        <article
          key={evento.id}
          className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer flex flex-col"
        >
          {/* Imagen */}
          <div className="h-40 w-full overflow-hidden">
            <img
              src={evento.imagen}
              alt={evento.titulo}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Información */}
          <div className="px-4 pt-3 pb-4 flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-800 mb-1 leading-snug">
              {evento.titulo}
            </h3>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>{evento.fechaInicio}</span>
              <span>{evento.fechaFin}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{evento.equipos}</span>
              <span>{evento.personas}</span>
            </div>

            {/* Estado */}
            <div className="mt-3 flex items-center justify-end">
              <span
                className={`h-3 w-3 rounded-full ${
                  evento.activo ? "bg-emerald-400" : "bg-slate-300"
                }`}
              />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};

export default GridEventosAdminEventos;
