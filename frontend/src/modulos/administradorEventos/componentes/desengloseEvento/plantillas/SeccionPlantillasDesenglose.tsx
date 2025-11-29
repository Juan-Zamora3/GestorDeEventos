import type { FC } from "react";
import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

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
  const nuevaConstancia = () => {
    const n: PlantillaItem = {
      id: `PL${items.length + 1}`,
      titulo: "Nueva Constancia",
      tipo: "Coordinador",
      fecha: new Date().toLocaleDateString(),
      imagen: "/Concurso.png",
    };
    setItems((prev) => [n, ...prev]);
    setEditing(n);
  };

  const [formNombre, setFormNombre] = useState<string>("");
  const [formTipo, setFormTipo] = useState<string>("Coordinador");
  const [archivoNombre, setArchivoNombre] = useState<string>("");
  const [texto, setTexto] = useState<string>("");
  const [varTipografia, setVarTipografia] = useState<string>("Inter");
  const [varTam, setVarTam] = useState<number>(18);
  const [varAlign, setVarAlign] = useState<string>("Centrado");
  const [varColor, setVarColor] = useState<string>("#000000");
  const [varBold, setVarBold] = useState<boolean>(true);
  const [varItalic, setVarItalic] = useState<boolean>(false);
  const [varUnderline, setVarUnderline] = useState<boolean>(false);

  const abrirEdicion = (item: PlantillaItem) => {
    setEditing(item);
    setFormNombre(item.titulo);
    setFormTipo(item.tipo);
    setArchivoNombre("");
    setTexto("");
    setVarTipografia("Inter");
    setVarTam(18);
    setVarAlign("Centrado");
    setVarColor("#000000");
    setVarBold(true);
    setVarItalic(false);
    setVarUnderline(false);
  };

  const guardarPlantilla = () => {
    if (!editing) return;
    setItems((prev) => prev.map((p) => (p.id === editing.id ? { ...p, titulo: formNombre, tipo: formTipo } : p)));
    setEditing(undefined);
  };

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
          <button type="button" onClick={nuevaConstancia} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white shadow-sm">Nueva Constancia</button>
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="w-[1100px] max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <header className="px-8 py-5 bg-gradient-to-r from-[#3A62D6] to-[#5B4AE5] text-white">
              <h2 className="text-lg font-semibold">Configuración De Constancia</h2>
            </header>
            <div className="flex-1 overflow-auto px-6 py-5 grid grid-cols-1 lg:grid-cols-[320px_1fr_280px] gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Plantilla</label>
                  <input value={formNombre} onChange={(e)=>setFormNombre(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Ejemplo: Constancia de 1er lugar" />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Constancia</label>
                  <select value={formTipo} onChange={(e)=>setFormTipo(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]">
                    <option>Coordinador</option>
                    <option>Edecan</option>
                    <option>Gestor de constancias</option>
                    <option>Maestro de ceremonias</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Archivo PDF</label>
                  <div className="flex items-center gap-3">
                    <input type="file" accept="application/pdf" onChange={(e)=> setArchivoNombre(e.target.files?.[0]?.name ?? "")} />
                    {archivoNombre && (
                      <button type="button" onClick={()=> setArchivoNombre("")} className="text-[11px] font-semibold text-rose-600">Eliminar</button>
                    )}
                  </div>
                  {archivoNombre && <p className="text-[11px] text-slate-500 mt-1">{archivoNombre}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Variables disponibles</label>
                  <div className="flex flex-wrap gap-2">
                    {['Nombre','Fecha','Mensaje','Equipo','Concurso','Añadir'].map((v)=>(
                      <button key={v} type="button" className="px-3 py-1.5 rounded-full bg-[#F2F3FB] text-[11px] font-semibold text-slate-700">{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Texto</label>
                  <textarea value={texto} onChange={(e)=>setTexto(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" rows={4} />
                </div>
                <div className="mt-6">
                  <button type="button" onClick={guardarPlantilla} className="px-6 py-2.5 rounded-xl bg-[#3A82F6] text-white text-sm font-semibold">Guardar</button>
                </div>
              </div>
              <div>
                <div className="border rounded-xl overflow-hidden flex items-center justify-center bg-[#F9FAFF] h-[600px]">
                  <img src={editing.imagen} alt={editing.titulo} className="max-h-full" />
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipografia</label>
                  <select value={varTipografia} onChange={(e)=>setVarTipografia(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]">
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Montserrat</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tamaño de Fuente</label>
                  <input type="number" value={varTam} onChange={(e)=>setVarTam(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alineado</label>
                  <select value={varAlign} onChange={(e)=>setVarAlign(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]">
                    <option>Izquierda</option>
                    <option>Centrado</option>
                    <option>Derecha</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
                  <input type="color" value={varColor} onChange={(e)=>setVarColor(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 bg-[#F9FAFF]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estilo de Fuente</label>
                  <div className="space-y-2 text-[13px]">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={varBold} onChange={(e)=>setVarBold(e.target.checked)} className="h-4 w-4 accent-[#5B4AE5]" /> Negrita</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={varItalic} onChange={(e)=>setVarItalic(e.target.checked)} className="h-4 w-4 accent-[#5B4AE5]" /> Italica</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={varUnderline} onChange={(e)=>setVarUnderline(e.target.checked)} className="h-4 w-4 accent-[#5B4AE5]" /> Subrayado</label>
                  </div>
                </div>
              </div>
            </div>
            <footer className="px-8 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={()=> setEditing(undefined)} className="px-7 py-2.5 rounded-full bg-[#EEF0F7] text-sm font-semibold text-slate-700">Cerrar</button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
};

export default SeccionPlantillasDesenglose;

