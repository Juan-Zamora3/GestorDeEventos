import React from "react";

interface Props {
  onClose: () => void;
}

const ModalDetalleEquipo: React.FC<Props> = ({ onClose }) => {
  const contactPhone = "6381006000";
  const contactEmail = "correo@gmail.com";

  const rows = ["Sofía", "Santiago", "Valentina", "Sebastián", "Isabella"].map(
    (n, i) => ({
      nombre: n,
      apPaterno: "González",
      apMaterno: "Pérez",
      rol: i === 1 ? "Líder" : i === 0 ? "Asesor" : "Integrante",
      institucion: "ITSPP",
      correo: "correo@gmail.com",
      telefono: "6381006000",
    }),
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[950px] max-h-[90vh] bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col">
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Los Tralalerites
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-xl">
              En este apartado se agregará la información para la creación de un
              Nuevo equipo.
            </p>
          </div>
          {/* Sin botones de editar/eliminar */}
          <div className="flex items-center gap-2" />
        </header>

        <div className="px-8 py-5 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Teléfono
              </p>
              <p className="text-sm text-slate-800">{contactPhone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Correo
              </p>
              <p className="text-sm text-slate-800">{contactEmail}</p>
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-700 mb-3">
            Integrantes
          </p>

          <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
            <table className="w-full">
              <thead className="bg-[#F5F6FB] text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2">Nombre</th>
                  <th className="text-left px-4 py-2">Apellido Paterno</th>
                  <th className="text-left px-4 py-2">Apellido Materno</th>
                  <th className="text-left px-4 py-2">Rol</th>
                  <th className="text-left px-4 py-2">Institución</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {rows.map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">{r.nombre}</td>
                    <td className="px-4 py-2">{r.apPaterno}</td>
                    <td className="px-4 py-2">{r.apMaterno}</td>
                    <td className="px-4 py-2">{r.rol}</td>
                    <td className="px-4 py-2">{r.institucion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="px-8 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white shadow-sm"
          >
            Salir
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ModalDetalleEquipo;
