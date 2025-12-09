import React, { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

interface Registro {
  id: string;
  nombre: string;
  codigo: string;
  pagado: boolean;
  entrada: boolean;
  regreso: boolean;
  entradaEstado: "Registrada" | "Pendiente";
  regresoEstado: "Registrada" | "Pendiente";
}

const baseDatos: Registro[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `rec-${String(i + 1).padStart(3, "0")}`,
  nombre: "Los Tralalerites",
  codigo: `TEC${String(i + 1).padStart(3, "0")}`,
  pagado: i % 3 === 0,
  entrada: i % 4 === 0,
  regreso: i % 5 === 0,
  entradaEstado: i % 2 === 0 ? "Registrada" : "Pendiente",
  regresoEstado: i % 3 === 0 ? "Registrada" : "Pendiente",
}));

const pillClase: Record<"Registrada" | "Pendiente", string> = {
  Registrada:
    "inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-600 px-3 py-1 text-xs font-semibold",
  Pendiente:
    "inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-xs font-semibold",
};

const SeccionAsistenciasDesenglose: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return baseDatos;
    return baseDatos.filter(
      (r) =>
        r.nombre.toLowerCase().includes(term) ||
        r.codigo.toLowerCase().includes(term),
    );
  }, [busqueda]);

  return (
    <div className="bg-white rounded-3xl shadow-sm px-8 py-6 flex flex-col h-full">
      {/* Barra de búsqueda */}
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

      {/* Tarjeta tabla */}
      <div className="rounded-3xl border border-slate-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Personal / Asistencias
            </h3>
            <button
              type="button"
              className="text-[11px] font-semibold text-[#356BFF]"
            >
              Foro de Administración
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Control de pagos y asistencias del personal registrado.
          </p>
        </div>

        <div className="border-t border-slate-100">
          {/* Scroll solo en la tabla */}
          <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#F5F6FB] text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre Completo</th>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Pagado</th>
                  <th className="px-4 py-3 text-left">Entrada</th>
                  <th className="px-4 py-3 text-left">Regreso</th>
                  <th className="px-4 py-3 text-left">Entrada ↓</th>
                  <th className="px-4 py-3 text-left">Regreso ↓</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">{r.nombre}</td>
                    <td className="px-4 py-3">{r.codigo}</td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={r.pagado}
                        disabled
                        className="h-4 w-4 accent-[#5B4AE5] cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={r.entrada}
                        disabled
                        className="h-4 w-4 accent-[#5B4AE5] cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={r.regreso}
                        disabled
                        className="h-4 w-4 accent-[#5B4AE5] cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={pillClase[r.entradaEstado]}>
                        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                        {r.entradaEstado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={pillClase[r.regresoEstado]}>
                        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                        {r.regresoEstado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Fin tabla */}
        </div>
      </div>
    </div>
  );
};

export default SeccionAsistenciasDesenglose;
