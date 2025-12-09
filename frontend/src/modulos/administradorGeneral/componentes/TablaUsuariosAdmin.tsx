// src/modulos/administradorGeneral/componentes/TablaUsuariosAdmin.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import type { UsuarioRow } from "./tiposAdminGeneral";
import { FiMoreVertical } from "react-icons/fi";

interface Props {
  usuarios: UsuarioRow[];
  onEditarUsuario?: (usuario: UsuarioRow) => void;
  onEliminarUsuario?: (id: string) => void;
}

const TablaUsuariosAdmin: React.FC<Props> = ({
  usuarios,
  onEditarUsuario,
  onEliminarUsuario,
}) => {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );

  return (
    <section className="bg-white rounded-3xl shadow-sm overflow-visible">
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
            {usuarios.map((u) => {
              const inicial =
                u.nombre?.trim().charAt(0).toUpperCase() || "U";

              return (
                <tr
                  key={u.id}
                  className="border-t border-slate-100 hover:bg-slate-50/70"
                >
                  <td className="px-5 py-3">
                    <div className="h-9 w-9 rounded-full bg-rose-200 flex items-center justify-center text-xs font-semibold text-rose-800">
                      {inicial}
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
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={(e) => {
                          const rect = (
                            e.currentTarget as HTMLElement
                          ).getBoundingClientRect();
                          const menuW = 160;
                          const menuH = 84;
                          let top = rect.bottom + 8;
                          if (top + menuH > window.innerHeight) {
                            top = rect.top - menuH - 8;
                          }
                          let left = rect.right - menuW;
                          if (left < 8) left = 8;
                          setMenuPos({ top, left });
                          setMenuOpen((m) => (m === u.id ? null : u.id));
                        }}
                        className="p-1 rounded-full hover:bg-slate-200 text-slate-500"
                      >
                        <FiMoreVertical />
                      </button>
                    </div>

                    {menuOpen === u.id &&
                      menuPos &&
                      createPortal(
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => {
                            setMenuOpen(null);
                            setMenuPos(null);
                          }}
                        >
                          <div
                            className="fixed z-50 w-36 rounded-xl border border-slate-200 bg-white shadow-sm"
                            style={{
                              top: menuPos.top,
                              left: menuPos.left,
                            }}
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onEditarUsuario?.(u);
                                setMenuOpen(null);
                                setMenuPos(null);
                              }}
                              className="w-full text-left px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onEliminarUsuario?.(u.id);
                                setMenuOpen(null);
                                setMenuPos(null);
                              }}
                              className="w-full text-left px-3 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>,
                        document.body,
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TablaUsuariosAdmin;
