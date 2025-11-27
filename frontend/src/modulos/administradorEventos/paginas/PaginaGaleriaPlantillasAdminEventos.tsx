import React from "react";
import { FiSearch } from "react-icons/fi";
import TarjetaPlantillaEvento from "../componentes/TarjetaPlantillaEvento";
import type { PlantillaEvento } from "../componentes/tiposAdminEventos";

const plantillas: PlantillaEvento[] = [
  { id: "concurso", titulo: "Concurso", imagen: "/Concurso.png" },
  { id: "foro", titulo: "Foro", imagen: "/Foro.png" },
  { id: "cursos", titulo: "Cursos", imagen: "/Cursos.png" },
  { id: "robotica", titulo: "Robotica", imagen: "/Robotica.png" },
  { id: "hackatec", titulo: "Hackatec", imagen: "/Hackatec.png" },
  { id: "estructuras", titulo: "Estructuras", imagen: "/Estructuras.png" },
  { id: "concurso2", titulo: "Concurso", imagen: "/Concurso.png" },
  { id: "foro2", titulo: "Foro", imagen: "/Foro.png" },
];

export const PaginaGaleriaPlantillasAdminEventos: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#192D69] to-[#476AC6] text-white">
      <section className="px-16 pt-10 pb-14">
        {/* Fila superior: botón atrás + título */}
        <div className="flex items-center gap-4 mb-10">
          <button className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center text-2xl leading-none">
            ←
          </button>
          <h1 className="text-[32px] font-semibold tracking-tight">
            Galeria de plantillas
          </h1>
        </div>

        {/* Tarjeta "Evento en blanco" grande arriba a la izquierda */}
        <div className="mb-10">
          <TarjetaPlantillaEvento
            plantilla={{
              id: "blanco",
              titulo: "Evento en blanco",
              imagen: "/EventoBlanco.png",
            }}
          />
        </div>

        {/* Línea - EXPLORAR - Línea */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex-1 h-px bg-white/50" />
          <span className="text-lg font-semibold tracking-wide">Explorar</span>
          <div className="flex-1 h-px bg-white/50" />
        </div>

        {/* Buscador centrado como píldora */}
        <div className="mb-10 flex justify-start">
          <div className="w-[430px] bg-white rounded-full px-5 py-2.5 flex items-center gap-3 text-slate-700 shadow-sm">
            <FiSearch className="text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Buscar plantillas..."
              className="flex-1 border-none outline-none bg-transparent text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Grid de tarjetas de plantillas */}
        <div className="grid gap-x-8 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {plantillas.map((p) => (
            <TarjetaPlantillaEvento
              key={p.id}
              plantilla={p}
              onClick={() => console.log("Plantilla seleccionada:", p.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
