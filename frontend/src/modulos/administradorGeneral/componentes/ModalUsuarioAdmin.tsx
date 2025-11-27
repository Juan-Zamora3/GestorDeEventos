import React from "react";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

export const ModalUsuarioAdmin: React.FC<Props> = ({ abierto, onCerrar }) => {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full mx-4 py-6 px-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Añadir Usuario
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          En este apartado se agregará la información para la creación de un
          nuevo usuario.
        </p>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nombre
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ej. Sofía"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Apellido paterno
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ej. Gonzales"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Apellido materno
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ej. Pérez"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ej. (638) 000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Correo
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ej. correo@gmail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Contraseña"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Rol
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option>Administradores de Asistencias</option>
                <option>Administradores de Eventos</option>
              </select>
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
              className="px-6 py-2 rounded-full bg-[#6581D6] text-white text-sm font-semibold hover:bg-[#5268bf]"
            >
              Aceptar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
