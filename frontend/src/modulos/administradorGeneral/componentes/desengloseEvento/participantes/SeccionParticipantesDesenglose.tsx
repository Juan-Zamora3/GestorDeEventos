import React, { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

interface Registro {
  id: string;
  nombre: string;
  codigo: string;
  telefono: string;
  correo: string;
  institucion: string;
}

const baseDatos: Registro[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `rec-${String(i + 1).padStart(3, "0")}`,
  nombre: "Los Tralalerites",
  codigo: `TEC${String(i + 1).padStart(3, "0")}`,
  telefono: "(123) 000-0000",
  correo: "tralalerites@example.com",
  institucion: "Instituto Tecnológico Superior",
}));

const SeccionParticipantesDesenglose: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [registros] = useState<Registro[]>(baseDatos);

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return registros;
    return registros.filter(
      (r) =>
        r.nombre.toLowerCase().includes(term) ||
        r.codigo.toLowerCase().includes(term),
    );
  }, [busqueda, registros]);

  return (
    <div className="bg-white rounded-3xl shadow-sm px-8 py-6 flex flex-col h-full">
      <div className="flex items-center mb-5 gap-4">
        <div className="flex-1 max-w-xl bg-[#F5F6FB] rounded-full flex items-center px-4 py-2 text-sm text-slate-700">
          <FiSearch className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Participantes
            </h3>
            <button
              type="button"
              className="text-[11px] font-semibold text-[#356BFF]"
            >
              Foro de Administración
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            A descriptive body text comes here
          </p>
        </div>

        <div className="border-t border-slate-100">
          {/* 👇 Scroll SOLO en la tabla */}
          <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#F5F6FB] text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre Completo</th>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Teléfono</th>
                  <th className="px-4 py-3 text-left">Correo</th>
                  <th className="px-4 py-3 text-left">Institución</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">{r.nombre}</td>
                    <td className="px-4 py-3">{r.codigo}</td>
                    <td className="px-4 py-3">{r.telefono}</td>
                    <td className="px-4 py-3">{r.correo}</td>
                    <td className="px-4 py-3">{r.institucion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* ☝️ aquí se queda el scrollbar interno */}
        </div>
      </div>
    </div>
  );
};

export default SeccionParticipantesDesenglose;
