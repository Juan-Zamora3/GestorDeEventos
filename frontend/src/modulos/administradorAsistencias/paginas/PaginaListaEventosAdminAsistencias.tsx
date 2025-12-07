import React, { useMemo, useState } from "react";
import { FiSearch, FiChevronDown, FiGrid, FiList } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { EventoResumen } from "../componentes/tiposAdminAsistencias";

const eventosMock: EventoResumen[] = [
  {
    id: "concurso-robotica",
    titulo: "Concurso de Robótica Junior",
    tipo: "Concurso",
    imagen: "/login-campus.png",
    fechaInicio: "12/08/2026",
    fechaFin: "20/08/2026",
    equipos: "5 equipos",
    personas: "20 personas",
    activo: true,
  },
  {
    id: "foro-innovacion",
    titulo: "Foro de Innovación Tecnológica",
    tipo: "Congreso",
    imagen: "/Concurso.png",
    fechaInicio: "05/09/2026",
    fechaFin: "05/09/2026",
    equipos: "8 equipos",
    personas: "150 personas",
    activo: false,
  },
  {
    id: "curso-python",
    titulo: "Curso de Python para Ingeniería",
    tipo: "Curso",
    imagen: "/Cursos.png",
    fechaInicio: "15/07/2026",
    fechaFin: "30/07/2026",
    equipos: "—",
    personas: "60 personas",
    activo: false,
  },
];

const PaginaListaEventosAdminAsistencias: React.FC = () => {
  const navigate = useNavigate();
  const [vista, setVista] = useState<"grid" | "lista">("grid");
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState<"Todos" | NonNullable<EventoResumen["tipo"]>>("Todos");
  const [estado, setEstado] = useState<"Todos" | "Activos" | "Finalizados">("Todos");
  const [openTipo, setOpenTipo] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const opcionesTipo: ("Todos" | NonNullable<EventoResumen["tipo"]>)[] = [
    "Todos",
    "Concurso",
    "Curso",
    "Congreso",
    "Seminario",
    "Otro",
  ];

  const filtrados = useMemo(() => {
    const term = query.trim().toLowerCase();
    return eventosMock.filter((e) => {
      const byQuery = !term || [e.titulo, e.fechaInicio, e.fechaFin, e.equipos, e.personas]
        .some((v) => (v ?? "").toLowerCase().includes(term));
      const byTipo = tipo === "Todos" || e.tipo === tipo;
      const byEstado = estado === "Todos" || (estado === "Activos" ? e.activo : !e.activo);
      return byQuery && byTipo && byEstado;
    });
  }, [query, tipo, estado]);

  return (
    <div className="min-h-full bg-[#F1F3FA] px-16 py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-slate-900">Eventos asignados</h1>
        <p className="mt-1 text-sm text-slate-600">Selecciona un evento para administrar la asistencia, equipos y reportes.</p>
      </div>

      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1 bg-white rounded-full shadow-sm flex items-center px-4 py-2 text-sm text-slate-700">
          <FiSearch className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar evento"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenTipo((v) => !v)}
              className="inline-flex items-center gap-2 bg-white rounded-full shadow-sm px-5 py-2 text-sm text-slate-700"
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenEstado((v) => !v)}
              className="inline-flex items-center gap-2 bg-white rounded-full shadow-sm px-5 py-2 text-sm text-slate-700"
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
          <div className="flex items-center gap-2 bg-white rounded-full shadow-sm px-2 py-1">
            <button type="button" aria-label="Vista de cuadrícula" onClick={() => setVista("grid")} className={`h-8 w-8 rounded-full flex items-center justify-center ${vista === "grid" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-50"}`}>
              <FiGrid />
            </button>
            <button type="button" aria-label="Vista de lista" onClick={() => setVista("lista")} className={`h-8 w-8 rounded-full flex items-center justify-center ${vista === "lista" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-50"}`}>
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {vista === "grid" ? (
        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((evento) => (
            <article key={evento.id} className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer flex flex-col" onClick={() => navigate(`/admin-asistencias/eventos/${evento.id}`)}>
              <div className="h-40 w-full overflow-hidden">
                <img src={evento.imagen} alt={evento.titulo} className="w-full h-full object-cover" />
              </div>
              <div className="px-4 pt-3 pb-4 flex-1 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-800 mb-1 leading-snug">{evento.titulo}</h3>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>{evento.fechaInicio}</span>
                  <span>{evento.fechaFin}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{evento.equipos}</span>
                  <span>{evento.personas}</span>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <span className={`h-3 w-3 rounded-full ${evento.activo ? "bg-emerald-400" : "bg-slate-300"}`} />
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="space-y-4">
          {filtrados.map((evento) => (
            <button key={evento.id} type="button" onClick={() => navigate(`/admin-asistencias/eventos/${evento.id}`)} className="w-full bg-white rounded-3xl shadow-sm px-8 py-5 flex items-center justify-between text-left hover:shadow-md transition">
              <div>
                <p className="text-[15px] font-semibold text-slate-900 mb-1">{evento.titulo}</p>
                <p className="text-sm text-slate-600">{`${evento.fechaInicio} - ${evento.fechaFin}`}</p>
                <p className="text-sm text-slate-500 mt-1">{evento.equipos} · {evento.personas}</p>
              </div>
              <div className="flex items-center">
                <span className={`h-2.5 w-2.5 rounded-full ${evento.activo ? "bg-emerald-400" : "bg-slate-300"}`} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaginaListaEventosAdminAsistencias;
