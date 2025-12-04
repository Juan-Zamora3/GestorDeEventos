import React, { useMemo, useState } from "react";
import { FiSearch, FiMoreVertical } from "react-icons/fi";
import Agregarrapido from "./Agregarrapido";

interface Registro {
  id: string;
  nombre: string;
  codigo: string;
  telefono: string;
  correo: string;
  institucion: string;
}

const baseDatos: Registro[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `rec-${String(i + 1).padStart(3, "0")}`,
  nombre: "Los Tralalerites",
  codigo: `TEC${String(i + 1).padStart(3, "0")}`,
  telefono: "(123) 000-0000",
  correo: "tralalerites@example.com",
  institucion: "Instituto Tecnológico Superior",
}));


const SeccionParticipantesDesenglose: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [registros, setRegistros] = useState<Registro[]>(baseDatos);
  const [agregarOpen, setAgregarOpen] = useState(false);
  const [seleccionMode, setSeleccionMode] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ nombre: string; telefono: string; correo: string; institucion: string } | null>(null);

  

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return registros;
    return registros.filter(
      (r) => r.nombre.toLowerCase().includes(term) || r.codigo.toLowerCase().includes(term)
    );
  }, [busqueda, registros]);


  const toggleSeleccion = (codigo: string) => {
    setSeleccionados((prev) => {
      const s = new Set(prev);
      if (s.has(codigo)) s.delete(codigo); else s.add(codigo);
      return s;
    });
  };

  const seleccionarTodo = () => {
    setSeleccionados(new Set(filtrados.map((r) => r.codigo)));
  };

  const limpiarSeleccion = () => {
    setSeleccionados(new Set());
  };

  const eliminarSeleccionados = () => {
    if (!seleccionMode || seleccionados.size === 0) return;
    setRegistros((prev) => prev.filter((r) => !seleccionados.has(r.codigo)));
    setSeleccionados(new Set());
  };

  const iniciarEdicion = (r: Registro) => {
    setEditando(r.id);
    setDraft({ nombre: r.nombre, telefono: r.telefono, correo: r.correo, institucion: r.institucion });
    setMenuOpen(null);
  };

  const guardarEdicion = () => {
    if (!editando || !draft) return;
    const nuevoNombre = draft.nombre.trim();
    const nuevoTelefono = draft.telefono.trim();
    const nuevoCorreo = draft.correo.trim();
    const nuevaInstitucion = draft.institucion.trim();
    setRegistros((prev) => prev.map((r) => (
      r.id === editando
        ? { ...r,
            nombre: nuevoNombre || r.nombre,
            telefono: nuevoTelefono || r.telefono,
            correo: nuevoCorreo || r.correo,
            institucion: nuevaInstitucion || r.institucion,
          }
        : r
    )));
    setEditando(null);
    setDraft(null);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setDraft(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm px-8 py-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex-1 max-w-xl bg-[#F5F6FB] rounded-full flex items-center px-4 py-2 text-sm text-slate-700">
          <FiSearch className="text-slate-400 mr-2" />
          <input type="text" placeholder="Buscar" value={busqueda} onChange={(e)=>setBusqueda(e.target.value)} className="flex-1 bg-transparent outline-none" />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const next = !seleccionMode;
              setSeleccionMode(next);
              if (!next) limpiarSeleccion();
            }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold ${seleccionMode ? "bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white" : "bg-[#E6E7EF] text-slate-700"}`}
          >
            {seleccionMode ? "Salir de selección" : "Seleccionar"}
          </button>
          <button
            type="button"
            onClick={eliminarSeleccionados}
            disabled={!seleccionMode || seleccionados.size === 0}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold ${!seleccionMode || seleccionados.size===0 ? "bg-[#E6E7EF] text-slate-500 cursor-not-allowed" : "bg-rose-600 text-white"}`}
          >
            Eliminar
          </button>
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
          <div className="overflow-x-auto max-h-[540px] overflow-y-auto" onClick={()=> setMenuOpen(null)}>
            <table className="w-full text-xs">
              <thead className="bg-[#F5F6FB] text-slate-500 sticky top-0 z-10">
                <tr>
                  {seleccionMode && (<th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={seleccionados.size === filtrados.length && filtrados.length>0}
                      onChange={(e)=> { if (e.target.checked) seleccionarTodo(); else limpiarSeleccion(); }}
                      className="h-4 w-4 accent-[#5B4AE5]"
                    />
                  </th>)}
                  <th className="px-4 py-3 text-left">Nombre Completo</th>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Telefono</th>
                  <th className="px-4 py-3 text-left">Correo</th>
                  <th className="px-4 py-3 text-left">Institución</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((r) => (
                  <tr key={r.id}>
                    {seleccionMode && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={seleccionados.has(r.codigo)}
                          onChange={()=> toggleSeleccion(r.codigo)}
                          className="h-4 w-4 accent-[#5B4AE5]"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {editando === r.id ? (
                        <input
                          value={(draft?.nombre ?? r.nombre)}
                          onChange={(e)=> setDraft((d)=> ({ ...(d ?? { nombre: r.nombre, telefono: r.telefono, correo: r.correo, institucion: r.institucion }), nombre: e.target.value }))}
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs bg-[#F9FAFF]"
                        />
                      ) : (
                        r.nombre
                      )}
                    </td>
                    <td className="px-4 py-3">{r.codigo}</td>
                    <td className="px-4 py-3">
                      {editando === r.id ? (
                        <input
                          value={(draft?.telefono ?? r.telefono)}
                          onChange={(e)=> setDraft((d)=> ({ ...(d ?? { nombre: r.nombre, telefono: r.telefono, correo: r.correo, institucion: r.institucion }), telefono: e.target.value }))}
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs bg-[#F9FAFF]"
                        />
                      ) : (
                        r.telefono
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editando === r.id ? (
                        <input
                          value={(draft?.correo ?? r.correo)}
                          onChange={(e)=> setDraft((d)=> ({ ...(d ?? { nombre: r.nombre, telefono: r.telefono, correo: r.correo, institucion: r.institucion }), correo: e.target.value }))}
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs bg-[#F9FAFF]"
                        />
                      ) : (
                        r.correo
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editando === r.id ? (
                        <input
                          value={(draft?.institucion ?? r.institucion)}
                          onChange={(e)=> setDraft((d)=> ({ ...(d ?? { nombre: r.nombre, telefono: r.telefono, correo: r.correo, institucion: r.institucion }), institucion: e.target.value }))}
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs bg-[#F9FAFF]"
                        />
                      ) : (
                        r.institucion
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editando === r.id ? (
                        <div className="inline-flex items-center gap-2">
                          <button type="button" onClick={guardarEdicion} className="px-3 py-1.5 rounded-full bg-[#5B4AE5] text-[11px] font-semibold text-white">Guardar</button>
                          <button type="button" onClick={cancelarEdicion} className="px-3 py-1.5 rounded-full bg-[#E6E7EF] text-[11px] font-semibold text-slate-700">Cancelar</button>
                        </div>
                      ) : (
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={(e)=> { e.stopPropagation(); setMenuOpen((m)=> m===r.id ? null : r.id); }}
                            className="h-8 w-8 rounded-full hover:bg-slate-100 inline-flex items-center justify-center"
                          >
                            <FiMoreVertical />
                          </button>
                          {menuOpen === r.id && (
                            <div className="absolute right-0 mt-2 w-32 rounded-xl border border-slate-200 bg-white shadow-sm" onClick={(e)=> e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={()=> iniciarEdicion(r)}
                                className="w-full text-left px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={()=> {
                                  setRegistros((prev)=> prev.filter((x)=> x.id !== r.id));
                                  setSeleccionados((prev)=> { const s = new Set(prev); s.delete(r.codigo); return s; });
                                  if (editando === r.id) { setEditando(null); setDraft(null); }
                                  setMenuOpen(null);
                                }}
                                className="w-full text-left px-3 py-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {agregarOpen && (
        <Agregarrapido
          open={agregarOpen}
          onClose={()=> setAgregarOpen(false)}
          onAdd={(data)=>{
            const nombreCompleto = `${data.nombre} ${data.apPaterno} ${data.apMaterno}`.trim();
            const codigo = `TEC${String(registros.length + 1).padStart(3, "0")}`;
            const nuevoReg: Registro = {
              id: `rec-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
              nombre: nombreCompleto || "Participante",
              codigo,
              telefono: data.telefono || "",
              correo: data.correo || "",
              institucion: data.institucion || "",
            };
            setRegistros((prev)=> [nuevoReg, ...prev]);
            setAgregarOpen(false);
          }}
        />
      )}
    </div>
  );
};




export default SeccionParticipantesDesenglose;
