// src/modulos/administradorEventos/paginas/PaginaDetalleEventoAdminEventos.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
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

  const [equiposRegistrados, setEquiposRegistrados] = useState<number | null>(null);
  const [individualesCount, setIndividualesCount] = useState<number | null>(null);
  const [asesoresCount, setAsesoresCount] = useState<number | null>(null);
  const [personalCount, setPersonalCount] = useState<number | null>(null);

  type EquipoPreview = { id: string; nombre: string; institucion: string; fechaStr: string };
  const [equiposPreview, setEquiposPreview] = useState<EquipoPreview[]>([]);

  type Miembro = { nombre: string; apellidoPaterno: string; apellidoMaterno: string; rol: "Integrante" | "Lider" | "Asesor" };
  type EquipoDoc = { id: string; nombre: string; institucion: string; correo?: string; telefono?: string; numero?: string | number; miembros: Miembro[] };
  const [equipos, setEquipos] = useState<EquipoDoc[]>([]);
  const [buscar, setBuscar] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [openCrear, setOpenCrear] = useState(false);
  const [openDetalle, setOpenDetalle] = useState<EquipoDoc | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [fNombre, setFNombre] = useState("");
  const [fInstitucion, setFInstitucion] = useState("");
  const [fCorreo, setFCorreo] = useState("");
  const [fTelefono, setFTelefono] = useState("");
  const [mNombre, setMNombre] = useState("");
  const [mAP, setMAP] = useState("");
  const [mAM, setMAM] = useState("");
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [menuFila, setMenuFila] = useState<number | null>(null);

  const toDate = (v: unknown): Date | null => {
    if (!v) return null;
    if (typeof v === "string") {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof v === "object" && v !== null) {
      const maybe = v as { toDate?: () => Date; seconds?: number };
      if (typeof maybe.toDate === "function") {
        try {
          return maybe.toDate();
        } catch {
          return null;
        }
      }
      if (typeof maybe.seconds === "number") {
        return new Date(maybe.seconds * 1000);
      }
    }
    return null;
  };

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

  useEffect(() => {
    (async () => {
      if (!idEvento) return;
      try {
        const ref = doc(db, "eventos", idEvento);
        const snap = await getDoc(ref);
        const data = snap.data() as any;
        if (typeof data?.equiposRegistrados === "number") {
          setEquiposRegistrados(data.equiposRegistrados);
        }
        if (typeof data?.individuales === "number") {
          setIndividualesCount(data.individuales);
        }
        if (typeof data?.asesores === "number") {
          setAsesoresCount(data.asesores);
        }
        if (typeof data?.personal === "number") {
          setPersonalCount(data.personal);
        }

        const colRef = collection(db, "eventos", idEvento, "equipos");
        const equiposSnap = await getDocs(colRef);
        const rowsPrev: EquipoPreview[] = [];
        const equiposList: EquipoDoc[] = [];
        equiposSnap.forEach((d) => {
          const x = d.data() as Record<string, unknown>;
          const nombre = (x.nombreEquipo as string) || (x.nombre_equipo as string) || (x.nombre as string) || "";
          const institucion = (x.institucion as string) || (x.instituto as string) || (x.escuela as string) || "";
          const rawFecha = x.fechaRegistro ?? x.fecha_registro ?? x.creadoEn ?? x.createdAt ?? null;
          const fd = toDate(rawFecha);
          const fechaStr = fd ? fd.toLocaleDateString("es-MX") : "";
          rowsPrev.push({ id: d.id, nombre, institucion, fechaStr });
          const miembrosArr = Array.isArray(x.miembros) ? (x.miembros as any as Miembro[]) : [];
          const numero = (x.numero as string | number) ?? undefined;
          const correo = (x.correo as string) ?? undefined;
          const telefono = (x.telefono as string) ?? undefined;
          equiposList.push({ id: d.id, nombre, institucion, correo, telefono, numero, miembros: miembrosArr });
        });
        rowsPrev.sort((a, b) => {
          const aa = a.fechaStr ? new Date(a.fechaStr).getTime() : 0;
          const bb = b.fechaStr ? new Date(b.fechaStr).getTime() : 0;
          return bb - aa;
        });
        setEquiposPreview(rowsPrev.slice(0, 8));
        setEquipos(equiposList);
        const indiv = equiposList.reduce(
          (acc, e) => acc + e.miembros.filter((m) => m.rol === "Integrante" || m.rol === "Lider").length,
          0
        );
        const ases = equiposList.reduce(
          (acc, e) => acc + e.miembros.filter((m) => m.rol === "Asesor").length,
          0
        );
        setIndividualesCount(indiv);
        setAsesoresCount(ases);
        setEquiposRegistrados(rowsPrev.length);
        
      } catch {
        // silencioso
      }
    })();
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
  const tieneModalidad = participantes.modalidadRegistro !== undefined;
  const tieneMaxParticipantes =
    participantes.maxParticipantes !== undefined &&
    participantes.maxParticipantes !== null;

  // Tabs (algunas dependen de la configuración)
  const tabs: { id: Tab; label: string; visible: boolean }[] = [
    { id: "informacion", label: "Información", visible: true },
    {
      id: "equipos",
      label: "Equipos",
      visible:
        participantes.modalidadRegistro === "equipos" ||
        participantes.modalidadRegistro === undefined,
    },
    {
      id: "participantes",
      label: "Participantes",
      visible:
        participantes.modalidadRegistro === "individual" ||
        participantes.modalidadRegistro === undefined,
    },
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
    <div className="min-h-screen bg-[#EEF0F7] text-slate-900">
      {/* TopBar: gradiente con nombre centrado y botón volver */}
      <div className="bg-gradient-to-r from-[#192D69] to-[#6581D6] text-white shadow-md">
        <div className="relative px-6 sm:px-10 py-3">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/15 flex items-center justify-center text-xl leading-none hover:bg-white/25 transition"
            aria-label="Volver"
          >
            ←
          </button>
          <h1 className="text-center text-[18px] sm:text-[20px] font-semibold">
            {informacion.nombreEvento ?? "Evento sin título"}
          </h1>
        </div>
        {/* NavBar: segunda sección con tabs y underline */}
        <div className="bg-[#E9ECF6]">
          <nav className="px-4 sm:px-10">
            <ul className="flex items-center justify-around w-full py-2">
              {tabsVisibles.map((t) => {
                const activo = t.id === tab;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`text-sm font-semibold ${
                        activo ? "text-[#4D57D6]" : "text-slate-700"
                      }`}
                    >
                      {t.label}
                    </button>
                    {activo && (
                      <div className="h-1 rounded-full bg-[#7B5CFF] mt-1" />
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* CONTENIDO */}
      <main className="px-4 sm:px-10 lg:px-14 pb-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-md min-h-[420px]">
          {/* ========== INFORMACIÓN ========== */}
          {tab === "informacion" && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="h-40 w-full">
                    {informacion.fotoNombre ? (
                      <img src={informacion.fotoNombre} alt={informacion.nombreEvento ?? "Imagen del evento"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100" />
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
                    <p className="text-xs text-slate-600">{informacion.descripcion || ""}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Inicio del Evento</label>
                    <div className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-600">{informacion.fechaInicioEvento || ""}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Finalización del Evento</label>
                    <div className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg:white text-slate-600">{informacion.fechaFinEvento || ""}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de inicio de Inscripciones</label>
                    <div className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg:white text-slate-600">{informacion.fechaInicioInscripciones || ""}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de fin de Inscripciones</label>
                    <div className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg:white text-slate-600">{informacion.fechaFinInscripciones || ""}</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] text-slate-500">Equipos registrados</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">{equiposRegistrados ?? "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] text-slate-500">Individuales</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">{individualesCount ?? "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] text-slate-500">Asesores</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">{asesoresCount ?? "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] text-slate-500">Personal</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">{personalCount ?? "—"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Involucrados en total:</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {equiposRegistrados !== null && individualesCount !== null && asesoresCount !== null && personalCount !== null
                      ? (equiposRegistrados + individualesCount + asesoresCount + personalCount)
                      : "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] px-4 py-3 text-white text-xs font-semibold">Previsualización</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-500">
                          <th className="px-4 py-2">Nombre del equipo</th>
                          <th className="px-4 py-2">Instituto</th>
                          <th className="px-4 py-2">Día de registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equiposPreview.map((r) => (
                          <tr key={r.id} className="border-t border-slate-100">
                            <td className="px-4 py-2 text-slate-800">{r.nombre || ""}</td>
                            <td className="px-4 py-2 text-slate-600">{r.institucion || ""}</td>
                            <td className="px-4 py-2 text-slate-600">{r.fechaStr || ""}</td>
                          </tr>
                        ))}
                        {equiposPreview.length === 0 && (
                          <tr>
                            <td className="px-4 py-3 text-slate-500" colSpan={3}>No hay equipos registrados.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ========== EQUIPOS ========== */}
          {tab === "equipos" && (
            <>
              {esEquipos ? (
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Buscar"
                        className="w-full h-10 rounded-2xl border border-slate-300 bg-white px-4 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectionMode((v) => !v)}
                      className={`h-10 px-4 rounded-2xl text-sm font-semibold shadow-sm ${selectionMode ? "bg-[#4D57D6] text-white" : "bg-white border border-slate-300 text-slate-700"}`}
                    >
                      Seleccionar
                    </button>
                    <button
                      type="button"
                      disabled={!selectionMode || seleccionados.size === 0}
                      onClick={async () => {
                        if (!idEvento) return;
                        const ids = Array.from(seleccionados);
                        await Promise.all(ids.map((id) => deleteDoc(doc(db, "eventos", idEvento, "equipos", id))));
                        setEquipos((prev) => prev.filter((e) => !seleccionados.has(e.id)));
                        setSeleccionados(new Set());
                      }}
                      className={`h-10 px-4 rounded-2xl text-sm font-semibold shadow-sm ${selectionMode && seleccionados.size > 0 ? "bg-rose-500 text-white" : "bg-white border border-slate-300 text-slate-400"}`}
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenCrear(true);
                        setEditId(null);
                        setFNombre("");
                        setFInstitucion("");
                        setFCorreo("");
                        setFTelefono("");
                        setMiembros([]);
                        setMNombre("");
                        setMAP("");
                        setMAM("");
                      }}
                      className="h-10 px-4 rounded-2xl text-sm font-semibold shadow-sm bg-[#7B5CFF] text-white"
                    >
                      Nuevo Equipo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {equipos
                      .filter((e) => {
                        const q = buscar.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          e.nombre.toLowerCase().includes(q) ||
                          e.institucion.toLowerCase().includes(q)
                        );
                      })
                      .map((e) => {
                        const count = e.miembros.filter((m) => m.rol === "Integrante").length;
                        const asesor = e.miembros.find((m) => m.rol === "Asesor");
                        const checked = seleccionados.has(e.id);
                        return (
                          <div key={e.id} className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#5B4AE5] to-[#7B5CFF]" />
                            {selectionMode && (
                              <label className="absolute right-2 top-2 h-6 w-6 inline-flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(ev) => {
                                    setSeleccionados((prev) => {
                                      const next = new Set(prev);
                                      if (ev.target.checked) next.add(e.id);
                                      else next.delete(e.id);
                                      return next;
                                    });
                                  }}
                                />
                              </label>
                            )}
                            <button
                              type="button"
                              onClick={() => setOpenDetalle(e)}
                              className="w-full text-left p-4"
                            >
                              <p className="text-sm font-semibold text-slate-900">{e.nombre}</p>
                              <p className="text-xs text-slate-600">{e.institucion}</p>
                              <div className="mt-3 grid grid-cols-2 items-center">
                                <div className="text-xs text-slate-600">Integrantes</div>
                                <div className="text-xs text-slate-900 justify-self-end">{count}</div>
                              </div>
                              <div className="mt-1 grid grid-cols-2 items-center">
                                <div className="text-xs text-slate-600">Asesor</div>
                                <div className="text-xs text-slate-900 justify-self-end">{asesor ? `${asesor.nombre} ${asesor.apellidoPaterno} ${asesor.apellidoMaterno}` : ""}</div>
                              </div>
                              <div className="mt-3 text-[11px] font-semibold text-[#3156D6]">PARTICIPANTES</div>
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  {openCrear && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
                      <div className="w-[min(960px,95vw)] rounded-3xl bg-white shadow-xl p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Añadir equipo</h3>
                        <p className="text-xs text-slate-600 mb-4">En este apartado se agregará la información para la creación de un Nuevo equipo</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input value={fNombre} onChange={(e) => setFNombre(e.target.value)} placeholder="Nombre del Equipo" className="h-10 rounded-2xl border border-slate-300 px-4 text-sm" />
                          <input value={fInstitucion} onChange={(e) => setFInstitucion(e.target.value)} placeholder="Institución" className="h-10 rounded-2xl border border-slate-300 px-4 text-sm" />
                          <input value={fCorreo} onChange={(e) => setFCorreo(e.target.value)} placeholder="Correo" className="h-10 rounded-2xl border border-slate-300 px-4 text-sm" />
                          <input value={fTelefono} onChange={(e) => setFTelefono(e.target.value)} placeholder="Teléfono" className="h-10 rounded-2xl border border-slate-300 px-4 text-sm" />
                        </div>
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-slate-900 mb-2">Añadir integrante</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input value={mNombre} onChange={(e) => setMNombre(e.target.value)} placeholder="Nombre" className="h-10 rounded-2xl border border-slate-300 px-4 text-sm" />
                            <input value={mAP} onChange={(e) => setMAP(e.target.value)} placeholder="Apellido Paterno" className="h-10 rounded-2xl border border-slate-300 px-4 text-sm" />
                            <div className="flex items-center gap-2">
                              <input value={mAM} onChange={(e) => setMAM(e.target.value)} placeholder="Apellido Materno" className="h-10 flex-1 rounded-2xl border border-slate-300 px-4 text-sm" />
                              <button type="button" onClick={() => {
                                if (!mNombre.trim() || !mAP.trim() || !mAM.trim()) return;
                                setMiembros((prev) => [...prev, { nombre: mNombre.trim(), apellidoPaterno: mAP.trim(), apellidoMaterno: mAM.trim(), rol: "Integrante" }]);
                                setMNombre("");
                                setMAP("");
                                setMAM("");
                              }} className="h-10 w-10 rounded-2xl bg-[#7B5CFF] text-white font-bold">+</button>
                            </div>
                          </div>
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-slate-500">
                                <th className="px-4 py-2">Nombre</th>
                                <th className="px-4 py-2">Apellido Paterno</th>
                                <th className="px-4 py-2">Apellido Materno</th>
                                <th className="px-4 py-2">Rol</th>
                                <th className="px-2 py-2" />
                              </tr>
                            </thead>
                            <tbody>
                              {miembros.map((m, idx) => (
                                <tr key={idx} className="border-t border-slate-100">
                                  <td className="px-4 py-2">
                                    <input value={m.nombre} onChange={(e) => {
                                      const v = e.target.value;
                                      setMiembros((prev) => prev.map((mm, i) => i === idx ? { ...mm, nombre: v } : mm));
                                    }} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm" />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input value={m.apellidoPaterno} onChange={(e) => {
                                      const v = e.target.value;
                                      setMiembros((prev) => prev.map((mm, i) => i === idx ? { ...mm, apellidoPaterno: v } : mm));
                                    }} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm" />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input value={m.apellidoMaterno} onChange={(e) => {
                                      const v = e.target.value;
                                      setMiembros((prev) => prev.map((mm, i) => i === idx ? { ...mm, apellidoMaterno: v } : mm));
                                    }} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm" />
                                  </td>
                                  <td className="px-4 py-2">
                                    <select value={m.rol} onChange={(e) => {
                                      const v = e.target.value as Miembro["rol"];
                                      setMiembros((prev) => prev.map((mm, i) => i === idx ? { ...mm, rol: v } : mm));
                                    }} className="h-9 rounded-xl border border-slate-200 px-3 text-sm">
                                      <option>Integrante</option>
                                      <option>Lider</option>
                                      <option>Asesor</option>
                                    </select>
                                  </td>
                                  <td className="px-2 py-2">
                                    <button type="button" onClick={() => setMenuFila(idx)} className="h-8 w-8 rounded-full bg-slate-100">⋯</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {menuFila !== null && (
                          <div className="fixed inset-0 z-50" onClick={() => setMenuFila(null)}>
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 bg-white rounded-xl border border-slate-200 shadow-md text-sm">
                              <button className="block px-4 py-2 w-full text-left" onClick={() => setMenuFila(null)}>Editar usuario</button>
                              <button className="block px-4 py-2 w-full text-left" onClick={() => {
                                setMiembros((prev) => prev.filter((_, i) => i !== menuFila));
                                setMenuFila(null);
                              }}>Eliminar</button>
                              <button className="block px-4 py-2 w-full text-left" onClick={() => {
                                if (menuFila === null) return;
                                setMiembros((prev) => prev.map((mm, i) => i === menuFila ? { ...mm, rol: "Lider" } : mm));
                                setMenuFila(null);
                              }}>Asignar como líder</button>
                              <button className="block px-4 py-2 w-full text-left" onClick={() => {
                                if (menuFila === null) return;
                                setMiembros((prev) => prev.map((mm, i) => i === menuFila ? { ...mm, rol: "Asesor" } : mm));
                                setMenuFila(null);
                              }}>Asignar como asesor</button>
                            </div>
                          </div>
                        )}
                        <div className="mt-6 flex justify-end gap-3">
                          <button type="button" onClick={() => { setOpenCrear(false); setEditId(null); }} className="h-10 px-5 rounded-2xl bg-slate-100 text-slate-700">Cancelar</button>
                          <button type="button" onClick={async () => {
                            if (!idEvento) return;
                            const payload: Record<string, unknown> = {
                              nombreEquipo: fNombre.trim(),
                              institucion: fInstitucion.trim(),
                              correo: fCorreo.trim(),
                              telefono: fTelefono.trim(),
                              miembros,
                              fechaRegistro: serverTimestamp(),
                            };
                            if (editId) {
                              await updateDoc(doc(db, "eventos", idEvento, "equipos", editId), payload);
                            } else {
                              await addDoc(collection(db, "eventos", idEvento, "equipos"), payload);
                            }
                            setOpenCrear(false);
                            setEditId(null);
                            const equiposSnap2 = await getDocs(collection(db, "eventos", idEvento, "equipos"));
                            const equiposList2: any[] = [];
                            equiposSnap2.forEach((d) => {
                              const x = d.data() as any;
                              const nombre = x.nombreEquipo || x.nombre || "";
                              const institucion = x.institucion || x.instituto || x.escuela || "";
                              const miembrosArr = Array.isArray(x.miembros) ? (x.miembros as Miembro[]) : [];
                              equiposList2.push({ id: d.id, nombre, institucion, correo: x.correo, telefono: x.telefono, numero: x.numero, miembros: miembrosArr });
                            });
                            setEquipos(equiposList2 as EquipoDoc[]);
                          }} className="h-10 px-5 rounded-2xl bg-[#7B5CFF] text-white">Aceptar</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {openDetalle && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
                      <div className="w-[min(920px,95vw)] rounded-3xl bg-white shadow-xl p-6 relative">
                        <div className="absolute right-6 top-6 flex items-center gap-2">
                          <button className="h-9 px-3 rounded-2xl bg-indigo-100 text-indigo-700 text-sm font-semibold" onClick={() => {
                            setOpenCrear(true);
                            setEditId(openDetalle.id);
                            setFNombre(openDetalle.nombre);
                            setFInstitucion(openDetalle.institucion);
                            setFCorreo(openDetalle.correo || "");
                            setFTelefono(openDetalle.telefono || "");
                            setMiembros(openDetalle.miembros);
                            setOpenDetalle(null);
                          }}>Editar</button>
                          <button className="h-9 px-3 rounded-2xl bg-rose-500 text-white text-sm font-semibold" onClick={async () => {
                            if (!idEvento || !openDetalle) return;
                            await deleteDoc(doc(db, "eventos", idEvento, "equipos", openDetalle.id));
                            setEquipos((prev) => prev.filter((x) => x.id !== openDetalle.id));
                            setOpenDetalle(null);
                          }}>Eliminar</button>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">{openDetalle.nombre}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input value={openDetalle.institucion || ""} readOnly className="h-10 rounded-2xl border border-slate-300 px-4 text-sm" />
                          <input value={openDetalle.telefono || ""} readOnly className="h-10 rounded-2xl border border-slate-300 px-4 text-sm" />
                          <input value={openDetalle.correo || ""} readOnly className="h-10 rounded-2xl border border-slate-300 px-4 text-sm" />
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-slate-500">
                                <th className="px-4 py-2">Nombre</th>
                                <th className="px-4 py-2">Apellido Paterno</th>
                                <th className="px-4 py-2">Apellido Materno</th>
                                <th className="px-4 py-2">Rol</th>
                              </tr>
                            </thead>
                            <tbody>
                              {openDetalle.miembros.map((m, i) => (
                                <tr key={i} className="border-t border-slate-100">
                                  <td className="px-4 py-2 text-slate-800">{m.nombre}</td>
                                  <td className="px-4 py-2 text-slate-800">{m.apellidoPaterno}</td>
                                  <td className="px-4 py-2 text-slate-800">{m.apellidoMaterno}</td>
                                  <td className="px-4 py-2 text-slate-800">{m.rol}</td>
                                </tr>
                              ))}
                              {openDetalle.miembros.length === 0 && (
                                <tr>
                                  <td className="px-4 py-3 text-slate-500" colSpan={4}>Sin integrantes</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button className="h-10 px-5 rounded-2xl bg-slate-100 text-slate-700" onClick={() => setOpenDetalle(null)}>Salir</button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              ) : (
                <div className="text-sm text-slate-600 bg-white rounded-2xl px-6 py-6">Este evento está configurado como <b>individual</b>; no hay gestión de equipos.</div>
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
