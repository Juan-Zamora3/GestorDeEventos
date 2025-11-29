import React from "react";

interface Props {
  onClose: () => void;
}

const ModalAgregarEquipo: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[950px] max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <header className="px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            Añadir equipo
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            En este apartado se agregará la información para la creación de un
            Nuevo equipo.
          </p>
        </header>

        <div className="px-8 py-5 space-y-5 overflow-auto">
          {/* Datos generales del equipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del equipo</label>
              <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Ej. Los Astros" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
              <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Ej. (638) 000-0000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institución</label>
              <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Ej. Instituto Tecnológico Superior de Puerto Peñasco" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correo</label>
              <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="correo@gmail.com" />
            </div>
          </div>

          {/* Añadir integrante */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                placeholder="Ej. Sofía"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellido Paterno
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                placeholder="Ej. Gonzales"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellido materno
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                placeholder="Ej. Perez"
              />
            </div>
            <button
              type="button"
              className="h-10 rounded-xl bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-lg flex items-center justify-center shadow-sm"
            >
              +
            </button>
          </div>

          {/* Tabla integrantes (mock) */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
            <table className="w-full">
              <thead className="bg-[#F5F6FB] text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2">Nombre</th>
                  <th className="text-left px-4 py-2">Apellido Paterno</th>
                  <th className="text-left px-4 py-2">Apellido Materno</th>
                  <th className="text-left px-4 py-2">Rol</th>
                  <th className="text-left px-4 py-2">Institución</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {["Sofía", "Santiago", "Valentina", "Sebastián", "Isabella"].map(
                  (nombre, i) => (
                    <tr key={nombre}>
                      <td className="px-4 py-2">{nombre}</td>
                      <td className="px-4 py-2">González</td>
                      <td className="px-4 py-2">Pérez</td>
                      <td className="px-4 py-2">
                        {i === 1 ? "Líder" : i === 0 ? "Asesor" : "Integrante"}
                      </td>
                      <td className="px-4 py-2">ITSPP</td>
                      <td className="px-4 py-2 text-right">⋮</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-2.5 rounded-full bg-[#EEF0F7] text-sm font-semibold text-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-7 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white shadow-sm"
          >
            Aceptar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ModalAgregarEquipo;
