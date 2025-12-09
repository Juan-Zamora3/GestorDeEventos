// src/modulos/administradorEventos/componentes/desengloseEvento/SeccionEquiposDesenglose.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiSearch, FiUsers, FiUser } from "react-icons/fi";

import ModalAgregarEquipo from "./ModalCrearEquipo";
import ModalDetalleEquipo from "./ModalDetalleEquipo";

import { db } from "../../../../../firebase/firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

interface Equipo {
  id: string;
  nombre: string;
  institucion: string;
  integrantes: number;
  asesor: string;
  telefono?: string;
  correo?: string;
  pagado?: boolean;
}

const SeccionEquiposDesenglose: React.FC = () => {
  const params = useParams<{ id: string }>();
  const idEvento = params.id;

  const [showAgregar, setShowAgregar] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(
    null,
  );

  const [busqueda, setBusqueda] = useState("");
  const [seleccionando, setSeleccionando] = useState(false);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [pagados, setPagados] = useState<Record<string, boolean>>({});

  const [lista, setLista] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);

  // 🔹 Cargar equipos desde Firestore en tiempo real
  useEffect(() => {
    if (!idEvento) {
      setCargando(false);
      return;
    }

    const equiposRef = collection(db, "eventos", idEvento, "equipos");
    const q = query(equiposRef, orderBy("nombre"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: Equipo[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            nombre: data.nombre ?? "Equipo sin nombre",
            institucion: data.institucion ?? "",
            integrantes: data.integrantesCount ?? 0,
            asesor: data.asesor ?? "",
            telefono: data.telefono ?? "",
            correo: data.correo ?? "",
            pagado: !!data.pagado,
          };
        });

        setLista(arr);
        // Actualizar switches de pagado según BD
        const pag: Record<string, boolean> = {};
        arr.forEach((e) => {
          pag[e.id] = !!e.pagado;
        });
        setPagados(pag);
        setCargando(false);
      },
      (err) => {
        console.error("[SeccionEquiposDesenglose] Error al leer equipos:", err);
        setCargando(false);
      },
    );

    return () => unsub();
  }, [idEvento]);

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    const fuente = lista;
    if (!term) return fuente;
    return fuente.filter(
      (e) =>
        e.nombre.toLowerCase().includes(term) ||
        e.institucion.toLowerCase().includes(term),
    );
  }, [busqueda, lista]);

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  // 🔹 Eliminar equipos seleccionados en Firestore
  const eliminarSeleccionados = async () => {
    if (seleccion.size === 0) return;
    if (!idEvento) {
      // Si por algo no hay idEvento, solo borramos en memoria
      setLista((prev) => prev.filter((e) => !seleccion.has(e.id)));
      setSeleccion(new Set());
      return;
    }

    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar los equipos seleccionados?",
    );
    if (!confirmar) return;

    try {
      const ids = Array.from(seleccion);

      await Promise.all(
        ids.map(async (equipoId) => {
          // Borrar integrantes del equipo
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

          // Borrar equipo
          const eqRef = doc(db, "eventos", idEvento, "equipos", equipoId);
          await deleteDoc(eqRef);
        }),
      );

      setSeleccion(new Set());
    } catch (e) {
      console.error(
        "[SeccionEquiposDesenglose] Error al eliminar equipos:",
        e,
      );
      alert("Ocurrió un error al eliminar los equipos seleccionados.");
    }
  };

  // 🔹 Toggle 'pagado' en Firestore
  const togglePagado = async (eq: Equipo) => {
    const nuevoEstado = !pagados[eq.id];
    setPagados((prev) => ({ ...prev, [eq.id]: nuevoEstado }));

    if (!idEvento) return;
    try {
      const eqRef = doc(db, "eventos", idEvento, "equipos", eq.id);
      await updateDoc(eqRef, { pagado: nuevoEstado });
    } catch (e) {
      console.error("[SeccionEquiposDesenglose] Error al marcar pagado:", e);
      // revertimos si falla
      setPagados((prev) => ({ ...prev, [eq.id]: !nuevoEstado }));
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm px-8 py-6 flex flex-col h-full">
        {/* Buscador + acciones */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex-1 max-w-2xl">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Buscar equipo o institución"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full rounded-xl border-2 border-[#7B5CFF] bg-white px-4 py-2 pr-10 text-sm outline-none"
              />
              <FiSearch className="absolute right-3 text-[#7B5CFF]" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeleccionando((s) => !s)}
              className="px-5 py-2.5 rounded-full bg-[#F2F3FB] text-sm font-semibold text-slate-700 shadow-sm transform-gpu transition hover:bg-[#E9ECF9] hover:-translate-y-[1px] hover:scale-[1.02]"
            >
              {seleccionando ? "Cancelar selección" : "Seleccionar"}
            </button>
            <button
              type="button"
              onClick={eliminarSeleccionados}
              className="px-5 py-2.5 rounded-full bg-[#F2F3FB] text-sm font-semibold text-slate-700 shadow-sm transform-gpu transition hover:bg-[#E9ECF9] hover:-translate-y-[1px] hover:scale-[1.02]"
            >
              Eliminar
            </button>
            <button
              type="button"
              onClick={() => setShowAgregar(true)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white shadow-sm transform-gpu transition hover:brightness-110 hover:-translate-y-[1px] hover:scale-[1.02]"
            >
              Nuevo Equipo
            </button>
          </div>
        </div>

        {cargando && (
          <p className="text-xs text-slate-500 mb-3">Cargando equipos…</p>
        )}

        {/* Grid de tarjetas de equipos */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((eq, idx) => (
            <button
              key={eq.id}
              type="button"
              onClick={() => {
                if (!seleccionando) {
                  setEquipoSeleccionado(eq);
                  setShowDetalle(true);
                }
              }}
              className={`relative bg-white rounded-2xl shadow-[0_0_0_1px_rgba(15,23,42,0.06)] hover:shadow-lg px-5 py-4 text-left border-l-[4px] ${
                seleccion.has(eq.id)
                  ? "border-[#5B4AE5]"
                  : "border-[#7B5CFF]"
              } transform-gpu transition-all hover:-translate-y-1 hover:scale-[1.02] ${
                entered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-6"
              }`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              {seleccionando && (
                <button
                  type="button"
                  aria-label="Seleccionar"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = new Set(seleccion);
                    if (next.has(eq.id)) next.delete(eq.id);
                    else next.add(eq.id);
                    setSeleccion(next);
                  }}
                  className={`absolute top-3 right-3 h-5 w-5 rounded-full border ${
                    seleccion.has(eq.id)
                      ? "bg-[#5B4AE5] border-[#5B4AE5]"
                      : "border-slate-300 bg-white"
                  }`}
                />
              )}
              <div className="absolute top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 text-slate-900 text-[12px] font-semibold shadow-sm">
                  {eq.nombre}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3 mt-6">
                {eq.institucion}
              </p>

              <div className="text-[11px] text-slate-600 space-y-1 mb-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1">
                    <FiUsers /> Integrantes
                  </span>
                  <span>{eq.integrantes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1">
                    <FiUser /> Asesor
                  </span>
                  <span>{eq.asesor || "—"}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  className="text-[11px] font-semibold text-[#356BFF]"
                  onClick={(e) => e.stopPropagation()}
                >
                  PARTICIPANTES
                </button>
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] text-slate-600">Pagado</span>
                  <button
                    type="button"
                    aria-label="Pagado"
                    onClick={(e) => {
                      e.stopPropagation();
                      void togglePagado(eq);
                    }}
                    className={`h-5 w-10 rounded-full transition ${
                      pagados[eq.id] ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 bg-white rounded-full shadow transform transition ${
                        pagados[eq.id] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </button>
          ))}
          {!cargando && filtrados.length === 0 && (
            <p className="text-xs text-slate-500 col-span-full">
              No se encontraron equipos con los filtros actuales.
            </p>
          )}
        </div>

        {seleccionando && filtrados.length > 0 && (
          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              onClick={() =>
                setSeleccion(new Set(filtrados.map((e) => e.id)))
              }
              className="px-4 py-2 rounded-full bg-[#F2F3FB] text-xs font-semibold text-slate-700"
            >
              Seleccionar todo
            </button>
          </div>
        )}
      </div>

      {showAgregar && (
        <ModalAgregarEquipo
          onClose={() => setShowAgregar(false)}
          idEvento={idEvento}
          // onEquipoCreado solo si quieres hacer algo puntual;
          // la lista ya se actualiza sola por onSnapshot.
        />
      )}
      {showDetalle && equipoSeleccionado && (
        <ModalDetalleEquipo
          onClose={() => {
            setShowDetalle(false);
            setEquipoSeleccionado(null);
          }}
          idEvento={idEvento}
          equipoId={equipoSeleccionado.id}
          nombreEquipo={equipoSeleccionado.nombre}
        />
      )}
    </>
  );
};

export default SeccionEquiposDesenglose;
