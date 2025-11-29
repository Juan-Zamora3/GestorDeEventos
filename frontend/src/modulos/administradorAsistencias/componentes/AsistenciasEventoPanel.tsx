import React, { useMemo, useState } from "react";
import { FiSearch, FiMoreVertical } from "react-icons/fi";

interface Registro {
  nombre: string;
  codigo: string;
  pagado: boolean;
  entrada: boolean;
  regreso: boolean;
  entradaEstado: "Registrada" | "Pendiente";
  regresoEstado: "Registrada" | "Pendiente";
}

const baseDatos: Registro[] = Array.from({ length: 12 }).map((_, i) => ({
  nombre: "Los Tralalerites",
  codigo: `TEC${String(i + 1).padStart(3, "0")}`,
  pagado: i % 3 === 0,
  entrada: i % 4 === 0,
  regreso: i % 5 === 0,
  entradaEstado: i % 2 === 0 ? "Registrada" : "Pendiente",
  regresoEstado: i % 3 === 0 ? "Registrada" : "Pendiente",
}));

const pillClase: Record<"Registrada" | "Pendiente", string> = {
  Registrada:
    "inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-600 px-3 py-1 text-xs font-semibold",
  Pendiente:
    "inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-xs font-semibold",
};

const AsistenciasEventoPanel: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [registros, setRegistros] = useState<Registro[]>(baseDatos);
  const [agregarOpen, setAgregarOpen] = useState(false);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    apPaterno: "",
    apMaterno: "",
    telefono: "",
    correo: "",
    institucion: "",
  });

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return registros;
    return registros.filter(
      (r) => r.nombre.toLowerCase().includes(term) || r.codigo.toLowerCase().includes(term)
    );
  }, [busqueda, registros]);

  const toggle = (idx: number, campo: keyof Registro) => {
    setRegistros((prev) => {
      const next = [...prev];
      const r = { ...next[idx] };
      if (typeof r[campo] === "boolean") {
        (r[campo] as boolean) = !(r[campo] as boolean);
        if (campo === "entrada") r.entradaEstado = r.entrada ? "Registrada" : "Pendiente";
        if (campo === "regreso") r.regresoEstado = r.regreso ? "Registrada" : "Pendiente";
      }
      next[idx] = r;
      return next;
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm px-8 py-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex-1 max-w-xl bg-[#F5F6FB] rounded-full flex items-center px-4 py-2 text-sm text-slate-700">
          <FiSearch className="text-slate-400 mr-2" />
          <input type="text" placeholder="Buscar" value={busqueda} onChange={(e)=>setBusqueda(e.target.value)} className="flex-1 bg-transparent outline-none" />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="px-5 py-2.5 rounded-full bg-[#E6E7EF] text-sm font-semibold text-slate-700">Eliminar</button>
          <button type="button" onClick={()=>setAgregarOpen(true)} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white shadow-sm">Agregar rapido</button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Participantes</h3>
            <button type="button" className="text-[11px] font-semibold text-[#356BFF]">Foro de Administración</button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">A descriptive body text comes here</p>
        </div>

        <div className="border-t border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#F5F6FB] text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre Completo</th>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Pagado</th>
                  <th className="px-4 py-3 text-left">Entrada</th>
                  <th className="px-4 py-3 text-left">Regreso</th>
                  <th className="px-4 py-3 text-left">Entrada ↓</th>
                  <th className="px-4 py-3 text-left">Regreso ↓</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((r, idx) => (
                  <tr key={`${r.codigo}-${idx}`}>
                    <td className="px-4 py-3">{r.nombre}</td>
                    <td className="px-4 py-3">{r.codigo}</td>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={r.pagado} onChange={()=>toggle(idx, "pagado")} className="h-4 w-4 accent-[#5B4AE5]" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={r.entrada} onChange={()=>toggle(idx, "entrada")} className="h-4 w-4 accent-[#5B4AE5]" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={r.regreso} onChange={()=>toggle(idx, "regreso")} className="h-4 w-4 accent-[#5B4AE5]" />
                    </td>
                    <td className="px-4 py-3">
                      <span className={pillClase[r.entradaEstado]}>
                        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                        {r.entradaEstado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={pillClase[r.regresoEstado]}>
                        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                        {r.regresoEstado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="h-8 w-8 rounded-full hover:bg-slate-100 inline-flex items-center justify-center"><FiMoreVertical /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {agregarOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="w-[720px] bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6">
              <h2 className="text-lg font-semibold text-slate-900">Añadir Participante</h2>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                  <input value={nuevo.nombre} onChange={(e)=>setNuevo({...nuevo, nombre:e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Exp. John Carter" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido Paterno</label>
                  <input value={nuevo.apPaterno} onChange={(e)=>setNuevo({...nuevo, apPaterno:e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Exp. Torres" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido Materno</label>
                  <input value={nuevo.apMaterno} onChange={(e)=>setNuevo({...nuevo, apMaterno:e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Exp. Zambada" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefono</label>
                  <input value={nuevo.telefono} onChange={(e)=>setNuevo({...nuevo, telefono:e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="(123) 000-0000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo</label>
                  <input value={nuevo.correo} onChange={(e)=>setNuevo({...nuevo, correo:e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Exp. Company" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Institución</label>
                <input value={nuevo.institucion} onChange={(e)=>setNuevo({...nuevo, institucion:e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Exp. San Francisco, CA" />
              </div>
              <div className="mt-6">
                <button type="button" onClick={()=>{
                  const nombreCompleto = `${nuevo.nombre} ${nuevo.apPaterno} ${nuevo.apMaterno}`.trim();
                  const codigo = `TEC${String(registros.length + 1).padStart(3, "0")}`;
                  const nuevoReg: Registro = {
                    nombre: nombreCompleto || "Participante",
                    codigo,
                    pagado: false,
                    entrada: false,
                    regreso: false,
                    entradaEstado: "Pendiente",
                    regresoEstado: "Pendiente",
                  };
                  setRegistros((prev)=> [nuevoReg, ...prev]);
                  setAgregarOpen(false);
                  setNuevo({ nombre:"", apPaterno:"", apMaterno:"", telefono:"", correo:"", institucion:"" });
                }} className="px-6 py-2.5 rounded-xl bg-[#3A82F6] text-white text-sm font-semibold">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsistenciasEventoPanel;
