import { useState } from "react";
import type { FC } from "react";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onAceptar: (config: {
    sesion: string;
    nombreZip: string;
    patronNombre: string;
  }) => void;
}

const variables = ["Nombre", "Fecha", "Mensaje", "Equipo", "Concurso", "Añadir"];

const ModalDescargarConstancias: FC<Props> = ({ abierto, onCerrar, onAceptar }) => {
  const [sesion, setSesion] = useState("Ronda 1");
  const [nombreZip, setNombreZip] = useState("constancias_29_11_2025");
  const [patronNombre, setPatronNombre] = useState("{Nombre}_{Concurso}");

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[900px] h-[60vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-8 py-6 flex-1 overflow-auto">
          <h2 className="text-lg font-semibold text-slate-900">Descargar</h2>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Sesión</p>
              <select value={sesion} onChange={(e)=>setSesion(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]">
                {"Ronda 1,Ronda 2,Ronda final".split(",").map((s)=>(<option key={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Nombre del zip</p>
              <input value={nombreZip} onChange={(e)=>setNombreZip(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-700 mb-1">Configuración de nombre de archivo y variables</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {variables.map((v)=> (
                <button key={v} type="button" onClick={()=> setPatronNombre((p)=> (p ? p+`_{${v}}` : `{${v}}`))} className="px-3 py-1.5 rounded-full bg-[#F2F3FB] text-[11px] font-semibold text-slate-700">{v}</button>
              ))}
            </div>
            <input value={patronNombre} onChange={(e)=>setPatronNombre(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onCerrar} className="px-6 py-2.5 rounded-full bg-[#EEF0F7] text-sm font-semibold text-slate-700">Cancelar</button>
            <button type="button" onClick={()=> onAceptar({ sesion, nombreZip, patronNombre })} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white">Aceptar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDescargarConstancias;
