// src/modulos/administradorEventos/paginas/PaginaListaEventosAdminEventos.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiChevronDown,
  FiGrid,
  FiList,
  FiArrowDown,
  FiArrowUp,
} from "react-icons/fi";
import FilaPlantillasRapidas from "../componentes/IncioEvento/FilaPlantillasRapidas";
import GridEventosAdminEventos from "../componentes/IncioEvento/GridEventosAdminEventos";
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
  const [animDown, setAnimDown] = useState(false);
  const [query, setQuery] = useState<string>("");
  const [eventos] = useState<EventoCardAdminEventos[]>(eventosMock);
  const [exitingToDetalle, setExitingToDetalle] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const initialAnimateUp = Boolean(
    (location.state as { animateUp?: boolean } | null)?.animateUp,
  );
  const [showList, setShowList] = useState<boolean>(!initialAnimateUp);

  useEffect(() => {
    const animateUp = Boolean(
      (location.state as { animateUp?: boolean } | null)?.animateUp,
    );
    if (animateUp) {
      const t = window.setTimeout(() => setShowList(true), 80);
      return () => {
        window.clearTimeout(t);
      };
    }
  }, [location.state]);

  const irGaleriaConTransicion = () => {
    setAnimDown(true); // baja el cuadro gris
    window.setTimeout(() => {
      navigate("/admin-eventos/plantillas", { state: { fromLista: true } });
    }, 650);
  };

  const irDetalleConTransicion = (id: string) => {
    setExitingToDetalle(true);
    window.setTimeout(() => {
      navigate(`/admin-eventos/evento/${id}`);
    }, 650);
  };

  // 🔎 eventos filtrados por el buscador
  const eventosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eventos;

    return eventos.filter((e) => {
      const titulo = e.titulo.toLowerCase();
      const fechaInicio = e.fechaInicio?.toLowerCase?.() ?? "";
      const fechaFin = e.fechaFin?.toLowerCase?.() ?? "";
      const equipos = e.equipos?.toLowerCase?.() ?? "";
      const personas = e.personas?.toLowerCase?.() ?? "";

      return (
        titulo.includes(q) ||
        fechaInicio.includes(q) ||
        fechaFin.includes(q) ||
        equipos.includes(q) ||
        personas.includes(q)
      );
    });
  }, [eventos, query]);

  return (
    <motion.div
      layout
      className="h-full flex flex-col"
      initial={initialAnimateUp ? { y: 24, opacity: 0, scale: 0.98 } : {}}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.28, 1], layout: { duration: 0.7, ease: [0.22, 1, 0.28, 1] } }}
    >
      <AnimatePresence mode="wait">
        {!exitingToDetalle && (
          <motion.section
            layout
            className={`bg-transparent px-14 text-white ${expanded ? "h-0 overflow-hidden py-0" : "pt-2 pb-2"}`}
            initial={false}
            animate={{ opacity: expanded ? 0 : 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ layout: { duration: 0.7, ease: [0.22, 1, 0.28, 1] }, opacity: { duration: 0.3 } }}
            style={{ overflow: "hidden" }}
          >
            <div className="transform-gpu duration-[900ms] ease-in-out translate-y-0 opacity-100">
              <h1 className="text-2xl font-bold mb-6">Crear Evento</h1>
              <div className="flex justify-center w-full">
                <FilaPlantillasRapidas
                  size="normal"
                  onMasClick={irGaleriaConTransicion}
                  hideMas={animDown}
                />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* PANEL GRIS con buscador + grid */}
      <AnimatePresence mode="wait">
        {!(exitingToDetalle || animDown) && (
          <motion.div
            key="panel-gris"
            layout
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.28, 1], layout: { duration: 0.7, ease: [0.22, 1, 0.28, 1] } }}
            className={`flex-1 min-h-0 transform-gpu ${
              animDown
                ? "opacity-0"
                : showList || expanded
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
          <div className={`h-full bg-[#EEF0F7] ${expanded ? "rounded-t-3xl" : "rounded-t-none"} flex flex-col`}>
            <section className="px-14 pt-5">
              <div className="bg-white w-full rounded-full px-6 py-3 shadow-sm flex items-center gap-4">
              {/* Buscador */}
              <div className="flex items-center gap-3 flex-1">
                <FiSearch className="text-slate-400 text-lg" />
                <input
                  type="text"
                  placeholder="Buscar evento (nombre, fecha, equipos...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-300"
                  aria-label={expanded ? "Contraer" : "Expandir"}
                >
                  {expanded ? <FiArrowDown /> : <FiArrowUp />}
                </button>
              </div>
            </div>
          </section>

          <section className="px-14 pt-6 pb-8 flex-1 min-h-0">
            <div className="bg-white rounded-3xl px-6 py-4 h-full overflow-auto">
              <GridEventosAdminEventos
                eventos={eventosFiltrados}
                stagger={initialAnimateUp}
                onEventoClick={irDetalleConTransicion}
              />
              {eventosFiltrados.length === 0 && (
                <p className="mt-6 text-center text-sm text-slate-500">
                  No se encontraron eventos para “{query}”.
                </p>
              )}
            </div>
          </section>
        </div>
          </motion.div>
        )}
      </AnimatePresence>
  </motion.div>
  );
};

export default PaginaListaEventosAdminEventos;
