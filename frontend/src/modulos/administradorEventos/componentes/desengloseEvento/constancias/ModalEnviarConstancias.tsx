import { useState } from "react";
import type { FC } from "react";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onAceptar: (config: {
    canal: "Correo" | "WhatsApp";
    asunto: string;
    mensaje: string;
  }) => void;
}

const variables = ["Nombre", "Fecha", "Mensaje", "Equipo", "Concurso", "Añadir"];

const ModalEnviarConstancias: FC<Props> = ({ abierto, onCerrar, onAceptar }) => {
  const [canal, setCanal] = useState<"Correo" | "WhatsApp">("Correo");
  const [asunto, setAsunto] = useState("Entrega de constancias");
  const [mensaje, setMensaje] = useState("Adjuntamos su constancia del evento.");

  if (!abierto) return null;

  const append = (v: string) => {
    const token = `{${v}}`;
    setMensaje((m) => (m ? `${m} ${token}` : token));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[820px] max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6">
          <h2 className="text-lg font-semibold text-slate-900">Envio</h2>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Canal</p>
              <div className="inline-flex rounded-full bg-[#F2F3FB] p-1">
                {["Correo","WhatsApp"].map((c)=>{
                  const active = canal===c;
                  return (
                    <button key={c} type="button" onClick={()=>setCanal(c as "Correo" | "WhatsApp")} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${active?"bg-white text-slate-800":"text-slate-700"}`}>{c}</button>
                  );
                })}
              </div>
            </div>
          </div>
          {canal === "Correo" && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-700 mb-1">Configuración de correo</p>
              <div className="grid grid-cols-1 gap-3">
                <input value={asunto} onChange={(e)=>setAsunto(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Asunto" />
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {variables.map((v)=> (
                      <button key={v} type="button" onClick={()=> append(v)} className="px-3 py-1.5 rounded-full bg-[#F2F3FB] text-[11px] font-semibold text-slate-700">{v}</button>
                    ))}
                  </div>
                  <textarea value={mensaje} onChange={(e)=>setMensaje(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" rows={4} />
                </div>
              </div>
            </div>
          )}
          {canal === "WhatsApp" && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-700 mb-1">Mensaje</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {variables.map((v)=> (
                  <button key={v} type="button" onClick={()=> append(v)} className="px-3 py-1.5 rounded-full bg-[#F2F3FB] text-[11px] font-semibold text-slate-700">{v}</button>
                ))}
              </div>
              <textarea value={mensaje} onChange={(e)=>setMensaje(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" rows={4} />
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onCerrar} className="px-6 py-2.5 rounded-full bg-[#EEF0F7] text-sm font-semibold text-slate-700">Cancelar</button>
            <button type="button" onClick={()=> onAceptar({ canal, asunto, mensaje })} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white">Aceptar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEnviarConstancias;
