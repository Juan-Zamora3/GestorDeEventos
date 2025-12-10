import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { db } from "../../../../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  cargarConfigEvento,
  actualizarInfoEvento,
  eliminarEvento,
} from "../../../../../api/eventosAdminEventosApi";

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
  const [nombreEvento, setNombreEvento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicioEvento, setFechaInicioEvento] = useState("");
  const [fechaFinEvento, setFechaFinEvento] = useState("");
  const [fechaInicioInscripciones, setFechaInicioInscripciones] =
    useState("");
  const [fechaFinInscripciones, setFechaFinInscripciones] =
    useState("");

  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  // Métricas
  const [equiposRegistrados, setEquiposRegistrados] = useState<number>(0);
  const [individuales, setIndividuales] = useState<number>(0);
  const [asesores, setAsesores] = useState<number>(0);
  const [personal, setPersonal] = useState<number>(0);

  const totalInvolucrados =
    equiposRegistrados + individuales + asesores + personal;

  // 🔹 Cargar datos del evento desde Firestore
  useEffect(() => {
    const cargar = async () => {
      if (!idEvento) {
        setCargando(false);
        return;
      }
      try {
        setCargando(true);
        setError(null);

        const cfg = await cargarConfigEvento(idEvento);
        if (!cfg) {
          setError("No se encontró información del evento en la base de datos.");
          setCargando(false);
          return;
        }

        setNombreEvento(cfg.infoEvento.nombre);
        setDescripcion(cfg.infoEvento.descripcion ?? "");
        setFechaInicioEvento(cfg.infoEvento.fechaInicioEvento ?? "");
        setFechaFinEvento(cfg.infoEvento.fechaFinEvento ?? "");
        setFechaInicioInscripciones(
          cfg.infoEvento.fechaInicioInscripciones ?? "",
        );
        setFechaFinInscripciones(cfg.infoEvento.fechaFinInscripciones ?? "");
        setPosterUrl(cfg.infoEvento.imagenPortadaUrl ?? "/Concurso.png");

        // Métricas desde subcolecciones
        const [equiposSnap, participantesSnap, personalSnap] =
          await Promise.all([
            getDocs(collection(db, "eventos", idEvento, "equipos")),
            getDocs(collection(db, "eventos", idEvento, "participantes")),
            getDocs(collection(db, "eventos", idEvento, "personal")),
          ]);

        setEquiposRegistrados(equiposSnap.size);

        let individualesCount = 0;
        let asesoresCount = 0;

        participantesSnap.forEach((d) => {
          const data = d.data() as any;
          if (data.rol === "asesor") asesoresCount += 1;
          else individualesCount += 1;
        });

        setIndividuales(individualesCount);
        setAsesores(asesoresCount);
        setPersonal(personalSnap.size);
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

      await actualizarInfoEvento(
        idEvento,
        {
          nombre: nombreEvento.trim(),
          descripcion: descripcion.trim(),
          fechaInicioEvento: fechaInicioEvento.trim(),
          fechaFinEvento: fechaFinEvento.trim(),
          fechaInicioInscripciones: fechaInicioInscripciones.trim(),
          fechaFinInscripciones: fechaFinInscripciones.trim(),
        },
        {
          uid: "demo-admin-eventos",
          nombre: "Admin de eventos",
          correo: "admin@ejemplo.com",
        },
      );
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
    if (!ok || !idEvento) return;

    try {
      await eliminarEvento(idEvento, {
        uid: "demo-admin-eventos",
        nombre: "Admin de eventos",
        correo: "admin@ejemplo.com",
      });
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
        <p className="mb-4 text-xs font-semibold text-rose-600">{error}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Izquierda: imagen + descripcion + fechas */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <img
              src={posterUrl ?? "/Concurso.png"}
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
            {/* fechas */}
            {/* ... igual que ya tenías, usando fechaInicioEvento etc */}
          </div>
        </div>

        {/* Derecha: métricas + previsualización */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* tarjetas de métricas con equiposRegistrados, individuales, asesores, personal */}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">Previsualización</p>
                <span className="text-sm">
                  Involucrados en total: <strong>{totalInvolucrados}</strong>
                </span>
              </div>
              {/* Tabs Equipos / Personal como ya los tenías */}
            </div>
            {/* tabla de ejemplo o tabla real si ya tienes datos */}
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
              Esta acción eliminará el evento. ¿Estás seguro de continuar?
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
