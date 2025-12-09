import type { FC } from "react";
import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import VerConstancia from "./VerConstancia";

interface PlantillaItem {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  imagen: string;
}

const mockPlantillas: PlantillaItem[] = Array.from({ length: 12 }).map(
  (_, i) => ({
    id: `PL${i + 1}`,
    titulo: [
      "Constancia Concurso de línea",
      "Constancia Concurso de Gallitos",
      "Constancia Concurso de Carritos",
    ][i % 3],
    tipo: ["Coordinador", "Edecan", "Gestor de constancias"][i % 3],
    fecha: "29/11/2025",
    imagen: "/Concurso.png",
  }),
);

const SeccionPlantillasDesenglose: FC = () => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PlantillaItem[]>(mockPlantillas);
  const [editing, setEditing] = useState<PlantillaItem | undefined>(undefined);
  const [vCard] = useState<number>(() => Date.now());

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

  const abrirEdicion = (item: PlantillaItem) => {
    setEditing(item);
  };

  const buildPdfSrc = (
    urlBase: string | undefined,
    scope: "card" | "modal" = "card",
  ) => {
    const base =
      urlBase && urlBase.trim() !== "" ? urlBase : "/Hackatec2.pdf";
    const zoom = "20";
    return `${base}?ctx=${scope}&v=${vCard}#page=1&zoom=${zoom}`;
  };

  return (
    <section className="px-6 sm:px-10 py-6">
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
        {/* Botones de Seleccionar Todo / Eliminar / Nueva Constancia eliminados */}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-4">
        <div className="grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {filtrados.map((p) => {
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
                {/* Checkbox de selección eliminado */}
                <div className="relative w-full aspect-[210/297] overflow-hidden rounded-xl bg-[#F8FAFF] ring-1 ring-slate-300 shadow-[0_1px_6px_rgba(15,23,42,0.08)]">
                  {!editing ? (
                    <iframe
                      src={pdfSrcCard}
                      title={p.titulo}
                      className="absolute inset-0 w-[110%] h-[110%] -translate-y-[0px] -translate-x-[4px] scale-[1.0] pointer-events-none"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#F8FAFF]" />
                  )}
                </div>
                <div className="px-3 py-2">
                  <p className="text-[11px] font-semibold text-slate-700">
                    {p.titulo}
                  </p>
                  <p className="text-[10px] text-slate-500">{p.fecha}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editing && (
        <VerConstancia
          key={editing.id}
          open={!!editing}
          item={editing}
          onClose={() => setEditing(undefined)}
          onGuardar={(upd: { titulo: string; tipo: string }) => {
            setItems((prev) =>
              prev.map((p) =>
                p.id === editing.id
                  ? { ...p, titulo: upd.titulo, tipo: upd.tipo }
                  : p,
              ),
            );
            setEditing(undefined);
          }}
        />
      )}
    </section>
  );
};

export default SeccionPlantillasDesenglose;
