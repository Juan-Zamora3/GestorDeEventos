import { useState } from "react";
import type { FC } from "react";
import { FiTrash2 } from "react-icons/fi";
import type { RolEvento } from "../../tiposAdminEventos";

interface Props {
  abierto: boolean;
  modo: "crear" | "editar";
  rol?: RolEvento;
  onGuardar: (rol: RolEvento) => void;
  onEliminar?: (id: string) => void;
  onCerrar: () => void;
}

const ModalRolPersonal: FC<Props> = ({ abierto, modo, rol, onGuardar, onEliminar, onCerrar }) => {
  const [nombre, setNombre] = useState<string>(rol?.nombre ?? "");
  const [descripcion, setDescripcion] = useState<string>(rol?.descripcion ?? "");

  if (!abierto) return null;

  const titulo = modo === "crear" ? "Agregar personal nuevo" : "Editar personal";
  const textoAccion = modo === "crear" ? "Agregar" : "Guardar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const base: RolEvento = {
      id: rol?.id ?? "",
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
    };
    onGuardar(base);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 overflow-y-auto">
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-[600px] max-h-[80vh] overflow-y-auto py-6 px-8">
        {modo === "editar" && rol?.id && (
          <button type="button" onClick={() => onEliminar && onEliminar(rol.id)} className="absolute right-4 top-4 p-2 rounded-full text-rose-600 hover:bg-rose-50" aria-label="Eliminar">
            <FiTrash2 />
          </button>
        )}
        <h2 className="text-xl font-semibold text-slate-800 mb-4">{titulo}</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Rol</label>
            <input type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Exp. John Carter" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
            <input type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Exp. San Francisco, CA" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
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

export default ModalRolPersonal;
