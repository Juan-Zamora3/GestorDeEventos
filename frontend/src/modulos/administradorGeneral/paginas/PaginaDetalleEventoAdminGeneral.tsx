import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import type { EventoCard } from "../componentes/tiposAdminGeneral";

type LocationState = {
  evento?: EventoCard;
};

const tabs = [
  { id: "informacion", label: "Información" },
  { id: "equipos", label: "Equipos" },
  { id: "personal", label: "Personal" },
  { id: "asistencias", label: "Asistencias" },
  { id: "plantillas", label: "Plantillas" },
  { id: "formulario", label: "Formulario" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export const PaginaDetalleEventoAdminGeneral: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { evento: eventoFromState } = (location.state || {}) as LocationState;

  // Fallback por si entran directo a la URL
  const evento: EventoCard =
    eventoFromState || ({
      id: 0,
      titulo: "Detalle de evento",
      fechaInicio: "",
      fechaFin: "",
      equipos: "",
      personas: "",
      imagen: "/login-campus.png",
      activo: true,
    } as EventoCard);

  const [tabActiva, setTabActiva] = useState<TabId>("informacion");

  return (
    <div className="max-w-6xl mx-auto pb-8">
      {/* Header del evento (barra azul con regresar + título) */}
      <header className="mt-4 mb-4 rounded-2xl bg-gradient-to-r from-sky-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <FiArrowLeft className="text-white" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide opacity-80">
              Concurso
            </span>
            <h1 className="text-sm sm:text-base font-semibold">
              {evento.titulo}
            </h1>
          </div>
        </div>

        {/* Aquí luego puedes poner botón "Exportar a Excel" como en el diseño */}
        <button className="hidden sm:inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs font-medium hover:bg-white/25">
          Exportar a Excel
        </button>
      </header>

      {/* Navbar interno: Información / Equipos / ... */}
      <nav className="mb-6 rounded-2xl bg-slate-100 px-3 py-2">
        <ul className="flex flex-wrap gap-2 sm:gap-4">
          {tabs.map((tab) => {
            const activo = tabActiva === tab.id;
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => setTabActiva(tab.id)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition
                    ${
                      activo
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                    }`}
                >
                  {tab.label}
                  {activo && (
                    <div className="h-0.5 w-full mt-1 rounded-full bg-indigo-500" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Contenido por pestaña (por ahora solo maquetas básicas) */}
      {tabActiva === "informacion" && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
          {/* Columna izquierda: imagen + descripción + fechas */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-semibold mb-3 text-slate-900">
              {evento.titulo}
            </h2>

            <div className="mb-4 rounded-2xl overflow-hidden bg-slate-200">
              <img
                src={evento.imagen}
                alt={evento.titulo}
                className="w-full h-44 object-cover"
              />
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-slate-800 mb-1">
                  Descripción*
                </p>
                <p className="text-slate-600">
                  El Concurso de Robótica es un evento académico donde
                  estudiantes compiten diseñando, construyendo y programando
                  robots para superar retos técnicos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Fecha de inicio del evento
                  </p>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 text-sm">
                    {evento.fechaInicio}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Fecha de finalización del evento
                  </p>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 text-sm">
                    {evento.fechaFin}
                  </div>
                </div>
                {/* Aquí después agregas fechas de inscripciones, etc. */}
              </div>
            </div>
          </div>

          {/* Columna derecha: tarjetas de resumen + tabla placeholder */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl border border-slate-200 px-3 py-3">
                <p className="text-[11px] text-slate-500">Equipos registrados</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {evento.equipos}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 px-3 py-3">
                <p className="text-[11px] text-slate-500">Personas</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {evento.personas}
                </p>
              </div>
              {/* Más tarjetas si las necesitas */}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Involucrados en total:
                </h3>
                <span className="text-sm font-semibold text-slate-700">
                  {/* Número dummy, luego lo calculas */}
                  556
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200">
                {/* Navbar interno Equipos / Personal (mini) */}
                <div className="flex bg-indigo-600 text-xs text-white">
                  <button className="flex-1 px-3 py-2 font-medium bg-indigo-500">
                    Equipos
                  </button>
                  <button className="flex-1 px-3 py-2 font-medium bg-indigo-600/70">
                    Personal
                  </button>
                </div>

                {/* Tabla placeholder */}
                <div className="max-h-64 overflow-y-auto text-xs">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">
                          Nombre del equipo
                        </th>
                        <th className="text-left px-3 py-2 font-medium">
                          Día de registro
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-100">
                        <td className="px-3 py-2">
                          Los Trialerites — Instituto Tecnológico Superior de
                          Puerto Peñasco
                        </td>
                        <td className="px-3 py-2">09/12/2024</td>
                      </tr>
                      {/* Aquí luego mapeas datos reales */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {tabActiva === "equipos" && (
        <section className="bg-white rounded-2xl shadow-sm p-4 text-sm text-slate-700">
          Aquí va la vista de <strong>Equipos</strong> (luego la llenamos).
        </section>
      )}

      {tabActiva === "personal" && (
        <section className="bg-white rounded-2xl shadow-sm p-4 text-sm text-slate-700">
          Aquí va la vista de <strong>Personal</strong>.
        </section>
      )}

      {tabActiva === "asistencias" && (
        <section className="bg-white rounded-2xl shadow-sm p-4 text-sm text-slate-700">
          Aquí va la vista de <strong>Asistencias</strong>.
        </section>
      )}

      {tabActiva === "plantillas" && (
        <section className="bg-white rounded-2xl shadow-sm p-4 text-sm text-slate-700">
          Aquí va la vista de <strong>Plantillas</strong>.
        </section>
      )}

      {tabActiva === "formulario" && (
        <section className="bg-white rounded-2xl shadow-sm p-4 text-sm text-slate-700">
          Aquí va la vista de <strong>Formulario</strong>.
        </section>
      )}
    </div>
  );
};
