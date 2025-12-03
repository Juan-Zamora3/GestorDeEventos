import type { FC } from "react";
import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import NuevaConstancia from "./NuevaConstancia";
import VerConstancia from "./VerConstancia";

interface PlantillaItem {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  imagen: string;
}

const mockPlantillas: PlantillaItem[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `PL${i + 1}`,
  titulo: [
    "Constancia Concurso de línea",
    "Constancia Concurso de Gallitos",
    "Constancia Concurso de Carritos",
  ][i % 3],
  tipo: ["Coordinador", "Edecan", "Gestor de constancias"][i % 3],
  fecha: "29/11/2025",
  imagen: "/Concurso.png",
}));

const SeccionPlantillasDesenglose: FC = () => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PlantillaItem[]>(mockPlantillas);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<PlantillaItem | undefined>(undefined);

  const filtrados = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (p) =>
        p.titulo.toLowerCase().includes(term) ||
        p.tipo.toLowerCase().includes(term) ||
        p.fecha.toLowerCase().includes(term)
    );
  }, [query, items]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelected(new Set(filtrados.map((p) => p.id)));
  const eliminarSeleccionados = () => {
    setItems((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
  };
  const nuevaConstancia = (n: PlantillaItem) => {
    setItems((prev) => [n, ...prev]);
    setEditing(n);
  };

  const abrirEdicion = (item: PlantillaItem) => { setEditing(item); };

  return (
    <section className="px-6 sm:px-10 py-6">
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex-1 bg-[#F5F6FB] rounded-full flex items-center px-4 py-2 text-sm text-slate-700">
          <FiSearch className="text-slate-400 mr-2" />
          <input type="text" placeholder="Buscar" value={query} onChange={(e)=>setQuery(e.target.value)} className="flex-1 bg-transparent outline-none" />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={selectAll} className="px-5 py-2.5 rounded-full bg-[#E6E7EF] text-sm font-semibold text-slate-700">Seleccionar Todo</button>
          <button type="button" onClick={eliminarSeleccionados} className="px-5 py-2.5 rounded-full bg-[#E6E7EF] text-sm font-semibold text-slate-700">Eliminar</button>
          <NuevaConstancia onCreate={(n: PlantillaItem)=> nuevaConstancia(n)} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-4">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtrados.map((p) => {
            const isSelected = selected.has(p.id);
            return (
              <button key={p.id} type="button" onClick={() => abrirEdicion(p)} className="relative bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition text-left">
                <div className="absolute top-2 left-2 z-10">
                  <label className="inline-flex items-center gap-2 bg-white/80 px-2 py-1 rounded-full">
                    <input type="checkbox" checked={isSelected} onChange={(e)=>{ e.stopPropagation(); toggleSelect(p.id); }} className="h-4 w-4 accent-[#5B4AE5]" />
                  </label>
                </div>
                <div className="h-36 w-full overflow-hidden">
                  <img src={p.imagen} alt={p.titulo} className="w-full h-full object-cover" />
                </div>
                <div className="px-3 py-2">
                  <p className="text-[11px] font-semibold text-slate-700">{p.titulo}</p>
                  <p className="text-[10px] text-slate-500">{p.fecha}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {editing && (
        <VerConstancia
          open={!!editing}
          item={editing}
          onClose={()=> setEditing(undefined)}
          onGuardar={(upd: { titulo: string; tipo: string })=>{
            setItems((prev)=> prev.map((p)=> p.id===editing.id ? { ...p, titulo: upd.titulo, tipo: upd.tipo } : p));
            setEditing(undefined);
          }}
        />
      )}
    </section>
  );
};

export default SeccionPlantillasDesenglose;

