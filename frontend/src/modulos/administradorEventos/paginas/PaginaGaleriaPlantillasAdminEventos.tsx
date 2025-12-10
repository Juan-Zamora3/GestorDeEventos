import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import FilaPlantillasRapidas from "../componentes/IncioEvento/FilaPlantillasRapidas";
import TarjetaPlantillaEvento from "../componentes/IncioEvento/TarjetaPlantillaEvento";
import type { PlantillaEvento } from "../../../api/eventosAdminEventosApi";
import { obtenerPlantillasEvento } from "../../../api/eventosAdminEventosApi";

export const PaginaGaleriaPlantillasAdminEventos: React.FC = () => {
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);
  const [query, setQuery] = useState("");

  const [plantillasDb, setPlantillasDb] = useState<PlantillaEvento[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setShowPanel(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const items = await obtenerPlantillasEvento();
        setPlantillasDb(items);
      } catch (err) {
        console.error("[Galería plantillas] Error al cargar:", err);
        setPlantillasDb([]);
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, []);

  // Plantilla "Evento en blanco" fija
  const plantillaEnBlanco: PlantillaEvento = {
    id: "blank",
    nombrePlantilla: "Evento en blanco",
    tipo: "otro",
    coverUrl: "/evento-blanco.png",
    config: {
      // config mínima; el wizard la rellenará
      ajuste: {
        caracteristicas: {
          asistencia_qr: true,
          confirmacion_pago: false,
          envio_correo: true,
          asistencia_tiempos: false,
        },
        envioQR: "correo",
        costoInscripcion: "",
        tiempos: [],
      },
      participantes: {
        modo: "individual",
        maxParticipantes: "",
        maxEquipos: "",
        minIntegrantes: "1",
        maxIntegrantes: "5",
        seleccion: { asesor: false, lider_equipo: false },
        camposPorPerfil: {
          participante: [],
          asesor: [],
          integrante: [],
          lider_equipo: [],
        },
      },
    },
    createdAt: null,
    createdBy: undefined,
  };

  const todasLasPlantillas: PlantillaEvento[] = useMemo(
    () => [plantillaEnBlanco, ...plantillasDb],
    [plantillasDb],
  );

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return todasLasPlantillas;
    return todasLasPlantillas.filter((p) =>
      p.nombrePlantilla.toLowerCase().includes(q),
    );
  }, [query, todasLasPlantillas]);

  const irCrearEventoDesdePlantilla = (plantilla: PlantillaEvento) => {
    navigate("/admin-eventos/crear/informacion", {
      state: { plantillaId: plantilla.id, slideIn: true, plantillaConfig: plantilla.config },
    });
  };

  return (
    <div className="h-full flex flex-col text-white">
      <section className="bg-transparent px-14 pt-2 pb-2">
        <div className="transform-gpu transition-all duration-[900ms] ease-in-out translate-y-0 opacity-100">
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() =>
                navigate("/admin-eventos/lista", { state: { animateUp: true } })
              }
              className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center text-lg leading-none"
            >
              ←
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">
              Galería de plantillas
            </h1>
          </div>

          <div className="flex justify-center w-full">
            <FilaPlantillasRapidas size="normal" hideMas />
          </div>
        </div>
      </section>

      <section
        className={`flex-1 min-h-0 px-14 pt-6 pb-10 transform-gpu transition-all ${
          showPanel
            ? "duration-[900ms] ease-out translate-y-0 opacity-100"
            : "duration-[600ms] ease-in translate-y-6 opacity-0"
        }`}
      >
        <p className="mb-4 text-sm text-white/80">
          Explora plantillas para concursos, foros y cursos.
        </p>

        <div className="w-[430px] max-w-full bg-white/95 rounded-full px-5 py-2.5 flex items-center gap-3 text-slate-700 shadow-sm">
          <FiSearch className="text-slate-400 text-lg" />
          <input
            type="text"
            placeholder="Buscar plantillas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-none outline-none bg-transparent text-sm placeholder:text-slate-400"
          />
        </div>

        <div className="mt-8 grid gap-x-8 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-slate-900">
          {filtradas.map((p) => (
            <TarjetaPlantillaEvento
              key={p.id}
              plantilla={{
                id: p.id,
                titulo: p.nombrePlantilla,
                imagen: p.coverUrl,
              }}
              onClick={() => irCrearEventoDesdePlantilla(p)}
            />
          ))}
        </div>

        {!cargando && filtradas.length === 0 && (
          <p className="mt-6 text-center text-sm text-white/80">
            No se encontraron plantillas para “{query}”.
          </p>
        )}
      </section>
    </div>
  );
};

export default PaginaGaleriaPlantillasAdminEventos;
