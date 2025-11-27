import React from "react";
import type { UsuarioRow } from "./tiposAdminGeneral.ts";
import { FiMoreVertical } from "react-icons/fi";

interface Props {
  usuarios: UsuarioRow[];
}

const TablaUsuariosAdmin: React.FC<Props> = ({ usuarios }) => {
  return (
    <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Perfil</th>
              <th className="text-left px-3 py-3 font-medium">Nombre</th>
              <th className="text-left px-3 py-3 font-medium">Correo</th>
              <th className="text-left px-3 py-3 font-medium">Teléfono</th>
              <th className="text-left px-3 py-3 font-medium">
                Evento asignado
              </th>
              <th className="text-left px-3 py-3 font-medium">Rol</th>
              <th className="text-left px-3 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr
                key={u.id}
                className="border-t border-slate-100 hover:bg-slate-50/70"
              >
                <td className="px-5 py-3">
                  <div className="h-9 w-9 rounded-full bg-rose-200 flex items-center justify-center text-xs font-semibold text-rose-800">
                    {u.nombre[0]}
                  </div>
                </td>
                <td className="px-3 py-3 font-semibold text-slate-800">
                  {u.nombre}
                </td>
                <td className="px-3 py-3 text-slate-600">{u.correo}</td>
                <td className="px-3 py-3 text-slate-600">{u.telefono}</td>
                <td className="px-3 py-3 text-slate-600">{u.evento}</td>
                <td className="px-3 py-3 text-slate-600">{u.rol}</td>
                <td className="px-3 py-3">
                  {u.status === "Activo" ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      Finalizado
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="p-1 rounded-full hover:bg-slate-200 text-slate-500">
                    <FiMoreVertical />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TablaUsuariosAdmin;
