import React, { useMemo, useState } from "react";
import GridEventosAdmin from "../componentes/GridEventosAdmin";
import type { EventoCard } from "../componentes/tiposAdminGeneral";
import { FiSearch, FiChevronDown, FiGrid, FiList } from "react-icons/fi";

const eventosDummy: EventoCard[] = [
  {
    id: 1,
    titulo: "Concurso de Robótica Junior",
    tipo: "Concurso",
    fechaInicio: "12/08/2026",
    fechaFin: "20/08/2026",
    equipos: "5 equipos",
    personas: "20 personas",
    imagen: "/login-campus.png",
    activo: true,
  },
  {
    id: 2,
    titulo: "Curso de Programación en C++",
    tipo: "Curso",
    fechaInicio: "12/08/2026",
    fechaFin: "20/08/2026",
    equipos: "5 equipos",
    personas: "20 personas",
    imagen: "/login-campus.png",
    activo: true,
  },
  {
    id: 3,
    titulo: "Congreso Nacional de Ingeniería",
    tipo: "Congreso",
    fechaInicio: "12/08/2026",
    fechaFin: "20/08/2026",
    equipos: "5 equipos",
    personas: "20 personas",
    imagen: "/login-campus.png",
    activo: true,
  },
  // agrega más si quieres
];

export const PaginaAuditoriaAdminGeneral: React.FC = () => {
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState<"Todos" | NonNullable<EventoCard["tipo"]>>("Todos");
  const [estado, setEstado] = useState<"Todos" | "Activos" | "Finalizados">("Todos");
  const [vista, setVista] = useState<"grid" | "lista">("grid");
  const [openTipo, setOpenTipo] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const opcionesTipo: ("Todos" | NonNullable<EventoCard["tipo"]>)[] = [
    "Todos",
    "Concurso",
    "Curso",
    "Congreso",
    "Seminario",
    "Otro",
  ];

  const eventosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return eventosDummy.filter((e) => {
      const byQuery = !q || [e.titulo, e.fechaInicio, e.fechaFin, e.equipos, e.personas]
        .some((v) => (v ?? "").toLowerCase().includes(q));
      const byTipo = tipo === "Todos" || e.tipo === tipo;
      const byEstado = estado === "Todos" || (estado === "Activos" ? e.activo : !e.activo);
      return byQuery && byTipo && byEstado;
    });
  }, [query, tipo, estado]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Barra de filtros como en Figma */}
      <section className="flex flex-wrap items-center gap-4 mb-6 relative">
        {/* Buscar evento */}
        <div className="flex-1 min-w-[220px]">
          <div className="flex itemscenter gap-3 bg-white rounded-full px-4 py-2 shadow-sm">
            <FiSearch className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar evento"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Filtro Tipo */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenTipo((v) => !v)}
            className="inline-flex items-center justify-between gap-2 bg-white rounded-full px-4 py-2 text-sm text-slate-700 shadow-sm"
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
                  onClick={() => { setTipo(t); setOpenTipo(false); }}
                  className={`w-full text-left px-3 py-2 text-[11px] font-semibold ${tipo === t ? "text-[#356BFF]" : "text-slate-700"} hover:bg-slate-50`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtro Estado */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenEstado((v) => !v)}
            className="inline-flex items-center justify-between gap-2 bg-white rounded-full px-4 py-2 text-sm text-slate-700 shadow-sm"
          >
            <span>{estado === "Todos" ? "Estado" : estado}</span>
            <FiChevronDown className="text-slate-400" />
          </button>
          {openEstado && (
            <div className="absolute z-10 mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-sm">
              {(["Todos", "Activos", "Finalizados"] as const).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => { setEstado(e); setOpenEstado(false); }}
                  className={`w-full text-left px-3 py-2 text-[11px] font-semibold ${estado === e ? "text-[#356BFF]" : "text-slate-700"} hover:bg-slate-50`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vista (grid/lista) */}
        <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-sm">
          <button
            type="button"
            onClick={() => setVista("grid")}
            className={`h-8 w-8 flex items-center justify-center rounded-full ${vista === "grid" ? "bg-slate-100 text-slate-600" : "text-slate-400 hover:bg-slate-100"}`}
          >
            <FiGrid />
          </button>
          <button
            type="button"
            onClick={() => setVista("lista")}
            className={`h-8 w-8 flex items-center justify-center rounded-full ${vista === "lista" ? "bg-slate-100 text-slate-600" : "text-slate-400 hover:bg-slate-100"}`}
          >
            <FiList />
          </button>
        </div>
      </section>

      {/* Grid de eventos */}
      {vista === "grid" ? (
        <GridEventosAdmin eventos={eventosFiltrados} />
      ) : (
        <section className="bg-white rounded-2xl shadow-sm">
          <table className="w-full text-sm">
            <thead className="text-[11px] text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Inicio</th>
                <th className="px-4 py-3 text-left">Fin</th>
                <th className="px-4 py-3 text-left">Equipos</th>
                <th className="px-4 py-3 text-left">Personas</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventosFiltrados.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => window.location.assign(`/admin-general/auditoria/${e.id}`)}>
                  <td className="px-4 py-3">{e.titulo}</td>
                  <td className="px-4 py-3">{e.tipo ?? "—"}</td>
                  <td className="px-4 py-3">{e.fechaInicio}</td>
                  <td className="px-4 py-3">{e.fechaFin}</td>
                  <td className="px-4 py-3">{e.equipos}</td>
                  <td className="px-4 py-3">{e.personas}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${e.activo ? "bg-emerald-400" : "bg-slate-300"}`} />
                    <span className="ml-2 text-[11px] text-slate-600">{e.activo ? "Activo" : "Finalizado"}</span>
                  </td>
                </tr>
              ))}
              {eventosFiltrados.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-[12px] text-slate-500" colSpan={7}>Sin resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};
