// src/modulos/administradorEventos/paginas/PaginaGaleriaPlantillasAdminEventos.tsx
import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import TarjetaPlantillaEvento from "../componentes/TarjetaPlantillaEvento";
import type { PlantillaEvento } from "../componentes/tiposAdminEventos";
import { useNavigate } from "react-router-dom";

interface PlantillaFirebase extends PlantillaEvento {}

export const PaginaGaleriaPlantillasAdminEventos: React.FC = () => {
  const [plantillas, setPlantillas] = useState<PlantillaFirebase[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const snap = await getDocs(collection(db, "plantillasEvento"));
        const lista: PlantillaFirebase[] = snap.docs.map((doc) => {
          const data = doc.data() as any;
          const info = data.config?.informacion ?? {};
          return {
            id: doc.id,
            titulo: data.nombrePlantilla ?? info.nombreEvento ?? "Plantilla",
            imagen: data.miniaturaUrl ?? "/EventoBlanco.png",
          };
        });
        setPlantillas(lista);
      } catch (e) {
        console.error("Error al cargar plantillas:", e);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const filtradas = plantillas.filter((p) =>
    p.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const manejarClickPlantilla = (idPlantilla: string) => {
    navigate(`/admin-eventos/crear?plantilla=${idPlantilla}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#192D69] to-[#476AC6] text-white">
      <section className="px-16 pt-10 pb-14">
        {/* Fila superior */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center text-2xl leading-none"
          >
            ←
          </button>
          <h1 className="text-[32px] font-semibold tracking-tight">
            Galería de plantillas
          </h1>
        </div>

        {/* Evento en blanco */}
        <div className="mb-10">
          <TarjetaPlantillaEvento
            plantilla={{
              id: "blanco",
              titulo: "Evento en blanco",
              imagen: "/EventoBlanco.png",
            }}
            onClick={() => navigate("/admin-eventos/crear")}
          />
        </div>

        {/* EXPLORAR */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex-1 h-px bg-white/50" />
          <span className="text-lg font-semibold tracking-wide">
            Explorar
          </span>
          <div className="flex-1 h-px bg-white/50" />
        </div>

        {/* Buscador */}
        <div className="mb-10 flex justify-start">
          <div className="w-[430px] bg-white rounded-full px-5 py-2.5 flex items-center gap-3 text-slate-700 shadow-sm">
            <FiSearch className="text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Buscar plantillas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 border-none outline-none bg-transparent text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Grid de tarjetas */}
        <div className="grid gap-x-8 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cargando && filtradas.length === 0 && (
            <p className="text-sm text-white/80 col-span-full">
              Cargando plantillas...
            </p>
          )}

          {!cargando && filtradas.length === 0 && (
            <p className="text-sm text-white/80 col-span-full">
              No se encontraron plantillas.
            </p>
          )}

          {filtradas.map((p) => (
            <TarjetaPlantillaEvento
              key={p.id}
              plantilla={p}
              onClick={() => manejarClickPlantilla(p.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
