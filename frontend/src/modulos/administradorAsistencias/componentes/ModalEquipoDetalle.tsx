import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiMoreVertical, FiCheck, FiX } from "react-icons/fi";

interface Props { onClose: () => void }

const ModalEquipoDetalle: React.FC<Props> = ({ onClose }) => {
  const [edit, setEdit] = useState(false);
  const [contactPhone, setContactPhone] = useState("6381006000");
  const [contactEmail, setContactEmail] = useState("correo@gmail.com");
  const [rows, setRows] = useState(
    ["Sofía","Santiago","Valentina","Sebastián","Isabella"].map((n,i)=> ({
      nombre: n,
      apPaterno: "González",
      apMaterno: "Pérez",
      rol: i===1?"Líder":i===0?"Asesor":"Integrante",
      institucion: "ITSPP",
      correo: "correo@gmail.com",
      telefono: "6381006000",
    }))
  );

  const guardar = () => { setEdit(false); };
  const cancelar = () => { setEdit(false); };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[950px] max-h-[90vh] bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col">
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Los Tralalerites</h2>
            <p className="mt-1 text-xs text-slate-500 max-w-xl">En este apartado se agregará la información para la creación de un Nuevo equipo.</p>
          </div>
          <div className="flex items-center gap-2">
            {!edit && (
              <button type="button" onClick={()=>setEdit(true)} className="h-10 w-10 rounded-xl bg-[#F5F6FB] text-[#5B4AE5] flex items-center justify-center">
                <FiEdit2 />
              </button>
            )}
            {edit && (
              <>
                <button type="button" onClick={guardar} className="h-10 w-10 rounded-xl bg-[#E8FBEA] text-emerald-600 flex items-center justify-center">
                  <FiCheck />
                </button>
                <button type="button" onClick={cancelar} className="h-10 w-10 rounded-xl bg-[#FDECEC] text-rose-600 flex items-center justify-center">
                  <FiX />
                </button>
              </>
            )}
            <button type="button" className="h-10 w-10 rounded-xl bg-[#F5F6FB] text-[#5B4AE5] flex items-center justify-center">
              <FiTrash2 />
            </button>
          </div>
        </header>

        <div className="px-8 py-5 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Teléfono</p>
              {edit ? (
                <input value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" />
              ) : (
                <p className="text-sm text-slate-800">{contactPhone}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Correo</p>
              {edit ? (
                <input value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" />
              ) : (
                <p className="text-sm text-slate-800">{contactEmail}</p>
              )}
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-700 mb-3">Integrantes</p>

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
                {rows.map((r,idx)=> (
                  <tr key={idx}>
                    <td className="px-4 py-2">
                      {edit ? (
                        <input value={r.nombre} onChange={(e)=>{ const c=[...rows]; c[idx]={...c[idx], nombre:e.target.value}; setRows(c); }} className="w-full rounded-lg border border-slate-200 px-2 py-1" />
                      ) : r.nombre}
                    </td>
                    <td className="px-4 py-2">
                      {edit ? (
                        <input value={r.apPaterno} onChange={(e)=>{ const c=[...rows]; c[idx]={...c[idx], apPaterno:e.target.value}; setRows(c); }} className="w-full rounded-lg border border-slate-200 px-2 py-1" />
                      ) : r.apPaterno}
                    </td>
                    <td className="px-4 py-2">
                      {edit ? (
                        <input value={r.apMaterno} onChange={(e)=>{ const c=[...rows]; c[idx]={...c[idx], apMaterno:e.target.value}; setRows(c); }} className="w-full rounded-lg border border-slate-200 px-2 py-1" />
                      ) : r.apMaterno}
                    </td>
                    <td className="px-4 py-2">
                      {edit ? (
                        <input value={r.rol} onChange={(e)=>{ const c=[...rows]; c[idx]={...c[idx], rol:e.target.value}; setRows(c); }} className="w-full rounded-lg border border-slate-200 px-2 py-1" />
                      ) : r.rol}
                    </td>
                    <td className="px-4 py-2">
                      {edit ? (
                        <input value={r.institucion} onChange={(e)=>{ const c=[...rows]; c[idx]={...c[idx], institucion:e.target.value}; setRows(c); }} className="w-full rounded-lg border border-slate-200 px-2 py-1" />
                      ) : r.institucion}
                    </td>
                    <td className="px-4 py-2 text-right relative">
                      <button type="button" className="h-8 w-8 rounded-full hover:bg-slate-100 inline-flex items-center justify-center"><FiMoreVertical /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="px-8 py-4 border-t border-slate-100 flex justify-end gap-3">
          {edit && (
            <button type="button" onClick={guardar} className="px-7 py-2.5 rounded-full bg-emerald-600 text-sm font-semibold text-white shadow-sm">Guardar</button>
          )}
          <button type="button" onClick={onClose} className="px-7 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white shadow-sm">Salir</button>
        </footer>
      </div>
    </div>
  );
};

export default ModalEquipoDetalle;
