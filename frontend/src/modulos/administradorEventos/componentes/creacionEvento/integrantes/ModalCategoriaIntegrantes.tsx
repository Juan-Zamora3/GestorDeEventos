// ModalCategoriaIntegrantes
// Permite crear/editar una categoría con nombre y cupo.
import type { FC } from "react";
import { useState } from "react";

interface Categoria {
  id: string;
  nombre: string;
  cupo: number;
}

interface Props {
  abierto: boolean;
  modo: "crear" | "editar";
  categoria?: Categoria;
  onGuardar: (data: Categoria) => void;
  onCerrar: () => void;
}

const ModalCategoriaIntegrantes: FC<Props> = ({ abierto, modo, categoria, onGuardar, onCerrar }) => {
  const [nombre, setNombre] = useState<string>(categoria?.nombre ?? "");
  const [cupo, setCupo] = useState<string>(categoria ? String(categoria.cupo) : "");

  if (!abierto) return null;

  const titulo = modo === "crear" ? "Nueva Categoría" : "Editar Categoría";
  const textoAccion = modo === "crear" ? "Aceptar" : "Guardar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Categoria = { id: categoria?.id ?? "", nombre: nombre.trim(), cupo: Number(cupo) || 0 };
    onGuardar(data);
  };

  return (
    // Overlay centrado y contenedor con scroll interno
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 overflow-y-auto">
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-[560px] max-h-[80vh] overflow-y-auto py-6 px-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{titulo}</h2>
        <p className="text-[11px] text-slate-600 mb-4">En este apartado se agrega una categoría del evento y el cupo de participantes.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nombre de la categoría</label>
            <input type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ej. Sistemas" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Cantidad de personas</label>
            <input type="number" min={1} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ej. 300" value={cupo} onChange={(e) => setCupo(e.target.value)} required />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onCerrar} className="px-6 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">Cancelar</button>
            <button type="submit" className="px-6 py-2 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold">{textoAccion}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export type { Categoria };
export default ModalCategoriaIntegrantes;
