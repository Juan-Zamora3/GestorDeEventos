// src/modulos/administradorEventos/paginas/PaginaListaEventosAdminEventos.tsx
import React from "react";
import {
  FiSearch,
  FiChevronDown,
  FiGrid,
  FiList,
  FiArrowDown,
} from "react-icons/fi";
import FilaPlantillasRapidas from "../componentes/FilaPlantillasRapidas";
import GridEventosAdminEventos from "../componentes/GridEventosAdminEventos";
import type { EventoCardAdminEventos } from "../componentes/tiposAdminEventos";

const eventosMock: EventoCardAdminEventos[] = [
  {
    id: "1",
    titulo: "Concurso de Robotica Junior",
    imagen: "/login-campus.png",
    fechaInicio: "12/08/2026",
    fechaFin: "20/08/2026",
    equipos: "5 Equipos",
    personas: "20 personas",
    activo: true,
  },
  {
    id: "2",
    titulo: "Concurso de Robotica Junior",
    imagen: "/Cursos.png",
    fechaInicio: "12/08/2026",
    fechaFin: "20/08/2026",
    equipos: "5 Equipos",
    personas: "20 personas",
    activo: true,
  },
  {
    id: "3",
    titulo: "Concurso de Robotica Junior",
    imagen: "/Concurso.png",
    fechaInicio: "12/08/2026",
    fechaFin: "20/08/2026",
    equipos: "5 Equipos",
    personas: "20 personas",
    activo: true,
  },
];

export const PaginaListaEventosAdminEventos: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-[#EEF0F7]">
      {/* ZONA AZUL — título + plantillas (nada de barra blanca aquí) */}
      <section className="bg-gradient-to-r from-[#192D69] to-[#6581D6] px-14 pt-10 pb-10 text-white shadow-sm">
        <h1 className="text-4xl font-bold mb-8">Crear Evento</h1>

        {/* Plantillas más grandes, alineadas a la derecha como en el diseño */}
        <div className="flex justify-end w-full">
          <FilaPlantillasRapidas size="large" />
        </div>
      </section>

      {/* BARRA BLANCA DE BUSCADOR en zona gris, tocando el borde azul */}
      <section className="px-14 -mt-6">
        <div className="bg-white w-full rounded-full px-6 py-3 shadow-sm flex items-center gap-4">
          {/* Buscador */}
          <div className="flex items-center gap-3 flex-1">
            <FiSearch className="text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Buscar evento"
              className="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Tipo */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-1.5 rounded-full"
          >
            <span>Tipo</span>
            <FiChevronDown className="text-slate-400" />
          </button>

          {/* Estado */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-1.5 rounded-full"
          >
            <span>Estado</span>
            <FiChevronDown className="text-slate-400" />
          </button>

          {/* Botones de vista y orden */}
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
              <FiGrid />
            </button>
            <button className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <FiList />
            </button>
            <button className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
              <FiArrowDown />
            </button>
          </div>
        </div>
      </section>

      {/* GRID DE EVENTOS */}
      <section className="flex-1 px-14 pt-6 pb-8">
        <GridEventosAdminEventos eventos={eventosMock} />
      </section>
    </div>
  );
};
