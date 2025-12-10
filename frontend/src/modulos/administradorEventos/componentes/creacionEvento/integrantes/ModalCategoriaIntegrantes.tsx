// src/modulos/administradorEventos/componentes/creacionEvento/ModalCategoriaIntegrantes.tsx

import type { FC } from "react";
import { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";

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
  onEliminar?: (id: string) => void;
}

const ModalCategoriaIntegrantes: FC<Props> = ({
  abierto,
  modo,
  categoria,
  onGuardar,
  onCerrar,
  onEliminar,
}) => {
  const [nombre, setNombre] = useState<string>(categoria?.nombre ?? "");
  const [cupo, setCupo] = useState<string>(
    categoria ? String(categoria.cupo) : "",
  );

  useEffect(() => {
    if (!abierto) return;
    setNombre(categoria?.nombre ?? "");
    setCupo(categoria ? String(categoria.cupo) : "");
  }, [categoria, abierto]);

  if (!abierto) return null;

  const titulo = modo === "crear" ? "Nueva Categoría" : "Editar Categoría";
  const textoAccion = modo === "crear" ? "Aceptar" : "Guardar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nombreTrim = nombre.trim();
    const cupoNum = Number(cupo) || 0;

    if (!nombreTrim) {
      alert("La categoría debe tener un nombre.");
      return;
    }

    if (cupoNum <= 0) {
      alert("El cupo debe ser un número mayor a 0.");
      return;
    }

    const data: Categoria = {
      id: categoria?.id ?? "",
      nombre: nombreTrim,
      cupo: cupoNum,
    };
    onGuardar(data);
  };

  const handleEliminar = () => {
    if (categoria && categoria.id && onEliminar) {
      onEliminar(categoria.id);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 overflow-y-auto">
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-[560px] max-h-[80vh] overflow-y-auto py-6 px-8">
        {modo === "editar" && categoria?.id && onEliminar && (
          <button
            type="button"
            onClick={handleEliminar}
            className="absolute right-4 top-4 p-2 rounded-full text-rose-600 hover:bg-rose-50"
            aria-label="Eliminar categoría"
          >
            <FiTrash2 />
          </button>
        )}

        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          {titulo}
        </h2>
        <p className="text-[11px] text-slate-600 mb-4">
          En este apartado se agrega una categoría del evento y el cupo
          de participantes.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nombre de la categoría
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej. Sistemas"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Cantidad de personas
            </label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej. 300"
              value={cupo}
              onChange={(e) => setCupo(e.target.value)}
              required
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCerrar}
              className="px-6 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold"
            >
              {textoAccion}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export type { Categoria };
export default ModalCategoriaIntegrantes;
