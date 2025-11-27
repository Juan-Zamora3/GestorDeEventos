import React from "react";
import type { EntradaHistorial } from "./tiposAdminGeneral.ts";

interface Props {
  entradas: EntradaHistorial[];
}

const TablaHistorialAdmin: React.FC<Props> = ({ entradas }) => {
  return (
    <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Perfil</th>
              <th className="text-left px-3 py-3 font-medium">Nombre</th>
              <th className="text-left px-3 py-3 font-medium">Rol</th>
              <th className="text-left px-3 py-3 font-medium">
                Evento asignado
              </th>
              <th className="text-left px-3 py-3 font-medium">Acción</th>
              <th className="text-left px-3 py-3 font-medium">Fecha</th>
              <th className="text-left px-3 py-3 font-medium">Hora</th>
            </tr>
          </thead>
          <tbody>
            {entradas.map((h) => (
              <tr
                key={h.id}
                className="border-t border-slate-100 hover:bg-slate-50/70"
              >
                <td className="px-5 py-3">
                  <div className="h-9 w-9 rounded-full bg-sky-200 flex items-center justify-center text-xs font-semibold text-sky-800">
                    {h.nombre[0]}
                  </div>
                </td>
                <td className="px-3 py-3 font-semibold text-slate-800">
                  {h.nombre}
                </td>
                <td className="px-3 py-3 text-slate-600">{h.rol}</td>
                <td className="px-3 py-3 text-slate-600">{h.evento}</td>
                <td className="px-3 py-3 text-slate-600">{h.accion}</td>
                <td className="px-3 py-3 text-slate-600">{h.fecha}</td>
                <td className="px-3 py-3 text-slate-600">{h.hora}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TablaHistorialAdmin;
