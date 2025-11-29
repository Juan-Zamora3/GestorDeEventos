import React, { useMemo, useState } from "react";
import { FiSearch, FiUsers, FiUser } from "react-icons/fi";
import ModalAgregarEquipo from "./ModalAgregarEquipo";
import ModalEquipoDetalle from "./ModalEquipoDetalle";

interface Equipo {
  id: string;
  nombre: string;
  institucion: string;
  integrantes: number;
  asesor: string;
}

const equiposMock: Equipo[] = [
  {
    id: "1",
    nombre: "Los Tralalerites",
    institucion: "Instituto tecnologico superior de puerto peñasco",
    integrantes: 4,
    asesor: "Juan Perez Gallador",
  },
  {
    id: "2",
    nombre: "Bits & Bots",
    institucion: "Instituto tecnologico superior de puerto peñasco",
    integrantes: 4,
    asesor: "Juan Perez Gallador",
  },
  {
    id: "3",
    nombre: "MechaTech",
    institucion: "Instituto tecnologico superior de puerto peñasco",
    integrantes: 4,
    asesor: "Juan Perez Gallador",
  },
  // … puedes duplicar si quieres llenar más
];

const EquiposEventoPanel: React.FC = () => {
  const [showAgregar, setShowAgregar] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionando, setSeleccionando] = useState(false);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [pagados, setPagados] = useState<Record<string, boolean>>({});

  const baseLista = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      ...equiposMock[i % equiposMock.length],
      id: String(i + 1),
    }));
  }, []);

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    const fuente = baseLista;
    if (!term) return fuente;
    return fuente.filter(
      (e) =>
        e.nombre.toLowerCase().includes(term) ||
        e.institucion.toLowerCase().includes(term)
    );
  }, [busqueda, baseLista]);

  

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm px-8 py-6 flex flex-col h-full">
        {/* Buscador + acciones */}
        <div className="flex items-center justify-between mb-5 gap-4">
          <div className="flex-1 max-w-2xl">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Buscar"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full rounded-xl border-2 border-[#7B5CFF] bg-white px-4 py-2 pr-10 text-sm outline-none"
              />
              <FiSearch className="absolute right-3 text-[#7B5CFF]" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAgregar(true)}
            className="rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white px-6 py-2.5 text-sm font-semibold shadow-sm"
          >
            Nuevo Equipo
          </button>
          <button
            type="button"
            onClick={() => setSeleccionando((s) => !s)}
            className="rounded-full bg-white text-slate-800 px-6 py-2.5 text-sm font-semibold shadow-sm border border-slate-200"
          >
            Seleccionar
          </button>
          <button
            type="button"
            onClick={() => setSeleccion(new Set())}
            className="rounded-full bg-slate-600 text-white px-6 py-2.5 text-sm font-semibold shadow-sm"
          >
            Eliminar
          </button>
        </div>

        {/* Grid de tarjetas de equipos */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((eq) => (
            <button
              key={eq.id}
              type="button"
              onClick={() => setShowDetalle(true)}
              className={`bg-white rounded-2xl shadow-[0_0_0_1px_rgba(15,23,42,0.06)] hover:shadow-md transition px-5 py-4 text-left border-l-[4px] ${seleccion.has(eq.id) ? "border-[#5B4AE5]" : "border-[#7B5CFF]"}`}
            >
              <p className="text-sm font-semibold text-slate-900 mb-1">
                {eq.nombre}
              </p>
              <p className="text-[11px] text-slate-500 mb-3">
                {eq.institucion}
              </p>

              <div className="text-[11px] text-slate-600 space-y-1 mb-2">
                <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><FiUsers /> Integrantes</span><span>{eq.integrantes}</span></div>
                <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><FiUser /> Asesor</span><span>{eq.asesor}</span></div>
              </div>

              {seleccionando && (
                <div className="mt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Set(seleccion);
                      if (next.has(eq.id)) next.delete(eq.id); else next.add(eq.id);
                      setSeleccion(next);
                    }}
                    className={`h-5 w-5 rounded-full border ${seleccion.has(eq.id) ? "bg-[#5B4AE5] border-[#5B4AE5]" : "border-slate-300"}`}
                    aria-label="Seleccionar"
                  />
                </div>
              )}

              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  className="text-[11px] font-semibold text-[#356BFF]"
                  onClick={(e)=> e.stopPropagation()}
                >
                  PARTICIPANTES
                </button>
                <div className="flex items-center gap-2" onClick={(e)=> e.stopPropagation()}>
                  <span className="text-[11px] text-slate-600">Pagado</span>
                  <button
                    type="button"
                    aria-label="Pagado"
                    onClick={(e)=>{ e.stopPropagation(); setPagados((prev)=> ({...prev, [eq.id]: !prev[eq.id]})); }}
                    className={`h-5 w-10 rounded-full transition ${pagados[eq.id] ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <span className={`block h-5 w-5 bg-white rounded-full shadow transform transition ${pagados[eq.id] ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showAgregar && <ModalAgregarEquipo onClose={() => setShowAgregar(false)} />}
      {showDetalle && <ModalEquipoDetalle onClose={() => setShowDetalle(false)} />}
    </>
  );
};

export default EquiposEventoPanel;
