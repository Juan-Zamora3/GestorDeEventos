import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { obtenerEventoAdminGeneralPorId } from "../../../api/adminGeneralApi";

import type { EventoCard } from "../componentes/tiposAdminGeneral";

import SeccionInformacionDesenglose from "../componentes/desengloseEvento/informacion/SeccionInformacionDesenglose";
import SeccionEquiposDesenglose from "../componentes/desengloseEvento/equipos/SeccionEquiposDesenglose";
import SeccionParticipantesDesenglose from "../componentes/desengloseEvento/participantes/SeccionParticipantesDesenglose";
import SeccionPersonalDesenglose from "../componentes/desengloseEvento/personal/SeccionPersonalDesenglose";
import SeccionAsistenciasDesenglose from "../componentes/desengloseEvento/asistencias/SeccionAsistenciasDesenglose";
import SeccionPlantillasDesenglose from "../componentes/desengloseEvento/plantillas/SeccionPlantillasDesenglose";
import SeccionConstanciasDesenglose from "../componentes/desengloseEvento/constancias/SeccionConstanciasDesenglose";
import SeccionFormularioDesenglose from "../componentes/desengloseEvento/formulario/SeccionFormularioDesenglose";

type LocationState = {
  evento?: EventoCard;
};

const tabs = [
  { id: "informacion", label: "Información" },
  { id: "equipos", label: "Equipos" },
  { id: "participantes", label: "Participantes" },
  { id: "personal", label: "Personal" },
  { id: "asistencias", label: "Asistencias" },
  { id: "plantillas", label: "Plantillas" },
  { id: "constancias", label: "Constancias" },
  { id: "formulario", label: "Formulario" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export const PaginaDetalleEventoAdminGeneral: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const { evento: eventoFromState } = (location.state || {}) as LocationState;

  // Fallback por si entran directo a la URL sin state
  const fallbackEvento: EventoCard = {
    id: "sin-id",
    titulo: "Detalle de evento",
    tipo: "Concurso",
    fechaInicio: "",
    fechaFin: "",
    equipos: "",
    personas: "",
    imagen: "/login-campus.png",
    activo: true,
  };

  const [evento, setEvento] = useState<EventoCard>(eventoFromState ?? fallbackEvento);

  useEffect(() => {
    if (!eventoFromState && typeof id === "string" && id) {
      (async () => {
        const ev = await obtenerEventoAdminGeneralPorId(id);
        if (ev) setEvento(ev);
      })();
    }
  }, [eventoFromState, id]);

  const [tabActiva, setTabActiva] = useState<TabId>("informacion");

  return (
    <div className="max-w-6xl mx-auto pb-8">
      {/* Header del evento (barra azul con regresar + título) */}
      <header className="mt-4 mb-4 rounded-2xl bg-gradient-to-r from-sky-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <FiArrowLeft className="text-white" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide opacity-80">
              {evento.tipo ?? "Evento"}
            </span>
            <h1 className="text-sm sm:text-base font-semibold">
              {evento.titulo}
            </h1>
          </div>
        </div>

        {/* Botón derecho (por ahora solo placeholder) */}
        <button
          type="button"
          className="hidden sm:inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs font-medium hover:bg-white/25"
        >
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

      {/* Contenido por pestaña */}
      {tabActiva === "informacion" && <SeccionInformacionDesenglose />}
      {tabActiva === "equipos" && <SeccionEquiposDesenglose />}
      {tabActiva === "participantes" && <SeccionParticipantesDesenglose />}
      {tabActiva === "personal" && <SeccionPersonalDesenglose />}
      {tabActiva === "asistencias" && <SeccionAsistenciasDesenglose />}
      {tabActiva === "plantillas" && <SeccionPlantillasDesenglose />}
      {tabActiva === "constancias" && <SeccionConstanciasDesenglose />}
      {tabActiva === "formulario" && <SeccionFormularioDesenglose />}
    </div>
  );
};
