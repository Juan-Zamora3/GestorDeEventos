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
    fotoNombre?: string | null;
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
  const navigate = useNavigate();

  // 👇 Leemos cualquier variante razonable del parámetro
  const params = useParams();
  const idEvento =
    (params as any).idEvento ?? (params as any).id ?? undefined;

  const [evento, setEvento] = useState<EventoConfig | null>(null);
  const [tab, setTab] = useState<Tab>("informacion");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      if (!idEvento) {
        setError("No se encontró el identificador del evento en la URL.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError(null);

        console.log("[Detalle AdminEventos] params:", params, "idEvento:", idEvento);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const tabs: { id: Tab; label: string }[] = [
    { id: "informacion", label: "Información" },
    { id: "equipos", label: "Equipos" },
    { id: "participantes", label: "Participantes" },
    { id: "personal", label: "Personal" },
    { id: "asistencias", label: "Asistencias" },
    { id: "plantillas", label: "Plantillas" },
    { id: "constancias", label: "Constancias" },
    { id: "formulario", label: "Formulario" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#192D69] to-[#476AC6] text-white">
      {/* HEADER + TABS */}
      <header className="px-14 pt-10 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center text-2xl leading-none"
          >
            ←
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-white/70 mb-1">
              Administrador de eventos
            </p>
            <h1 className="text-[32px] font-semibold tracking-tight">
              {informacion.nombreEvento ?? "Evento sin título"}
            </h1>
            <p className="text-xs text-white/70 mt-1">
              {informacion.fechaInicioEvento} – {informacion.fechaFinEvento}
            </p>
          </div>
        </div>

        <nav className="mt-4">
          <div className="inline-flex bg-white/10 rounded-full p-1 backdrop-blur-sm">
            {tabs.map((t) => {
              const activo = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
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
      <main className="px-14 pb-10">
        <div className="bg-[#F6F7FB] rounded-3xl p-8 text-slate-900 shadow-md min-h-[420px]">
          {/* INFORMACIÓN */}
          {tab === "informacion" && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">
                  Detalles del evento
                </h2>
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {informacion.descripcion || "Sin descripción registrada."}
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Fechas del evento
                    </p>
                    <p className="font-semibold text-slate-800">
                      {informacion.fechaInicioEvento || "—"}{" "}
                      <span className="text-slate-400">a</span>{" "}
                      {informacion.fechaFinEvento || "—"}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Inscripciones
                    </p>
                    <p className="font-semibold text-slate-800">
                      {informacion.fechaInicioInscripciones || "—"}{" "}
                      <span className="text-slate-400">a</span>{" "}
                      {informacion.fechaFinInscripciones || "—"}
                    </p>
                  </div>
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
                  <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Máx. participantes
                    </p>
                    <p className="font-semibold text-slate-800">
                      {participantes.maxParticipantes
                        ? participantes.maxParticipantes
                        : "Sin límite definido"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  Configuración clave
                </h2>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center justify-between bg-white rounded-2xl px-4 py-2 border border-slate-200">
                    <span className="text-slate-600">Asistencia por QR</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        tieneQR
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tieneQR ? "Activa" : "No activa"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-2xl px-4 py-2 border border-slate-200">
                    <span className="text-slate-600">
                      Envío de constancias por correo
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        tieneEnvioCorreo
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tieneEnvioCorreo ? "Habilitado" : "No habilitado"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-2xl px-4 py-2 border border-slate-200">
                    <span className="text-slate-600">Costo inscripción</span>
                    <span className="font-semibold text-slate-800">
                      {ajustes.costoInscripcion &&
                      ajustes.costoInscripcion > 0
                        ? `$${ajustes.costoInscripcion} MXN`
                        : "Sin costo registrado"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-2xl px-4 py-2 border border-slate-200">
                    <span className="text-slate-600">Medio envío QR</span>
                    <span className="font-semibold text-slate-800">
                      {ajustes.medioEnvioQR || "No especificado"}
                    </span>
                  </li>
                </ul>
              </div>
            </section>
          )}

          {/* EQUIPOS */}
          {tab === "equipos" && (
            <>
              {esEquipos ? (
                <section>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">
                    Equipos del evento
                  </h2>
                  <p className="text-xs text-slate-600 mb-4">
                    En esta sección se listarán los equipos registrados al
                    evento, junto con su categoría, integrantes y estatus.
                  </p>
                  <div className="border border-dashed border-slate-300 rounded-2xl px-6 py-10 bg-white/60 text-center text-sm text-slate-400">
                    Aún no se han integrado los datos de equipos desde la
                    colección de Firebase. Aquí irá la tabla o grid de equipos.
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

          {/* PARTICIPANTES */}
          {tab === "participantes" && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Configuración de participantes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
                <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                  <p className="text-[11px] text-slate-500 mb-1">Modalidad</p>
                  <p className="font-semibold text-slate-800">
                    {participantes.modalidadRegistro === "equipos"
                      ? "Por equipos"
                      : "Individual"}
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                  <p className="text-[11px] text-slate-500 mb-1">
                    Máx. participantes
                  </p>
                  <p className="font-semibold text-slate-800">
                    {participantes.maxParticipantes
                      ? participantes.maxParticipantes
                      : "Sin límite definido"}
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Categorías
              </h3>
              {categorias.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No se han configurado categorías para este evento.
                </p>
              ) : (
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
              )}
            </section>
          )}

          {/* PERSONAL */}
          {tab === "personal" && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Personal del evento
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Estos roles se configuraron en el wizard de creación del evento.
                Posteriormente podrás asociar personas a cada rol.
              </p>

              {rolesPersonal.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No hay roles de personal configurados.
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
                        <p className="text-[11px] text-slate-500">
                          {rol.descripcion || "Sin descripción."}
                        </p>
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

          {/* ASISTENCIAS */}
          {tab === "asistencias" && (
            <>
              {tieneQR ? (
                <section>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">
                    Asistencias por QR
                  </h2>
                  <p className="text-xs text-slate-600 mb-4">
                    Aquí se mostrará el resumen de pases de lista, tiempos de
                    entrada/salida y el historial de lecturas de QR del evento.
                  </p>

                  <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 text-xs">
                    <p className="font-semibold text-slate-800 mb-2">
                      Tiempos configurados
                    </p>
                    {tiempos.length === 0 ? (
                      <p className="text-[11px] text-slate-500">
                        No se han configurado tiempos de asistencia en el
                        evento.
                      </p>
                    ) : (
                      <ul className="space-y-1 text-slate-600">
                        {tiempos.map((t) => (
                          <li
                            key={t.id}
                            className="flex items-center gap-2"
                          >
                            <span className="h-2 w-2 rounded-full bg-[#5B4AE5]" />
                            {t.etiqueta}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-4 border border-dashed border-slate-300 rounded-2xl px-6 py-8 bg-slate-50/80 text-center text-sm text-slate-400">
                    Aquí irá la tabla de registros de asistencia (participante,
                    hora de lectura, estado, etc.).
                  </div>
                </section>
              ) : (
                <div className="p-10 text-sm text-slate-600 bg-white rounded-2xl">
                  Este evento no tiene activado el registro por QR.
                </div>
              )}
            </>
          )}

          {/* PLANTILLAS */}
          {tab === "plantillas" && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Plantillas de constancias
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Desde aquí se vincularán las plantillas de constancias
                específicas para este evento (participantes, ganadores, jurado,
                staff, etc.).
              </p>
              <div className="border border-dashed border-slate-300 rounded-2xl px-6 py-10 bg-white/60 text-center text-sm text-slate-400">
                Pendiente de integrar con el módulo de plantillas y constancias.
                Aquí se mostrarán las plantillas asociadas al evento.
              </div>
            </section>
          )}

          {/* CONSTANCIAS */}
          {tab === "constancias" && (
            <>
              {tieneEnvioCorreo ? (
                <section>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">
                    Constancias
                  </h2>
                  <p className="text-xs text-slate-600 mb-4">
                    En este apartado se integrará la vista de selección de
                    roles, previsualización y envío de constancias por correo,
                    además del historial de envíos.
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

          {/* FORMULARIO */}
          {tab === "formulario" && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Formulario de registro
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Estos son los campos que se capturan cuando una persona se
                registra al evento.
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
                          Nombre del Campo
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
                            {campo.tipoCampo === "texto_corto" &&
                              "Texto corto"}
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

export default PaginaDetalleEventoAdminEventos;
