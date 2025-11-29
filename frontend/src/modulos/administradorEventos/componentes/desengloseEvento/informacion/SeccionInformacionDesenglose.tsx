import type { FC } from "react";

const SeccionInformacionDesenglose: FC = () => {
  return (
    <section className="px-6 sm:px-10 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Concurso de robotica junior</h2>
        <div className="flex items-center gap-2">
          <button type="button" className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold">Editar</button>
          <button type="button" className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold">Eliminar Evento</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Izquierda: imagen + descripcion + fechas */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <img src="/Concurso.png" alt="Poster" className="w-full h-40 object-cover" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción<span className="text-red-500">*</span></label>
            <p className="text-xs text-slate-600">El Concurso de Robótica es un evento académico donde estudiantes compiten diseñando, construyendo y programando robots para superar retos técnicos.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Inicio del Evento</label>
              <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="16/12/2024" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Finalización del Evento</label>
              <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="17/12/2024" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de inicio de Inscripciones</label>
              <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="08/12/2024" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de fin de Inscripciones</label>
              <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="15/12/2024" />
            </div>
          </div>
        </div>

        {/* Derecha: métricas + previsualización */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {[{t:"Equipos registrados",v:"108"},{t:"Individuales",v:"298"},{t:"Asesores",v:"108"},{t:"Personal",v:"150"}].map((m,idx)=> (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] text-slate-500">{m.t}</p>
                <p className="text-xl font-semibold text-slate-900 mt-1">{m.v}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">Previsualización</p>
                <span className="text-sm">Involucrados en total: <strong>556</strong></span>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <button className="text-xs font-semibold text-white relative">
                  Equipos
                  <span className="absolute left-0 right-0 -bottom-1 h-1 rounded-full bg-white/80" />
                </button>
                <button className="text-xs text-white/80 hover:text-white">Personal</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500">
                    <th className="px-4 py-2">Nombre del equipo</th>
                    <th className="px-4 py-2">Instituto</th>
                    <th className="px-4 py-2">Día de registro</th>
                  </tr>
                </thead>
                <tbody>
                  {["Los Tralarietes","Minions","Correcaminos #2","Sadboys","Chema++","Minions","Correcaminos #2","Sadboys","Chema++","Sadboys"].map((n,idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="px-4 py-2 text-slate-800">{n}</td>
                      <td className="px-4 py-2 text-slate-600">Instituto tecnologico superior de puerto peñasco</td>
                      <td className="px-4 py-2 text-slate-600">9/12/2024</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeccionInformacionDesenglose;
