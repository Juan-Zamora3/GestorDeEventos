import React from "react";
import GridEventosAdmin from "../componentes/GridEventosAdmin";
import type { EventoCard } from "../componentes/tiposAdminGeneral";
import { FiSearch, FiChevronDown, FiGrid, FiList } from "react-icons/fi";

const eventosDummy: EventoCard[] = [
  {
    id: 1,
    titulo: "Concurso de Robótica Junior",
    fechaInicio: "12/08/2026",
    fechaFin: "20/08/2026",
    equipos: "5 equipos",
    personas: "20 personas",
    imagen: "/login-campus.png",
    activo: true,
  },
  {
    id: 2,
    titulo: "Concurso de Robótica Junior",
    fechaInicio: "12/08/2026",
    fechaFin: "20/08/2026",
    equipos: "5 equipos",
    personas: "20 personas",
    imagen: "/login-campus.png",
    activo: true,
  },
  {
    id: 3,
    titulo: "Concurso de Robótica Junior",
    fechaInicio: "12/08/2026",
    fechaFin: "20/08/2026",
    equipos: "5 equipos",
    personas: "20 personas",
    imagen: "/login-campus.png",
    activo: true,
  },
  // agrega más si quieres
];

export const PaginaAuditoriaAdminGeneral: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Barra de filtros como en Figma */}
      <section className="flex flex-wrap items-center gap-4 mb-6">
        {/* Buscar evento */}
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm">
            <FiSearch className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar evento"
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Filtro Tipo */}
        <button className="inline-flex items-center justify-between gap-2 bg-white rounded-full px-4 py-2 text-sm text-slate-700 shadow-sm">
          <span>Tipo</span>
          <FiChevronDown className="text-slate-400" />
        </button>

        {/* Filtro Estado */}
        <button className="inline-flex items-center justify-between gap-2 bg-white rounded-full px-4 py-2 text-sm text-slate-700 shadow-sm">
          <span>Estado</span>
          <FiChevronDown className="text-slate-400" />
        </button>

        {/* Vista (grid/lista) */}
        <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-sm">
          <button className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <FiGrid />
          </button>
          <button className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
            <FiList />
          </button>
        </div>
      </section>

      {/* Grid de eventos */}
      <GridEventosAdmin eventos={eventosDummy} />
    </div>
  );
};
