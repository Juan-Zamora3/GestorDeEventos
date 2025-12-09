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

// 🔹 Firebase
import { db } from "../../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  orderBy,
  query as fsQuery,
} from "firebase/firestore";

// 🔹 Utilidad para fechas (la que te di arriba)
import { toDisplayDate } from "../../../utils/fechasFirestore";

export const PaginaListaEventosAdminEventos: React.FC = () => {
  const [animDown, setAnimDown] = useState(false);

  // ⬇️ texto del buscador
  const [busqueda, setBusqueda] = useState<string>("");

  // 🔹 eventos vienen de Firestore
  const [eventos, setEventos] = useState<EventoCardAdminEventos[]>([]);

  const [exitingToDetalle, setExitingToDetalle] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [vista, setVista] = useState<"grid" | "lista">("grid");
  const [tipo, setTipo] = useState<
    "Todos" | NonNullable<EventoCardAdminEventos["tipo"]>
  >("Todos");
  const [estado, setEstado] = useState<"Todos" | "Activos" | "Finalizados">(
    "Todos",
  );
  const [openTipo, setOpenTipo] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);

  const opcionesTipo: (
    | "Todos"
    | NonNullable<EventoCardAdminEventos["tipo"]>
  )[] = ["Todos", "Concurso", "Curso", "Congreso", "Seminario", "Otro"];

  const navigate = useNavigate();
  const location = useLocation();

  const initialAnimateUp = Boolean(
    (location.state as { animateUp?: boolean } | null)?.animateUp,
  );
  const [showList, setShowList] = useState<boolean>(!initialAnimateUp);

  // 🔹 Escuchar eventos desde Firestore
  useEffect(() => {
    const colRef = collection(db, "eventos");

    // ⬇️ campo anidado donde guardaste la fecha
    const q = fsQuery(
      colRef,
      orderBy("config.infoEvento.fechaInicioEvento", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: EventoCardAdminEventos[] = snap.docs.map((d) => {
          const data = d.data() as any;

          // infoEvento suele venir dentro de config
          const info = data.config?.infoEvento ?? data.infoEvento ?? {};

          const titulo: string =
            info.nombre ??
            data.nombre ??
            data.nombre_evento ??
            "Evento sin nombre";

          const fechaInicio = toDisplayDate(
            info.fechaInicioEvento ??
              data.fechaInicioEvento ??
              data.fecha_inicio_evento,
          );

          const fechaFin = toDisplayDate(
            info.fechaFinEvento ??
              data.fechaFinEvento ??
              data.fecha_fin_evento,
          );

          const tipoEvento =
            (data.tipoEvento ?? info.tipoEvento ?? data.tipo) as
              | EventoCardAdminEventos["tipo"]
              | undefined;

          const imagen: string =
            info.imagenPortadaUrl ??
            data.imagenPortadaUrl ??
            data.imagen ??
            "/login-campus.png";

          const equiposCount: number | undefined =
            data.totalEquipos ?? data.numEquipos ?? info.totalEquipos;
          const personasCount: number | undefined =
            data.totalParticipantes ??
            data.numParticipantes ??
            info.totalParticipantes;

          const equipos =
            typeof equiposCount === "number"
              ? `${equiposCount} equipo${equiposCount === 1 ? "" : "s"}`
              : "—";

          const personas =
            typeof personasCount === "number"
              ? `${personasCount} persona${
                  personasCount === 1 ? "" : "s"
                }`
              : "—";

          const activo: boolean =
            typeof data.activo === "boolean" ? data.activo : true;

          return {
            id: d.id,
            titulo,
            imagen,
            tipo: tipoEvento,
            fechaInicio,
            fechaFin,
            equipos,
            personas,
            activo,
          };
        });

        setEventos(items);
      },
      (err) => {
        console.error("[PaginaListaEventosAdminEventos] Error Firestore:", err);
        setEventos([]);
      },
    );

    return () => unsub();
  }, []);

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
    setAnimDown(true);
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

  // 🔎 eventos filtrados (buscador + tipo + estado)
  const eventosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return eventos.filter((e) => {
      const titulo = e.titulo.toLowerCase();
      const fechaInicio = e.fechaInicio?.toLowerCase?.() ?? "";
      const fechaFin = e.fechaFin?.toLowerCase?.() ?? "";
      const equipos = e.equipos?.toLowerCase?.() ?? "";
      const personas = e.personas?.toLowerCase?.() ?? "";

      const byQuery =
        !q ||
        [titulo, fechaInicio, fechaFin, equipos, personas].some((v) =>
          v.includes(q),
        );

      const byTipo = tipo === "Todos" || e.tipo === tipo;

      const byEstado =
        estado === "Todos"
          ? true
          : estado === "Activos"
          ? e.activo
          : !e.activo;

      return byQuery && byTipo && byEstado;
    });
  }, [eventos, busqueda, tipo, estado]);

  return (
    <motion.div
      layout
      className="h-full flex flex-col"
      initial={initialAnimateUp ? { y: 24, opacity: 0, scale: 0.98 } : {}}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.28, 1],
        layout: { duration: 0.7, ease: [0.22, 1, 0.28, 1] },
      }}
    >
      <AnimatePresence mode="wait">
        {!exitingToDetalle && (
          <motion.section
            layout
            className={`bg-transparent px-14 text-white ${
              expanded ? "h-0 overflow-hidden py-0" : "pt-2 pb-2"
            }`}
            initial={false}
            animate={{ opacity: expanded ? 0 : 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{
              layout: {
                duration: 0.7,
                ease: [0.22, 1, 0.28, 1],
              },
              opacity: { duration: 0.3 },
            }}
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
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.28, 1],
              layout: { duration: 0.7, ease: [0.22, 1, 0.28, 1] },
            }}
            className={`flex-1 min-h-0 transform-gpu ${
              animDown
                ? "opacity-0"
                : showList || expanded
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            <div
              className={`h-full bg-[#EEF0F7] ${
                expanded ? "rounded-t-3xl" : "rounded-t-none"
              } flex flex-col`}
            >
              <section className="px-14 pt-5">
                <div className="bg-white w-full rounded-full px-6 py-3 shadow-sm flex items-center gap-4">
                  {/* Buscador */}
                  <div className="flex items-center gap-3 flex-1">
                    <FiSearch className="text-slate-400 text-lg" />
                    <input
                      type="text"
                      placeholder="Buscar evento (nombre, fecha, equipos...)"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* Tipo */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenTipo((v) => !v)}
                      className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-1.5 rounded-full"
                    >
                      <span>{tipo === "Todos" ? "Tipo" : tipo}</span>
                      <FiChevronDown className="text-slate-400" />
                    </button>
                    {openTipo && (
                      <div className="absolute z-10 mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-sm">
                        {opcionesTipo.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setTipo(t);
                              setOpenTipo(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-[11px] font-semibold ${
                              tipo === t
                                ? "text-[#356BFF]"
                                : "text-slate-700"
                            } hover:bg-slate-50`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenEstado((v) => !v)}
                      className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-1.5 rounded-full"
                    >
                      <span>{estado === "Todos" ? "Estado" : estado}</span>
                      <FiChevronDown className="text-slate-400" />
                    </button>
                    {openEstado && (
                      <div className="absolute z-10 mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-sm">
                        {(["Todos", "Activos", "Finalizados"] as const).map(
                          (e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => {
                                setEstado(e);
                                setOpenEstado(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-[11px] font-semibold ${
                                estado === e
                                  ? "text-[#356BFF]"
                                  : "text-slate-700"
                              } hover:bg-slate-50`}
                            >
                              {e}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* Botones de vista y orden */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVista("grid")}
                      className={`h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center ${
                        vista === "grid"
                          ? "text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
                      <FiGrid />
                    </button>
                    <button
                      type="button"
                      onClick={() => setVista("lista")}
                      className={`h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center ${
                        vista === "lista"
                          ? "text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
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
                  {vista === "grid" ? (
                    <GridEventosAdminEventos
                      eventos={eventosFiltrados}
                      stagger={initialAnimateUp}
                      onEventoClick={irDetalleConTransicion}
                    />
                  ) : (
                    <div className="space-y-4">
                      {eventosFiltrados.map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => irDetalleConTransicion(e.id)}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {e.titulo}
                            </p>
                            <p className="text-[11px] text-slate-600">
                              {e.fechaInicio} - {e.fechaFin}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {e.equipos} · {e.personas}
                            </p>
                          </div>
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              e.activo ? "bg-emerald-400" : "bg-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {eventosFiltrados.length === 0 && (
                    <p className="mt-6 text-center text-sm text-slate-500">
                      {eventos.length === 0
                        ? "Aún no hay eventos registrados."
                        : `No se encontraron eventos para “${busqueda}”.`}
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
