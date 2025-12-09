import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// 🔹 Firebase
import { db } from "../../../../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";

// 🔹 Utilidad para fechas (convierte Timestamp / {seconds,nanoseconds} a string)
import { toDisplayDate } from "../../../../../utils/fechasFirestore";

// Defaults de ejemplo (solo se usan si no hay datos en BD)
const DEFAULT_NOMBRE = "Concurso de robótica junior";
const DEFAULT_DESCRIPCION =
  "El Concurso de Robótica es un evento académico donde estudiantes compiten diseñando, construyendo y programando robots para superar retos técnicos.";
const DEFAULT_FECHA_INICIO_EVENTO = "16/12/2024";
const DEFAULT_FECHA_FIN_EVENTO = "17/12/2024";
const DEFAULT_FECHA_INICIO_INSCRIPCIONES = "08/12/2024";
const DEFAULT_FECHA_FIN_INSCRIPCIONES = "15/12/2024";

const formatFecha = (raw: any): string => {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  return toDisplayDate(raw);
};

interface EquipoPreview {
  id: string;
  nombreEquipo: string;
  institucion: string;
  fechaRegistro: string;
}

const SeccionInformacionDesenglose: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const idEvento = id ?? null;

  const [openDelete, setOpenDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Campos del evento
  const [nombreEvento, setNombreEvento] = useState(DEFAULT_NOMBRE);
  const [descripcion, setDescripcion] = useState(DEFAULT_DESCRIPCION);
  const [fechaInicioEvento, setFechaInicioEvento] = useState(
    DEFAULT_FECHA_INICIO_EVENTO,
  );
  const [fechaFinEvento, setFechaFinEvento] = useState(
    DEFAULT_FECHA_FIN_EVENTO,
  );
  const [fechaInicioInscripciones, setFechaInicioInscripciones] = useState(
    DEFAULT_FECHA_INICIO_INSCRIPCIONES,
  );
  const [fechaFinInscripciones, setFechaFinInscripciones] = useState(
    DEFAULT_FECHA_FIN_INSCRIPCIONES,
  );

  // Métricas (ahora se llenan desde BD)
  const [equiposRegistrados, setEquiposRegistrados] = useState<number>(0);
  const [individuales, setIndividuales] = useState<number>(0);
  const [asesores, setAsesores] = useState<number>(0);
  const [personal, setPersonal] = useState<number>(0);

  // Tabla de previsualización de equipos
  const [equiposPreview, setEquiposPreview] = useState<EquipoPreview[]>([]);

  const totalInvolucrados =
    equiposRegistrados + individuales + asesores + personal;

  // 🔹 Cargar datos del evento + equipos desde Firestore
  useEffect(() => {
    const cargar = async () => {
      if (!idEvento) {
        setCargando(false);
        return;
      }
      try {
        setCargando(true);
        setError(null);

        // -------- Documento principal del evento --------
        const eventoRef = doc(db, "eventos", idEvento);
        const snap = await getDoc(eventoRef);

        if (!snap.exists()) {
          setError(
            "No se encontró información del evento en la base de datos.",
          );
          setCargando(false);
          return;
        }

        const data = snap.data() as any;
        const info = data.config?.infoEvento ?? data.infoEvento ?? {};

        const nombre =
          info.nombre ??
          data.nombre_evento ??
          data.nombre ??
          DEFAULT_NOMBRE;
        setNombreEvento(nombre);

        const desc =
          info.descripcion ?? data.descripcion ?? DEFAULT_DESCRIPCION;
        setDescripcion(desc);

        const rawFechaInicioEvento =
          info.fechaInicioEvento ??
          data.fecha_inicio_evento ??
          data.fechaInicioEvento;
        if (rawFechaInicioEvento) {
          setFechaInicioEvento(formatFecha(rawFechaInicioEvento));
        }

        const rawFechaFinEvento =
          info.fechaFinEvento ??
          data.fecha_fin_evento ??
          data.fechaFinEvento;
        if (rawFechaFinEvento) {
          setFechaFinEvento(formatFecha(rawFechaFinEvento));
        }

        const rawFechaInicioInscripciones =
          info.fechaInicioInscripciones ??
          data.fecha_inicio_inscripciones ??
          data.fechaInicioInscripciones;
        if (rawFechaInicioInscripciones) {
          setFechaInicioInscripciones(
            formatFecha(rawFechaInicioInscripciones),
          );
        }

        const rawFechaFinInscripciones =
          info.fechaFinInscripciones ??
          data.fecha_fin_inscripciones ??
          data.fechaFinInscripciones;
        if (rawFechaFinInscripciones) {
          setFechaFinInscripciones(
            formatFecha(rawFechaFinInscripciones),
          );
        }

        // Métricas: si ya las guardas en el doc, las usamos.
        if (typeof data.equiposRegistrados === "number") {
          setEquiposRegistrados(data.equiposRegistrados);
        }
        if (typeof data.individuales === "number") {
          setIndividuales(data.individuales);
        }
        if (typeof data.asesores === "number") {
          setAsesores(data.asesores);
        }
        if (typeof data.personal === "number") {
          setPersonal(data.personal);
        }

        // -------- Colección de equipos para previsualización --------
        const equiposRef = collection(db, "eventos", idEvento, "equipos");
        const equiposSnap = await getDocs(equiposRef);

        const listaEquipos: EquipoPreview[] = [];
        equiposSnap.forEach((docSnap) => {
          const d = docSnap.data() as any;

          const nombreEquipo: string =
            d.nombreEquipo ??
            d.nombre_equipo ??
            d.nombre ??
            "Equipo sin nombre";

          const institucion: string =
            d.institucion ??
            d.instituto ??
            d.escuela ??
            "Institución no especificada";

          const rawFecha =
            d.fechaRegistro ??
            d.fecha_registro ??
            d.creadoEn ??
            d.createdAt ??
            null;

          const fechaRegistro = rawFecha ? formatFecha(rawFecha) : "";

          listaEquipos.push({
            id: docSnap.id,
            nombreEquipo,
            institucion,
            fechaRegistro,
          });
        });

        setEquiposPreview(listaEquipos);

        // Si no traías equiposRegistrados en el doc, usamos el tamaño real
        if (typeof data.equiposRegistrados !== "number") {
          setEquiposRegistrados(listaEquipos.length);
        }
      } catch (e) {
        console.error(
          "[SeccionInformacionDesenglose] Error al cargar evento:",
          e,
        );
        setError("Ocurrió un error al cargar los datos del evento.");
      } finally {
        setCargando(false);
      }
    };

    void cargar();
  }, [idEvento]);

  const guardarCambios = async () => {
    if (!idEvento) return;
    try {
      setGuardando(true);
      setError(null);

      const eventoRef = doc(db, "eventos", idEvento);
      await updateDoc(eventoRef, {
        nombre_evento: nombreEvento.trim(),
        descripcion: descripcion.trim(),
        fecha_inicio_evento: fechaInicioEvento.trim(),
        fecha_fin_evento: fechaFinEvento.trim(),
        fecha_inicio_inscripciones: fechaInicioInscripciones.trim(),
        fecha_fin_inscripciones: fechaFinInscripciones.trim(),
        equiposRegistrados,
        individuales,
        asesores,
        personal,
      });
    } catch (e) {
      console.error(
        "[SeccionInformacionDesenglose] Error al guardar cambios:",
        e,
      );
      setError("Ocurrió un error al guardar los cambios del evento.");
    } finally {
      setGuardando(false);
    }
  };

  const handleClickEditar = async () => {
    if (!editing) {
      setEditing(true);
      return;
    }
    await guardarCambios();
    setEditing(false);
  };

  const handleConfirmDelete = async () => {
    const ok = window.confirm(
      "¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.",
    );
    if (!ok) return;

    try {
      if (idEvento) {
        const eventoRef = doc(db, "eventos", idEvento);
        await deleteDoc(eventoRef);
      }
      navigate("/admin-eventos/lista");
    } catch (e) {
      console.error(
        "[SeccionInformacionDesenglose] Error al eliminar evento:",
        e,
      );
      alert("Ocurrió un error al eliminar el evento. Intenta de nuevo.");
    }
  };

  if (cargando) {
    return (
      <section className="px-6 sm:px-10 py-6">
        <p className="text-sm text-slate-500">
          Cargando información del evento...
        </p>
      </section>
    );
  }

  return (
    <section className="px-6 sm:px-10 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          {nombreEvento}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClickEditar}
            disabled={guardando}
            className={`px-4 py-2 rounded-full text-xs font-semibold shadow-sm transform-gpu transition hover:-translate-y-[1px] hover:scale-[1.02] ${
              editing
                ? "bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            } disabled:opacity-60`}
          >
            {editing ? (guardando ? "Guardando..." : "Guardar") : "Editar"}
          </button>
          <button
            type="button"
            onClick={() => setOpenDelete(true)}
            className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-sm transform-gpu transition hover:brightness-110 hover:-translate-y-[1px] hover:scale-[1.02]"
          >
            Eliminar Evento
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Izquierda: imagen + descripcion + fechas */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <img
              src="/Concurso.png"
              alt="Poster"
              className="w-full h-40 object-cover"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción<span className="text-red-500">*</span>
            </label>
            {editing ? (
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
              />
            ) : (
              <p className="text-xs text-slate-600">{descripcion}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Inicio del Evento
              </label>
              {editing ? (
                <input
                  type="text"
                  value={fechaInicioEvento}
                  onChange={(e) => setFechaInicioEvento(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                  placeholder="16/12/2024"
                />
              ) : (
                <div className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-600">
                  {fechaInicioEvento}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Finalización del Evento
              </label>
              {editing ? (
                <input
                  type="text"
                  value={fechaFinEvento}
                  onChange={(e) => setFechaFinEvento(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                  placeholder="17/12/2024"
                />
              ) : (
                <div className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-600">
                  {fechaFinEvento}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de inicio de Inscripciones
              </label>
              {editing ? (
                <input
                  type="text"
                  value={fechaInicioInscripciones}
                  onChange={(e) =>
                    setFechaInicioInscripciones(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                  placeholder="08/12/2024"
                />
              ) : (
                <div className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-600">
                  {fechaInicioInscripciones}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de fin de Inscripciones
              </label>
              {editing ? (
                <input
                  type="text"
                  value={fechaFinInscripciones}
                  onChange={(e) =>
                    setFechaFinInscripciones(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                  placeholder="15/12/2024"
                />
              ) : (
                <div className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-600">
                  {fechaFinInscripciones}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Derecha: métricas + previsualización */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] text-slate-500">
                Equipos registrados
              </p>
              <p className="text-xl font-semibold text-slate-900 mt-1">
                {equiposRegistrados}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] text-slate-500">Individuales</p>
              <p className="text-xl font-semibold text-slate-900 mt-1">
                {individuales}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] text-slate-500">Asesores</p>
              <p className="text-xl font-semibold text-slate-900 mt-1">
                {asesores}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] text-slate-500">Personal</p>
              <p className="text-xl font-semibold text-slate-900 mt-1">
                {personal}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">
                  Previsualización
                </p>
                <span className="text-sm">
                  Involucrados en total:{" "}
                  <strong>{totalInvolucrados}</strong>
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <button className="text-xs font-semibold text-white relative">
                  Equipos
                  <span className="absolute left-0 right-0 -bottom-1 h-1 rounded-full bg-white/80" />
                </button>
                <button className="text-xs text-white/80 hover:text-white">
                  Personal
                </button>
              </div>
            </div>
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
                  {equiposPreview.length === 0 ? (
                    <tr className="border-t border-slate-100">
                      <td
                        className="px-4 py-3 text-slate-500 text-xs"
                        colSpan={3}
                      >
                        Aún no hay equipos registrados para este evento.
                      </td>
                    </tr>
                  ) : (
                    equiposPreview.map((eq) => (
                      <tr
                        key={eq.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-2 text-slate-800">
                          {eq.nombreEquipo}
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          {eq.institucion}
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          {eq.fechaRegistro || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {openDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenDelete(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Eliminar evento
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Esta acción eliminará el evento. ¿Estás seguro de
              continuar?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpenDelete(false)}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SeccionInformacionDesenglose;
