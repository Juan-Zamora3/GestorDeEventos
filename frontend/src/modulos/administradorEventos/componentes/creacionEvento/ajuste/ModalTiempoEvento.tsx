// src/modulos/administradorEventos/componentes/creacionEvento/ModalTiempoEvento.tsx
import type { FC } from "react";
import { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";

export interface TiempoData {
  id?: string;
  nombre: string;
  inicio: string;
  fin: string;
}

interface Props {
  abierto: boolean;
  modo: "crear" | "editar";
  tiempo?: TiempoData;
  onGuardar: (data: TiempoData) => void;
  onEliminar?: (id: string) => void;
  onCerrar: () => void;
}

const ModalTiempoEvento: FC<Props> = ({
  abierto,
  modo,
  tiempo,
  onGuardar,
  onEliminar,
  onCerrar,
}) => {
  const [nombre, setNombre] = useState<string>(tiempo?.nombre ?? "");
  const [inicio, setInicio] = useState<string>(tiempo?.inicio ?? "15:00");
  const [fin, setFin] = useState<string>(tiempo?.fin ?? "18:00");

  // 🔹 Cuando cambias de "tiempo" a editar, resetea los campos
  useEffect(() => {
    if (!abierto) return;
    setNombre(tiempo?.nombre ?? "");
    setInicio(tiempo?.inicio ?? "15:00");
    setFin(tiempo?.fin ?? "18:00");
  }, [tiempo, abierto]);

  if (!abierto) return null;

  const titulo = "Tiempo";
  const textoAccion = modo === "crear" ? "Agregar" : "Guardar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 🔎 Validación: hora de inicio < hora de fin
    const [hIni, mIni] = inicio.split(":").map(Number);
    const [hFin, mFin] = fin.split(":").map(Number);

    const iniMin = hIni * 60 + mIni;
    const finMin = hFin * 60 + mFin;

    if (Number.isNaN(iniMin) || Number.isNaN(finMin)) {
      alert("Las horas de inicio y fin deben tener un formato válido.");
      return;
    }

    if (finMin <= iniMin) {
      alert("La hora de fin debe ser mayor que la hora de inicio.");
      return;
    }

    onGuardar({
      id: tiempo?.id,
      nombre: nombre.trim(),
      inicio,
      fin,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 overflow-y-auto">
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-[560px] max-h-[80vh] overflow-y-auto py-6 px-8">
        {modo === "editar" && tiempo?.id && (
          <button
            type="button"
            onClick={() => onEliminar && onEliminar(tiempo.id!)}
            className="absolute right-4 top-4 p-2 rounded-full text-rose-600 hover:bg-rose-50"
            aria-label="Eliminar"
          >
            <FiTrash2 />
          </button>
        )}

        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          {titulo}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nombre de la variable
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Tiempo 3"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Hora de inicio
              </label>
              <input
                type="time"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Hora de fin
              </label>
              <input
                type="time"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
                required
              />
            </div>
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

export default ModalTiempoEvento;
