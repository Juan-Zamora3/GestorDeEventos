// src/modulos/administradorEventos/componentes/desengloseEvento/ModalCrearEquipo.tsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../../../firebase/firebaseConfig"; // 🔹 ajusta esta ruta según tu proyecto
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

interface Props {
  onClose: () => void;
  /**
   * Opcional: si quieres pasar el id del evento manualmente
   * y no depender solo del useParams.
   */
  idEvento?: string;
  /**
   * Callback opcional para avisar al padre que se creó un equipo.
   */
  onEquipoCreado?: (equipoId: string) => void;
}

type Integrante = {
  nombre: string;
  apPaterno: string;
  apMaterno: string;
  rol: string;
  institucion: string;
};

const ModalCrearEquipo: React.FC<Props> = ({
  onClose,
  idEvento: idEventoProp,
  onEquipoCreado,
}) => {
  const params = useParams<{ id: string }>();
  const idEvento = idEventoProp ?? params.id;

  const [equipoNombre, setEquipoNombre] = useState("");
  const [equipoTelefono, setEquipoTelefono] = useState("");
  const [equipoInstitucion, setEquipoInstitucion] = useState("");
  const [equipoCorreo, setEquipoCorreo] = useState("");

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApPaterno, setNuevoApPaterno] = useState("");
  const [nuevoApMaterno, setNuevoApMaterno] = useState("");

  const [integrantes, setIntegrantes] = useState<Integrante[]>([
    {
      nombre: "Sofía",
      apPaterno: "González",
      apMaterno: "Pérez",
      rol: "Asesor",
      institucion: "ITSPP",
    },
    {
      nombre: "Santiago",
      apPaterno: "González",
      apMaterno: "Pérez",
      rol: "Líder",
      institucion: "ITSPP",
    },
    {
      nombre: "Valentina",
      apPaterno: "González",
      apMaterno: "Pérez",
      rol: "Integrante",
      institucion: "ITSPP",
    },
    {
      nombre: "Sebastián",
      apPaterno: "González",
      apMaterno: "Pérez",
      rol: "Integrante",
      institucion: "ITSPP",
    },
    {
      nombre: "Isabella",
      apPaterno: "González",
      apMaterno: "Pérez",
      rol: "Integrante",
      institucion: "ITSPP",
    },
  ]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agregarIntegrante = () => {
    const nombre = nuevoNombre.trim();
    const apP = nuevoApPaterno.trim();
    const apM = nuevoApMaterno.trim();
    if (!nombre) return;

    setIntegrantes((prev) => [
      {
        nombre,
        apPaterno: apP,
        apMaterno: apM,
        rol: "Integrante",
        institucion: equipoInstitucion || "ITSPP",
      },
      ...prev,
    ]);

    setNuevoNombre("");
    setNuevoApPaterno("");
    setNuevoApMaterno("");
  };

  const eliminarIntegrante = (idx: number) => {
    setIntegrantes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAceptar = async () => {
    try {
      setError(null);

      if (!idEvento) {
        setError("No se encontró el evento actual.");
        return;
      }

      const nombreEquipo = equipoNombre.trim();
      const institucion = equipoInstitucion.trim() || "ITSPP";

      if (!nombreEquipo) {
        setError("El nombre del equipo es obligatorio.");
        return;
      }

      if (integrantes.length === 0) {
        setError("El equipo debe tener al menos un integrante.");
        return;
      }

      setGuardando(true);

      // 👉 1. Crear el equipo en eventos/{idEvento}/equipos
      const equiposRef = collection(db, "eventos", idEvento, "equipos");
      const equipoDoc = await addDoc(equiposRef, {
        nombre: nombreEquipo,
        institucion,
        telefono: equipoTelefono.trim() || null,
        correo: equipoCorreo.trim() || null,
        integrantesCount: integrantes.length,
        creadoEn: serverTimestamp(),
        // Si quieres ligar al usuario responsable, luego puedes agregar:
        // creadoPor: idUsuarioActual,
      });

      const equipoId = equipoDoc.id;

      // 👉 2. Crear subcolección de integrantes: eventos/{idEvento}/equipos/{equipoId}/integrantes
      const integrantesRef = collection(
        db,
        "eventos",
        idEvento,
        "equipos",
        equipoId,
        "integrantes",
      );

      await Promise.all(
        integrantes.map((integ) =>
          addDoc(integrantesRef, {
            nombre: integ.nombre,
            apellidoPaterno: integ.apPaterno,
            apellidoMaterno: integ.apMaterno,
            rol: integ.rol,
            institucion: integ.institucion,
            creadoEn: serverTimestamp(),
          }),
        ),
      );

      // Opcional: también podrías registrarlos en una colección global de participantes:
      // const participantesRef = collection(db, "eventos", idEvento, "participantes");
      // await Promise.all(
      //   integrantes.map((integ) =>
      //     addDoc(participantesRef, {
      //       nombreCompleto: `${integ.nombre} ${integ.apPaterno} ${integ.apMaterno}`.trim(),
      //       rol: integ.rol,
      //       institucion: integ.institucion,
      //       equipoId,
      //       equipoNombre: nombreEquipo,
      //       creadoEn: serverTimestamp(),
      //     }),
      //   ),
      // );

      onEquipoCreado?.(equipoId);
      onClose();
    } catch (e) {
      console.error("[ModalCrearEquipo] Error al guardar equipo:", e);
      setError("Ocurrió un error al guardar el equipo. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[950px] max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <header className="px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            Añadir equipo
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            En este apartado se agregará la información para la creación de un
            nuevo equipo del evento.
          </p>
          {error && (
            <p className="mt-2 text-xs text-rose-600 font-semibold">
              {error}
            </p>
          )}
        </header>

        <div className="px-8 py-5 space-y-5 overflow-auto">
          {/* Datos generales del equipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del equipo
              </label>
              <input
                value={equipoNombre}
                onChange={(e) => setEquipoNombre(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                placeholder="Ej. Los Astros"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                value={equipoTelefono}
                onChange={(e) => setEquipoTelefono(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                placeholder="Ej. (638) 000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institución
              </label>
              <input
                value={equipoInstitucion}
                onChange={(e) =>
                  setEquipoInstitucion(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                placeholder="Ej. Instituto Tecnológico Superior de Puerto Peñasco"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo
              </label>
              <input
                value={equipoCorreo}
                onChange={(e) => setEquipoCorreo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                placeholder="correo@gmail.com"
              />
            </div>
          </div>

          {/* Añadir integrante */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre
              </label>
              <input
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                placeholder="Ej. Sofía"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellido Paterno
              </label>
              <input
                value={nuevoApPaterno}
                onChange={(e) =>
                  setNuevoApPaterno(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                placeholder="Ej. González"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellido materno
              </label>
              <input
                value={nuevoApMaterno}
                onChange={(e) =>
                  setNuevoApMaterno(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                placeholder="Ej. Pérez"
              />
            </div>
            <button
              type="button"
              onClick={agregarIntegrante}
              className="h-10 rounded-xl bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-lg flex items-center justify-center shadow-sm disabled:opacity-60"
              disabled={!nuevoNombre.trim()}
            >
              +
            </button>
          </div>

          {/* Tabla integrantes */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
            <table className="w-full">
              <thead className="bg-[#F5F6FB] text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2">Nombre</th>
                  <th className="text-left px-4 py-2">
                    Apellido Paterno
                  </th>
                  <th className="text-left px-4 py-2">
                    Apellido Materno
                  </th>
                  <th className="text-left px-4 py-2">Rol</th>
                  <th className="text-left px-4 py-2">Institución</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {integrantes.map((r, idx) => (
                  <tr key={`${r.nombre}-${idx}`}>
                    <td className="px-4 py-2">{r.nombre}</td>
                    <td className="px-4 py-2">{r.apPaterno}</td>
                    <td className="px-4 py-2">{r.apMaterno}</td>
                    <td className="px-4 py-2">{r.rol}</td>
                    <td className="px-4 py-2">{r.institucion}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => eliminarIntegrante(idx)}
                        className="h-8 w-8 rounded-full hover:bg-slate-100 inline-flex items-center justify-center"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
                {integrantes.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-3 text-[11px] text-slate-500 text-center"
                    >
                      Sin integrantes agregados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-2.5 rounded-full bg-[#EEF0F7] text-sm font-semibold text-slate-700"
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAceptar}
            disabled={guardando}
            className="px-7 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Aceptar"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ModalCrearEquipo;
