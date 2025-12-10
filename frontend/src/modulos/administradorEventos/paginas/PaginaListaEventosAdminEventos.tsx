// src/modulos/administradorEventos/paginas/PaginaListaEventosAdminEventos.tsx
import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiGrid,
  FiList,
  FiArrowDown,
} from "react-icons/fi";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import FilaPlantillasRapidas from "../componentes/FilaPlantillasRapidas";
import GridEventosAdminEventos from "../componentes/GridEventosAdminEventos";
import type { EventoCardAdminEventos } from "../componentes/tiposAdminEventos";

export const PaginaListaEventosAdminEventos: React.FC = () => {
  const [eventos, setEventos] = useState<EventoCardAdminEventos[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const snap = await getDocs(collection(db, "eventos"));
        const lista: EventoCardAdminEventos[] = snap.docs.map((doc) => {
          const data = doc.data() as any;
          const info = data.informacion ?? {};
          const part = data.participantes ?? {};

          const max = part.maxParticipantes as number | null | undefined;

          return {
            id: doc.id,
            titulo: info.nombreEvento ?? "Evento sin título",
            imagen: "/EventoBlanco.png",
            fechaInicio: info.fechaInicioEvento ?? "",
            fechaFin: info.fechaFinEvento ?? "",
            equipos:
              part.modalidadRegistro === "equipos"
                ? "Por equipos"
                : "Individual",
            personas: max ? `${max} lugares` : "",
            activo: true,
          };
        });

        setEventos(lista);
      } catch (e) {
        console.error("Error al cargar eventos:", e);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const filtrados = eventos.filter((e) =>
    e.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#EEF0F7]">
      {/* ZONA AZUL — título + plantillas */}
      <section className="bg-gradient-to-r from-[#192D69] to-[#6581D6] px-14 pt-10 pb-10 text-white shadow-sm">
        <h1 className="text-4xl font-bold mb-8">Crear Evento</h1>

        <div className="flex justify-end w-full">
          <FilaPlantillasRapidas size="large" />
        </div>
      </section>

      {/* BARRA BLANCA DE BUSCADOR */}
      <section className="px-14 -mt-6">
        <div className="bg-white w-full rounded-full px-6 py-3 shadow-sm flex items-center gap-4">
          {/* Buscador */}
          <div className="flex items-center gap-3 flex-1">
            <FiSearch className="text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Buscar evento"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Tipo (placeholder) */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-1.5 rounded-full"
          >
            <span>Tipo</span>
            <FiChevronDown className="text-slate-400" />
          </button>

          {/* Estado (placeholder) */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-1.5 rounded-full"
          >
            <span>Estado</span>
            <FiChevronDown className="text-slate-400" />
          </button>

          {/* Botones de vista y orden (solo UI) */}
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
        {cargando && filtrados.length === 0 ? (
          <p className="text-sm text-slate-500 mt-6">
            Cargando eventos...
          </p>
        ) : filtrados.length === 0 ? (
          <p className="text-sm text-slate-500 mt-6">
            No se encontraron eventos.
          </p>
        ) : (
          <GridEventosAdminEventos eventos={filtrados} />
        )}
      </section>
    </div>
  );
};
