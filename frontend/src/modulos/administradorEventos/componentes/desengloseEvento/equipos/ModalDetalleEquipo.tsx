// src/modulos/administradorEventos/componentes/desengloseEvento/ModalDetalleEquipo.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiCheck,
  FiX,
} from "react-icons/fi";

import { db } from "../../../../../firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface IntegranteRow {
  id: string;
  nombre: string;
  apPaterno: string;
  apMaterno: string;
  rol: string;
  institucion: string;
  correo?: string;
  telefono?: string;
}

interface Props {
  onClose: () => void;
  idEvento?: string;
  equipoId?: string;
  nombreEquipo?: string;
  onEquipoEliminado?: (equipoId: string) => void;
}

const ModalDetalleEquipo: React.FC<Props> = ({
  onClose,
  idEvento: idEventoProp,
  equipoId,
  nombreEquipo,
  onEquipoEliminado,
}) => {
  const params = useParams<{ id: string }>();
  const idEvento = idEventoProp ?? params.id;

  const [edit, setEdit] = useState(false);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [equipoNombre, setEquipoNombre] = useState(nombreEquipo ?? "");

  const [rows, setRows] = useState<IntegranteRow[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Cargar datos de Firestore al abrir el modal
  useEffect(() => {
    const cargar = async () => {
      try {
        setError(null);

        if (!idEvento || !equipoId) {
          setError("No se pudo identificar el evento o el equipo.");
          setCargando(false);
          return;
        }

        const equipoRef = doc(db, "eventos", idEvento, "equipos", equipoId);
        const equipoSnap = await getDoc(equipoRef);

        if (!equipoSnap.exists()) {
          setError("El equipo no existe en la base de datos.");
          setCargando(false);
          return;
        }

        const data = equipoSnap.data() as any;
        setEquipoNombre(data.nombre ?? nombreEquipo ?? "Equipo sin nombre");
        setContactPhone(data.telefono ?? "");
        setContactEmail(data.correo ?? "");

        const intsRef = collection(
          db,
          "eventos",
          idEvento,
          "equipos",
          equipoId,
          "integrantes",
        );
        const intsSnap = await getDocs(intsRef);

        const intsRows: IntegranteRow[] = intsSnap.docs.map((d) => {
          const dData = d.data() as any;
          return {
            id: d.id,
            nombre: dData.nombre ?? "",
            apPaterno: dData.apellidoPaterno ?? "",
            apMaterno: dData.apellidoMaterno ?? "",
            rol: dData.rol ?? "",
            institucion: dData.institucion ?? "",
            correo: dData.correo ?? "",
            telefono: dData.telefono ?? "",
          };
        });

        setRows(intsRows);
      } catch (e) {
        console.error("[ModalDetalleEquipo] Error al cargar:", e);
        setError("Ocurrió un error al cargar la información del equipo.");
      } finally {
        setCargando(false);
      }
    };

    void cargar();
  }, [idEvento, equipoId, nombreEquipo]);

  const guardar = async () => {
    try {
      setError(null);

      if (!idEvento || !equipoId) {
        setError("No se encontró el evento o el equipo.");
        return;
      }

      setGuardando(true);

      // 🔹 Actualizar equipo
      const equipoRef = doc(db, "eventos", idEvento, "equipos", equipoId);
      await updateDoc(equipoRef, {
        nombre: equipoNombre.trim() || "Equipo sin nombre",
        telefono: contactPhone.trim() || null,
        correo: contactEmail.trim() || null,
      });

      // 🔹 Actualizar integrantes
      await Promise.all(
        rows.map((r) => {
          const integRef = doc(
            db,
            "eventos",
            idEvento,
            "equipos",
            equipoId,
            "integrantes",
            r.id,
          );
          return updateDoc(integRef, {
            nombre: r.nombre,
            apellidoPaterno: r.apPaterno,
            apellidoMaterno: r.apMaterno,
            rol: r.rol,
            institucion: r.institucion,
            correo: r.correo ?? null,
            telefono: r.telefono ?? null,
          });
        }),
      );

      setEdit(false);
    } catch (e) {
      console.error("[ModalDetalleEquipo] Error al guardar:", e);
      setError("Ocurrió un error al guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  const cancelar = () => {
    // No recargamos de Firestore para mantenerlo simple:
    // si cancelan, solo dejamos de editar y no se sube nada a BD.
    setEdit(false);
  };

  const eliminarEquipo = async () => {
    if (!idEvento || !equipoId) return;
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este equipo y sus integrantes?",
    );
    if (!confirmar) return;

    try {
      setGuardando(true);
      setError(null);

      // 🔹 Borrar subcolección integrantes
      const intsRef = collection(
        db,
        "eventos",
        idEvento,
        "equipos",
        equipoId,
        "integrantes",
      );
      const intsSnap = await getDocs(intsRef);
      await Promise.all(intsSnap.docs.map((d) => deleteDoc(d.ref)));

      // 🔹 Borrar equipo
      const equipoRef = doc(db, "eventos", idEvento, "equipos", equipoId);
      await deleteDoc(equipoRef);

      onEquipoEliminado?.(equipoId);
      onClose();
    } catch (e) {
      console.error("[ModalDetalleEquipo] Error al eliminar equipo:", e);
      setError("No se pudo eliminar el equipo. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[950px] max-h-[90vh] bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col">
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {equipoNombre || "Equipo sin nombre"}
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-xl">
              En este apartado se podrán consultar y editar los datos del equipo
              y sus integrantes.
            </p>
            {error && (
              <p className="mt-2 text-xs text-rose-600 font-semibold">
                {error}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!edit && !cargando && (
              <button
                type="button"
                onClick={() => setEdit(true)}
                className="h-10 w-10 rounded-xl bg-[#F5F6FB] text-[#5B4AE5] flex items-center justify-center"
              >
                <FiEdit2 />
              </button>
            )}
            {edit && (
              <>
                <button
                  type="button"
                  onClick={guardar}
                  disabled={guardando}
                  className="h-10 w-10 rounded-xl bg-[#E8FBEA] text-emerald-600 flex items-center justify-center disabled:opacity-60"
                >
                  <FiCheck />
                </button>
                <button
                  type="button"
                  onClick={cancelar}
                  disabled={guardando}
                  className="h-10 w-10 rounded-xl bg-[#FDECEC] text-rose-600 flex items-center justify-center disabled:opacity-60"
                >
                  <FiX />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={eliminarEquipo}
              disabled={guardando}
              className="h-10 w-10 rounded-xl bg-[#F5F6FB] text-[#5B4AE5] flex items-center justify-center disabled:opacity-60"
              title="Eliminar equipo"
            >
              <FiTrash2 />
            </button>
          </div>
        </header>

        <div className="px-8 py-5 overflow-auto">
          {cargando ? (
            <p className="text-xs text-slate-500">Cargando datos…</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Teléfono de contacto
                  </p>
                  {edit ? (
                    <input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                    />
                  ) : (
                    <p className="text-sm text-slate-800">
                      {contactPhone || "—"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Correo de contacto
                  </p>
                  {edit ? (
                    <input
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                    />
                  ) : (
                    <p className="text-sm text-slate-800">
                      {contactEmail || "—"}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-700 mb-3">
                Integrantes
              </p>

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
                    {rows.map((r, idx) => (
                      <tr key={r.id ?? idx}>
                        <td className="px-4 py-2">
                          {edit ? (
                            <input
                              value={r.nombre}
                              onChange={(e) => {
                                const c = [...rows];
                                c[idx] = { ...c[idx], nombre: e.target.value };
                                setRows(c);
                              }}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1"
                            />
                          ) : (
                            r.nombre
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {edit ? (
                            <input
                              value={r.apPaterno}
                              onChange={(e) => {
                                const c = [...rows];
                                c[idx] = {
                                  ...c[idx],
                                  apPaterno: e.target.value,
                                };
                                setRows(c);
                              }}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1"
                            />
                          ) : (
                            r.apPaterno
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {edit ? (
                            <input
                              value={r.apMaterno}
                              onChange={(e) => {
                                const c = [...rows];
                                c[idx] = {
                                  ...c[idx],
                                  apMaterno: e.target.value,
                                };
                                setRows(c);
                              }}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1"
                            />
                          ) : (
                            r.apMaterno
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {edit ? (
                            <input
                              value={r.rol}
                              onChange={(e) => {
                                const c = [...rows];
                                c[idx] = { ...c[idx], rol: e.target.value };
                                setRows(c);
                              }}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1"
                            />
                          ) : (
                            r.rol
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {edit ? (
                            <input
                              value={r.institucion}
                              onChange={(e) => {
                                const c = [...rows];
                                c[idx] = {
                                  ...c[idx],
                                  institucion: e.target.value,
                                };
                                setRows(c);
                              }}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1"
                            />
                          ) : (
                            r.institucion
                          )}
                        </td>
                        <td className="px-4 py-2 text-right relative">
                          <button
                            type="button"
                            className="h-8 w-8 rounded-full hover:bg-slate-100 inline-flex items-center justify-center"
                          >
                            <FiMoreVertical />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-3 text-[11px] text-slate-500 text-center"
                        >
                          Sin integrantes registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <footer className="px-8 py-4 border-t border-slate-100 flex justify-end gap-3">
          {edit && !cargando && (
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="px-7 py-2.5 rounded-full bg-emerald-600 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white shadow-sm"
            disabled={guardando}
          >
            Salir
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ModalDetalleEquipo;
