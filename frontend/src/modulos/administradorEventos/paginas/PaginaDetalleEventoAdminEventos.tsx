// src/modulos/administradorEventos/paginas/PaginaDetalleEventoAdminEventos.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

type Tab =
  | "informacion"
  | "equipos"
  | "participantes"
  | "personal"
  | "asistencias"
  | "plantillas"
  | "constancias"
  | "formulario";

interface RolPersonal {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface CategoriaEvento {
  id: string;
  nombre: string;
  cupo: number;
}

type TipoCampo = "texto_corto" | "email" | "telefono" | "seleccion_multiple";

interface CampoFormulario {
  id: string;
  nombreCampo: string;
  tipoCampo: TipoCampo;
  ejemplo: string;
  obligatorio: boolean;
  bloqueado?: boolean;
}

interface EventoConfig {
  informacion: {
    nombreEvento?: string;
    fechaInicioEvento?: string;
    fechaFinEvento?: string;
    fechaInicioInscripciones?: string;
    fechaFinInscripciones?: string;
    descripcion?: string;
    fotoNombre?: string | null; // URL de la imagen del evento
  };
  participantes: {
    modalidadRegistro?: "individual" | "equipos";
    maxParticipantes?: number | null;
    categorias?: CategoriaEvento[];
  };
  personal: {
    roles?: RolPersonal[];
  };
  ajustes: {
    tomarAsistenciaQR?: boolean;
    tomarAsistenciaTiempos?: boolean;
    confirmacionPago?: boolean;
    envioPorCorreo?: boolean;
    medioEnvioQR?: string;
    costoInscripcion?: number;
    tiempos?: { id: string; etiqueta: string }[];
  };
  formulario: {
    campos?: CampoFormulario[];
  };
}

export const PaginaDetalleEventoAdminEventos: React.FC = () => {
  const { idEvento } = useParams<{ idEvento: string }>();
  const navigate = useNavigate();

  const [evento, setEvento] = useState<EventoConfig | null>(null);
  const [tab, setTab] = useState<Tab>("informacion");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      if (!idEvento) {
        setError("No se encontró el identificador del evento.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError(null);

        const ref = doc(db, "eventos", idEvento);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("El evento no existe o fue eliminado.");
          setCargando(false);
          return;
        }

        const data = snap.data() as any;

        setEvento({
          informacion: data.informacion ?? {},
          participantes: data.participantes ?? {},
          personal: data.personal ?? {},
          ajustes: data.ajustes ?? {},
          formulario: data.formulario ?? {},
        });
      } catch (e) {
        console.error("Error al cargar evento (admin eventos):", e);
        setError("Ocurrió un error al cargar el evento.");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [idEvento]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF0F7]">
        <p className="text-slate-500 text-sm">Cargando evento...</p>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EEF0F7]">
        <p className="text-slate-600 mb-4 text-sm">
          {error ?? "Evento no encontrado."}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-2 rounded-full bg-white border border-slate-300 text-sm text-slate-700 shadow-sm"
        >
          Volver
        </button>
      </div>
    );
  }

  const { informacion, participantes, ajustes, personal, formulario } = evento;

  const esEquipos = participantes.modalidadRegistro === "equipos";
  const tieneQR = ajustes.tomarAsistenciaQR === true;
  const tieneEnvioCorreo = ajustes.envioPorCorreo === true;

  const rolesPersonal = (personal.roles ?? []) as RolPersonal[];
  const categorias = (participantes.categorias ?? []) as CategoriaEvento[];
  const campos = (formulario.campos ?? []) as CampoFormulario[];
  const tiempos =
    (ajustes.tiempos ?? []) as { id: string; etiqueta: string }[];

  // Para esconder tarjetas que no estén configuradas
  const tieneFechasEvento =
    informacion.fechaInicioEvento || informacion.fechaFinEvento;
  const tieneFechasInscripciones =
    informacion.fechaInicioInscripciones || informacion.fechaFinInscripciones;
  const tieneModalidad = participantes.modalidadRegistro !== undefined;
  const tieneMaxParticipantes =
    participantes.maxParticipantes !== undefined &&
    participantes.maxParticipantes !== null;

  const tieneConfigClave =
    ajustes.tomarAsistenciaQR !== undefined ||
    ajustes.envioPorCorreo !== undefined ||
    ajustes.costoInscripcion !== undefined ||
    !!ajustes.medioEnvioQR;

  // Tabs (algunas dependen de la configuración)
  const tabs: { id: Tab; label: string; visible: boolean }[] = [
    { id: "informacion", label: "Información", visible: true },
    { id: "equipos", label: "Equipos", visible: true }, // se maneja mensaje cuando no es por equipos
    { id: "participantes", label: "Participantes", visible: true },
    {
      id: "personal",
      label: "Personal",
      visible: rolesPersonal.length > 0,
    },
    {
      id: "asistencias",
      label: "Asistencias",
      visible: tiempos.length > 0 || tieneQR,
    },
    { id: "plantillas", label: "Plantillas", visible: true },
    {
      id: "constancias",
      label: "Constancias",
      visible: tieneEnvioCorreo,
    },
    {
      id: "formulario",
      label: "Formulario",
      visible: campos.length > 0,
    },
  ];

  const tabsVisibles = tabs.filter((t) => t.visible);

  // Si la pestaña actual ya no es visible (por ejemplo, sin campos), regresamos a "informacion"
  if (!tabsVisibles.find((t) => t.id === tab)) {
    setTimeout(() => setTab("informacion"), 0);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#192D69] to-[#476AC6] text-white">
      {/* HEADER + TABS */}
      <header className="px-10 sm:px-14 pt-8 pb-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center text-2xl leading-none hover:bg-white/25 transition"
          >
            ←
          </button>
          <div className="min-w-[200px]">
            <p className="text-xs uppercase tracking-[0.26em] text-white/70 mb-1">
              Administrador de eventos
            </p>
            <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight">
              {informacion.nombreEvento ?? "Evento sin título"}
            </h1>
            {(informacion.fechaInicioEvento ||
              informacion.fechaFinEvento) && (
              <p className="text-xs text-white/70 mt-1">
                {informacion.fechaInicioEvento ?? "—"} –{" "}
                {informacion.fechaFinEvento ?? "—"}
              </p>
            )}
          </div>
        </div>

        {/* Tabs estilo navbar (similar a tus capturas) */}
        <nav className="mt-4 overflow-x-auto">
          <div className="inline-flex bg-white/10 rounded-full p-1 backdrop-blur-sm">
            {tabsVisibles.map((t) => {
              const activo = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                    activo
                      ? "bg-white text-[#192D69] shadow-sm"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* CONTENIDO */}
      <main className="px-4 sm:px-10 lg:px-14 pb-10">
        <div className="bg-[#F6F7FB] rounded-3xl p-6 sm:p-8 text-slate-900 shadow-md min-h-[420px]">
          {/* ========== INFORMACIÓN ========== */}
          {tab === "informacion" && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Columna izquierda: tarjeta con imagen + descripción (similar a la que me enviaste) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="h-40 sm:h-48 bg-gradient-to-r from-[#7C4DFF] via-[#5C6BC0] to-[#42A5F5] flex items-center justify-center">
                    {informacion.fotoNombre ? (
                      <img
                        src={informacion.fotoNombre}
                        alt={informacion.nombreEvento ?? "Imagen del evento"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center px-6">
                        <p className="text-xs font-medium text-white/80 tracking-[0.2em] uppercase mb-1">
                          Evento académico
                        </p>
                        <p className="text-lg sm:text-xl font-semibold text-white">
                          {informacion.nombreEvento ?? "Evento sin título"}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-2">
                      Descripción
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                      {informacion.descripcion || "Sin descripción registrada."}
                    </p>
                  </div>
                </div>

                {/* Fechas, modalidad, etc., SOLO si están configuradas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {tieneFechasEvento && (
                    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="text-[11px] text-slate-500 mb-1">
                        Fechas del evento
                      </p>
                      <p className="font-semibold text-slate-800">
                        {informacion.fechaInicioEvento || "—"}{" "}
                        {informacion.fechaInicioEvento &&
                          informacion.fechaFinEvento && (
                            <span className="text-slate-400">a</span>
                          )}{" "}
                        {informacion.fechaFinEvento || ""}
                      </p>
                    </div>
                  )}

                  {tieneFechasInscripciones && (
                    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="text-[11px] text-slate-500 mb-1">
                        Inscripciones
                      </p>
                      <p className="font-semibold text-slate-800">
                        {informacion.fechaInicioInscripciones || "—"}{" "}
                        {informacion.fechaInicioInscripciones &&
                          informacion.fechaFinInscripciones && (
                            <span className="text-slate-400">a</span>
                          )}{" "}
                        {informacion.fechaFinInscripciones || ""}
                      </p>
                    </div>
                  )}

                  {tieneModalidad && (
                    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="text-[11px] text-slate-500 mb-1">
                        Modalidad de registro
                      </p>
                      <p className="font-semibold text-slate-800">
                        {participantes.modalidadRegistro === "equipos"
                          ? "Por equipos"
                          : "Individual"}
                      </p>
                    </div>
                  )}

                  {tieneMaxParticipantes && (
                    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="text-[11px] text-slate-500 mb-1">
                        Máx. participantes
                      </p>
                      <p className="font-semibold text-slate-800">
                        {participantes.maxParticipantes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna derecha: tarjetas de configuración clave, SOLO si hay algo configurado */}
              {tieneConfigClave && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Configuración clave
                  </h2>
                  <div className="space-y-2 text-xs">
                    {ajustes.tomarAsistenciaQR !== undefined && (
                      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-2 border border-slate-200">
                        <span className="text-slate-600">Asistencia por QR</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            ajustes.tomarAsistenciaQR
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {ajustes.tomarAsistenciaQR ? "Activa" : "No activa"}
                        </span>
                      </div>
                    )}
                    {ajustes.envioPorCorreo !== undefined && (
                      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-2 border border-slate-200">
                        <span className="text-slate-600">
                          Envío de constancias por correo
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            ajustes.envioPorCorreo
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {ajustes.envioPorCorreo
                            ? "Habilitado"
                            : "No habilitado"}
                        </span>
                      </div>
                    )}
                    {ajustes.costoInscripcion !== undefined && (
                      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-2 border border-slate-200">
                        <span className="text-slate-600">Costo inscripción</span>
                        <span className="font-semibold text-slate-800">
                          {ajustes.costoInscripcion &&
                          ajustes.costoInscripcion > 0
                            ? `$${ajustes.costoInscripcion} MXN`
                            : "Sin costo registrado"}
                        </span>
                      </div>
                    )}
                    {ajustes.medioEnvioQR && (
                      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-2 border border-slate-200">
                        <span className="text-slate-600">Medio envío QR</span>
                        <span className="font-semibold text-slate-800">
                          {ajustes.medioEnvioQR}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ========== EQUIPOS ========== */}
          {tab === "equipos" && (
            <>
              {esEquipos ? (
                <section>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">
                    Equipos del evento
                  </h2>
                  <p className="text-xs text-slate-600 mb-4">
                    Aquí se listarán los equipos registrados al evento, junto
                    con su categoría, integrantes y estatus. La lógica se
                    conectará posteriormente con las colecciones de Firebase.
                  </p>
                  <div className="border border-dashed border-slate-300 rounded-2xl px-6 py-10 bg-white/60 text-center text-sm text-slate-400">
                    Pendiente de integrar la tabla o grid de equipos
                    registrados.
                  </div>
                </section>
              ) : (
                <div className="text-sm text-slate-600 bg-white rounded-2xl px-6 py-6">
                  Este evento está configurado como <b>individual</b>; no hay
                  gestión de equipos.
                </div>
              )}
            </>
          )}

          {/* ========== PARTICIPANTES ========== */}
          {tab === "participantes" && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Configuración de participantes
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
                {tieneModalidad && (
                  <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Modalidad
                    </p>
                    <p className="font-semibold text-slate-800">
                      {participantes.modalidadRegistro === "equipos"
                        ? "Por equipos"
                        : "Individual"}
                    </p>
                  </div>
                )}
                {tieneMaxParticipantes && (
                  <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Máx. participantes
                    </p>
                    <p className="font-semibold text-slate-800">
                      {participantes.maxParticipantes}
                    </p>
                  </div>
                )}
              </div>

              {categorias.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    Categorías
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {categorias.map((cat) => (
                      <div
                        key={cat.id}
                        className="bg-white rounded-2xl border border-slate-200 px-4 py-3"
                      >
                        <p className="font-semibold text-slate-800">
                          {cat.nombre}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Cupo: {cat.cupo}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {categorias.length === 0 &&
                !tieneModalidad &&
                !tieneMaxParticipantes && (
                  <p className="text-xs text-slate-500">
                    No hay configuración adicional de participantes para este
                    evento.
                  </p>
                )}
            </section>
          )}

          {/* ========== PERSONAL ========== */}
          {tab === "personal" && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Personal del evento
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Solo se muestran los roles que fueron configurados durante la
                creación del evento.
              </p>

              {rolesPersonal.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No hay personal configurado para este evento.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {rolesPersonal.map((rol) => (
                    <div
                      key={rol.id}
                      className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex flex-col justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 mb-1">
                          {rol.nombre}
                        </p>
                        {rol.descripcion && (
                          <p className="text-[11px] text-slate-500">
                            {rol.descripcion}
                          </p>
                        )}
                      </div>
                      <div className="mt-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            rol.activo
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {rol.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ========== ASISTENCIAS ========== */}
          {tab === "asistencias" && (
            <>
              {tieneQR || tiempos.length > 0 ? (
                <section>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">
                    Asistencias por QR
                  </h2>
                  <p className="text-xs text-slate-600 mb-4">
                    Aquí se integrará el resumen de pases de lista, tiempos de
                    entrada/salida y el historial de lecturas de QR del evento.
                  </p>

                  {tiempos.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 text-xs mb-4">
                      <p className="font-semibold text-slate-800 mb-2">
                        Tiempos configurados
                      </p>
                      <ul className="space-y-1 text-slate-600">
                        {tiempos.map((t) => (
                          <li key={t.id} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#5B4AE5]" />
                            {t.etiqueta}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="border border-dashed border-slate-300 rounded-2xl px-6 py-8 bg-slate-50/80 text-center text-sm text-slate-400">
                    Aquí irá la tabla de registros de asistencia (participante,
                    hora de lectura, estado, etc.).
                  </div>
                </section>
              ) : (
                <div className="p-10 text-sm text-slate-600 bg-white rounded-2xl">
                  Este evento no tiene configurados tiempos de asistencia ni
                  registro por QR.
                </div>
              )}
            </>
          )}

          {/* ========== PLANTILLAS ========== */}
          {tab === "plantillas" && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Plantillas de constancias
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Aquí se vincularán las plantillas de constancias específicas
                para este evento (participantes, ganadores, jurado, staff,
                etc.). Solo se mostrarán las plantillas que se asocien al
                evento desde el módulo de diseño de plantillas.
              </p>
              <div className="border border-dashed border-slate-300 rounded-2xl px-6 py-10 bg-white/60 text-center text-sm text-slate-400">
                Pendiente de integrar con el módulo de plantillas y constancias.
              </div>
            </section>
          )}

          {/* ========== CONSTANCIAS ========== */}
          {tab === "constancias" && (
            <>
              {tieneEnvioCorreo ? (
                <section>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">
                    Constancias
                  </h2>
                  <p className="text-xs text-slate-600 mb-4">
                    En esta vista se integrará la selección de roles,
                    previsualización y envío de constancias por correo, además
                    del historial de envíos. Solo se mostrará para eventos que
                    tengan habilitado el envío por correo.
                  </p>
                  <div className="border border-dashed border-slate-300 rounded-2xl px-6 py-10 bg-white/60 text-center text-sm text-slate-400">
                    Aquí irá la tabla de participantes, el filtro por rol
                    (asistente, ganador, jurado, etc.) y el historial de envíos.
                  </div>
                </section>
              ) : (
                <div className="p-10 text-sm text-slate-600 bg-white rounded-2xl">
                  Este evento no tiene habilitado el envío de constancias por
                  correo.
                </div>
              )}
            </>
          )}

          {/* ========== FORMULARIO ========== */}
          {tab === "formulario" && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Formulario de registro
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Solo se listan los campos que fueron configurados para el
                formulario de registro de este evento.
              </p>

              {campos.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No hay campos configurados en el formulario.
                </p>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs bg-white">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold">
                          Nombre del campo
                        </th>
                        <th className="text-left px-4 py-2 font-semibold">
                          Tipo
                        </th>
                        <th className="text-left px-4 py-2 font-semibold">
                          Ejemplo
                        </th>
                        <th className="text-left px-4 py-2 font-semibold">
                          Obligatorio
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {campos.map((campo) => (
                        <tr
                          key={campo.id}
                          className="border-t border-slate-100"
                        >
                          <td className="px-4 py-2">
                            {campo.nombreCampo}
                            {campo.bloqueado && (
                              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                Bloqueado
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {campo.tipoCampo === "texto_corto" && "Texto corto"}
                            {campo.tipoCampo === "email" && "Email"}
                            {campo.tipoCampo === "telefono" && "Teléfono"}
                            {campo.tipoCampo === "seleccion_multiple" &&
                              "Selección múltiple"}
                          </td>
                          <td className="px-4 py-2">{campo.ejemplo}</td>
                          <td className="px-4 py-2">
                            {campo.obligatorio ? "Sí" : "No"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

// Export default por si lo importas así en algún lado
export default PaginaDetalleEventoAdminEventos;
