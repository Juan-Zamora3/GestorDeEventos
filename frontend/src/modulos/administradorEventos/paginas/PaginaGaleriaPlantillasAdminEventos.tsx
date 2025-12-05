import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import TarjetaPlantillaEvento from "../componentes/IncioEvento/TarjetaPlantillaEvento";
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
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return plantillas;
    return plantillas.filter((p) => p.titulo.toLowerCase().includes(q));
  }, [query]);
  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 150);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#192D69] to-[#476AC6] text-white">
      <section className="px-16 pt-10 pb-14">
        <div className={`transform-gpu transition-all duration-[2200ms] ease-in-out ${show ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}>
        {/* Fila superior: botón atrás + título */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate("/admin-eventos/lista", { state: { animateUp: true } })} className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center text-2xl leading-none">
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
            size="large"
            onClick={() => navigate("/admin-eventos/crear")}
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
              value={query}
              onChange={(e)=> setQuery(e.target.value)}
              className="flex-1 border-none outline-none bg-transparent text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Grid de tarjetas de plantillas */}
        <div className="grid gap-x-8 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtradas.map((p) => (
            <TarjetaPlantillaEvento
              key={p.id}
              plantilla={p}
              onClick={() => navigate("/admin-eventos/crear")}
            />
          ))}
        </div>
        </div>
      </section>
    </div>
  );
};
