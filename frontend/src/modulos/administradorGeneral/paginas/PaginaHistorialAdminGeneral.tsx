// src/modulos/administradorGeneral/paginas/PaginaHistorialAdminGeneral.tsx
import React, { useEffect, useMemo, useState } from "react";
import TablaHistorialAdmin from "../componentes/TablaHistorialAdmin";
import type { EntradaHistorial } from "../componentes/tiposAdminGeneral";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { obtenerHistorialAdminGeneral } from "../../../api/adminGeneralApi";

export const PaginaHistorialAdminGeneral: React.FC = () => {
  const [historial, setHistorial] = useState<EntradaHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [menuFiltrosOpen, setMenuFiltrosOpen] = useState(false);
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEvento, setFiltroEvento] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerHistorialAdminGeneral();
        setHistorial(data);
      } catch (e) {
        console.error("[PaginaHistorialAdminGeneral] Error al cargar", e);
        setError(
          "No se pudo cargar el historial. Intenta de nuevo en unos minutos.",
        );
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const opcionesRol = useMemo(
    () => Array.from(new Set(historial.map((h) => h.rol))).filter(Boolean),
    [historial],
  );
  const opcionesEvento = useMemo(
    () => Array.from(new Set(historial.map((h) => h.evento))).filter(Boolean),
    [historial],
  );
  const opcionesAccion = useMemo(
    () => Array.from(new Set(historial.map((h) => h.accion))).filter(Boolean),
    [historial],
  );
  const opcionesFecha = useMemo(
    () => Array.from(new Set(historial.map((h) => h.fecha))).filter(Boolean),
    [historial],
  );

  const entradasFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return historial.filter((h) => {
      const globalStr = `${h.nombre} ${h.rol} ${h.evento} ${h.accion} ${h.fecha} ${h.hora}`.toLowerCase();

      const pasaBusqueda = q ? globalStr.includes(q) : true;
      const pasaRol = filtroRol ? h.rol === filtroRol : true;
      const pasaEvento = filtroEvento ? h.evento === filtroEvento : true;
      const pasaAccion = filtroAccion ? h.accion === filtroAccion : true;
      const pasaFecha = filtroFecha ? h.fecha === filtroFecha : true;

      return (
        pasaBusqueda &&
        pasaRol &&
        pasaEvento &&
        pasaAccion &&
        pasaFecha
      );
    });
  }, [historial, query, filtroRol, filtroEvento, filtroAccion, filtroFecha]);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-800 mb-4">
        Historial de acciones
      </h1>

      {cargando && historial.length === 0 && (
        <p className="text-sm text-slate-500 mb-3">Cargando historial...</p>
      )}
      {error && (
        <p className="text-sm text-red-500 mb-3">
          {error}
        </p>
      )}

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm flex-1 min-w-[320px]">
          <FiSearch className="text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en todos los campos"
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuFiltrosOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-white text-slate-700 text-sm font-semibold px-4 py-2 shadow-sm hover:bg-slate-100"
          >
            Filtros
            <FiChevronDown className="text-slate-400" />
          </button>

          {menuFiltrosOpen && (
            <div className="absolute right-0 mt-2 w-96 rounded-2xl border border-slate-200 bg-white shadow-md p-4 z-20">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Rol */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-600">
                    Rol
                  </span>
                  <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Todos</option>
                    {opcionesRol.map((rol) => (
                      <option key={rol} value={rol}>
                        {rol}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Evento */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-600">
                    Evento asignado
                  </span>
                  <select
                    value={filtroEvento}
                    onChange={(e) => setFiltroEvento(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Todos</option>
                    {opcionesEvento.map((ev) => (
                      <option key={ev} value={ev}>
                        {ev}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Acción */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-600">
                    Acción
                  </span>
                  <select
                    value={filtroAccion}
                    onChange={(e) => setFiltroAccion(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Todas</option>
                    {opcionesAccion.map((ac) => (
                      <option key={ac} value={ac}>
                        {ac}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-600">
                    Fecha
                  </span>
                  <select
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Todas</option>
                    {opcionesFecha.map((fe) => (
                      <option key={fe} value={fe}>
                        {fe}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFiltroRol("");
                    setFiltroEvento("");
                    setFiltroAccion("");
                    setFiltroFecha("");
                  }}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setMenuFiltrosOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#6581D6] text-white text-xs font-semibold hover:bg-[#5268bf]"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TablaHistorialAdmin entradas={entradasFiltradas} />
    </div>
  );
};
