// src/modulos/administradorEventos/componentes/desengloseEvento/constancias/SeccionPlantillasDesenglose.tsx
import type { FC } from "react";
import { useMemo, useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { useParams } from "react-router-dom";

import NuevaConstancia from "./NuevaConstancia";
import VerConstancia from "./VerConstancia";

// 🔹 Firebase
import { db } from "../../../../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

// 🔸 Tipo local para la creación de plantillas
interface NuevaPlantillaPayload {
  titulo: string;
  tipo: string;
  imagen: string;
}

export interface PlantillaItem {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  imagen: string; // URL de imagen o PDF
}

const SeccionPlantillasDesenglose: FC = () => {
  const { id } = useParams();
  const idEvento = id ?? null;

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PlantillaItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<PlantillaItem | undefined>(undefined);
  const [vCard] = useState<number>(() => Date.now());

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Construye src de PDF para las tarjetas (mini preview)
  const buildPdfSrc = (
    urlBase: string | undefined,
    scope: "card" | "modal" = "card",
  ) => {
    const base =
      urlBase && urlBase.trim() !== "" ? urlBase : "/Hackatec2.pdf";
    const zoom = scope === "card" ? "20" : "60";
    return `${base}?ctx=${scope}&v=${vCard}#page=1&zoom=${zoom}`;
  };

  // 🔹 Carga inicial desde Firestore
  useEffect(() => {
    const cargar = async () => {
      if (!idEvento) {
        setCargando(false);
        setError("No se encontró el identificador del evento en la URL.");
        return;
      }

      try {
        setCargando(true);
        setError(null);

        const colRef = collection(
          db,
          "eventos",
          idEvento,
          "plantillasConstancias",
        );
        const snap = await getDocs(colRef);

        const lista: PlantillaItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          const fechaStr =
            data.fecha ??
            (data.creadoEn?.toDate
              ? data.creadoEn.toDate().toLocaleDateString()
              : new Date().toLocaleDateString());

          lista.push({
            id: docSnap.id,
            titulo: data.titulo ?? "Constancia sin título",
            tipo: data.tipo ?? "Coordinador",
            fecha: fechaStr,
            imagen: data.imagen ?? "/Hackatec2.pdf",
          });
        });

        lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
        setItems(lista);
      } catch (e) {
        console.error(
          "[SeccionPlantillasDesenglose] Error al cargar plantillas:",
          e,
        );
        setError(
          "Ocurrió un error al cargar las plantillas de constancias del evento.",
        );
      } finally {
        setCargando(false);
      }
    };

    void cargar();
  }, [idEvento]);

  const filtrados = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (p) =>
        p.titulo.toLowerCase().includes(term) ||
        p.tipo.toLowerCase().includes(term) ||
        p.fecha.toLowerCase().includes(term),
    );
  }, [query, items]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () =>
    setSelected(new Set(filtrados.map((p) => p.id)));

  const eliminarSeleccionados = async () => {
    if (!idEvento || selected.size === 0) return;

    const aEliminar = items.filter((p) => selected.has(p.id));

    try {
      await Promise.all(
        aEliminar.map((p) =>
          deleteDoc(
            doc(
              db,
              "eventos",
              idEvento,
              "plantillasConstancias",
              p.id,
            ),
          ),
        ),
      );
      setItems((prev) => prev.filter((p) => !selected.has(p.id)));
      setSelected(new Set());
    } catch (e) {
      console.error(
        "[SeccionPlantillasDesenglose] Error al eliminar plantillas:",
        e,
      );
      alert(
        "Ocurrió un error al eliminar una o más plantillas de constancias.",
      );
    }
  };

  const nuevaConstancia = async (payload: NuevaPlantillaPayload) => {
    if (!idEvento) {
      alert("No hay un evento seleccionado para asociar la plantilla.");
      return;
    }

    try {
      const ahora = new Date();
      const fechaStr = ahora.toLocaleDateString();

      const colRef = collection(
        db,
        "eventos",
        idEvento,
        "plantillasConstancias",
      );

      const docRef = await addDoc(colRef, {
        titulo: payload.titulo,
        tipo: payload.tipo,
        imagen: payload.imagen,
        fecha: fechaStr,
        creadoEn: serverTimestamp(),
      });

      const nueva: PlantillaItem = {
        id: docRef.id,
        titulo: payload.titulo,
        tipo: payload.tipo,
        fecha: fechaStr,
        imagen: payload.imagen,
      };

      setItems((prev) => [nueva, ...prev]);
      setEditing(nueva);
    } catch (e) {
      console.error(
        "[SeccionPlantillasDesenglose] Error al crear nueva plantilla:",
        e,
      );
      alert("Ocurrió un error al crear la nueva plantilla de constancia.");
    }
  };

  const abrirEdicion = (item: PlantillaItem) => {
    setEditing(item);
  };

  if (cargando) {
    return (
      <section className="px-6 sm:px-10 py-6">
        <p className="text-sm text-slate-500">
          Cargando plantillas de constancias del evento...
        </p>
      </section>
    );
  }

  return (
    <section className="px-6 sm:px-10 py-6">
      {error && (
        <p className="mb-3 text-xs font-semibold text-rose-600">{error}</p>
      )}

      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex-1 bg-[#F5F6FB] rounded-full flex items-center px-4 py-2 text-sm text-slate-700">
          <FiSearch className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={selectAll}
            className="px-5 py-2.5 rounded-full bg-[#E6E7EF] text-sm font-semibold text-slate-700"
          >
            Seleccionar Todo
          </button>
          <button
            type="button"
            onClick={() => void eliminarSeleccionados()}
            className="px-5 py-2.5 rounded-full bg-[#E6E7EF] text-sm font-semibold text-slate-700"
            disabled={selected.size === 0}
          >
            Eliminar
          </button>
          <NuevaConstancia onCreate={nuevaConstancia} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-4">
        {filtrados.length === 0 ? (
          <p className="text-[11px] text-slate-500">
            No hay plantillas de constancias registradas o que coincidan con la
            búsqueda.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {filtrados.map((p) => {
              const isSelected = selected.has(p.id);
              const pdfUrl = p.imagen?.toLowerCase().endsWith(".pdf")
                ? p.imagen
                : "/Hackatec2.pdf";
              const pdfSrcCard = buildPdfSrc(pdfUrl, "card");

              return (
                <div
                  key={p.id}
                  onClick={() => abrirEdicion(p)}
                  className="relative bg-white rounded-xl shadow-[0_2px_10px_rgba(15,23,42,0.10)] overflow-hidden hover:shadow-lg transition text-left cursor-pointer"
                >
                  <div className="absolute top-2 left-2 z-10">
                    <label
                      className="inline-flex items-center gap-2 bg-white/80 px-2 py-1 rounded-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelect(p.id);
                        }}
                        className="h-4 w-4 accent-[#5B4AE5]"
                      />
                    </label>
                  </div>

                  <div className="relative w-full aspect-[210/297] overflow-hidden rounded-xl bg-[#F8FAFF] ring-1 ring-slate-300 shadow-[0_1px_6px_rgba(15,23,42,0.08)]">
                    <iframe
                      src={pdfSrcCard}
                      title={p.titulo}
                      className="absolute inset-0 w-[110%] h-[110%] -translate-y-[0px] -translate-x-[4px] scale-[1.0] pointer-events-none"
                      loading="lazy"
                    />
                  </div>

                  <div className="px-3 py-2">
                    <p className="text-[11px] font-semibold text-slate-700">
                      {p.titulo}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {p.tipo} · {p.fecha}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && idEvento && (
        <VerConstancia
          key={editing.id}
          open={!!editing}
          item={editing}
          onClose={() => setEditing(undefined)}
          onGuardar={async (upd: { titulo: string; tipo: string }) => {
            try {
              const ref = doc(
                db,
                "eventos",
                idEvento,
                "plantillasConstancias",
                editing.id,
              );
              await updateDoc(ref, {
                titulo: upd.titulo,
                tipo: upd.tipo,
              });

              setItems((prev) =>
                prev.map((p) =>
                  p.id === editing.id
                    ? { ...p, titulo: upd.titulo, tipo: upd.tipo }
                    : p,
                ),
              );
              setEditing(undefined);
            } catch (e) {
              console.error(
                "[SeccionPlantillasDesenglose] Error al guardar cambios de plantilla:",
                e,
              );
              alert(
                "Ocurrió un error al guardar los cambios de la plantilla.",
              );
            }
          }}
        />
      )}
    </section>
  );
};

export default SeccionPlantillasDesenglose;
