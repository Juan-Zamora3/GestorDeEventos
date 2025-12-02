import type { FC } from "react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { nombre: string; apPaterno: string; apMaterno: string; telefono: string; correo: string; institucion: string; }) => void;
}

const Agregarrapido: FC<Props> = ({ open, onClose, onAdd }) => {
  const [nombre, setNombre] = useState("");
  const [apPaterno, setApPaterno] = useState("");
  const [apMaterno, setApMaterno] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [institucion, setInstitucion] = useState("");

  if (!open) return null;

  const agregar = () => {
    onAdd({ nombre, apPaterno, apMaterno, telefono, correo, institucion });
    setNombre(""); setApPaterno(""); setApMaterno(""); setTelefono(""); setCorreo(""); setInstitucion("");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[720px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Añadir Participante</h2>
            <button type="button" onClick={onClose} className="h-10 w-10 rounded-xl bg-[#F5F6FB] text-slate-700 inline-flex items-center justify-center">✕</button>
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
              <input value={nombre} onChange={(e)=>setNombre(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Exp. John Carter" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido Paterno</label>
              <input value={apPaterno} onChange={(e)=>setApPaterno(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Exp. Torres" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido Materno</label>
              <input value={apMaterno} onChange={(e)=>setApMaterno(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Exp. Zambada" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefono</label>
              <input value={telefono} onChange={(e)=>setTelefono(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="(123) 000-0000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correo</label>
              <input value={correo} onChange={(e)=>setCorreo(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Exp. Company" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Institución</label>
            <input value={institucion} onChange={(e)=>setInstitucion(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Exp. San Francisco, CA" />
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl bg-[#EEF0F7] text-sm font-semibold text-slate-700">Cerrar</button>
            <button type="button" onClick={agregar} className="px-6 py-2.5 rounded-xl bg-[#3A82F6] text-white text-sm font-semibold">Agregar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agregarrapido;

