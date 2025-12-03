// Sección Integrantes (Paso 3)
// Permite elegir modalidad de participación (individual/equipos) y configurar opciones.
// Incluye: selector de modalidad, definición de cupos, categorías y campos necesarios.
import type { FC } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useState } from "react";
import type { CampoEvento, ParticipantesDraft } from "../../tiposAdminEventos";
import ModalCampoEvento from "../ModalCampoEvento";
import ModalCategoriaIntegrantes from "./ModalCategoriaIntegrantes";
import { FiUser, FiUsers } from "react-icons/fi";
import type { Categoria } from "./ModalCategoriaIntegrantes";
import FooterAdminEventos from "../../comunes/FooterAdminEventos";

const SeccionIntegrantes: FC = () => {
  const navigate = useNavigate();
  const { participantes, setParticipantes } = useOutletContext<{ participantes: ParticipantesDraft; setParticipantes: React.Dispatch<React.SetStateAction<ParticipantesDraft>> }>();
  // Estado de modalidad: individual o por equipos
  const modo = participantes.modo;
  // Cupos para individual
  const maxParticipantes = participantes.maxParticipantes;
  // Cupos para equipos
  const maxEquipos = participantes.maxEquipos;
  const minIntegrantes = participantes.minIntegrantes;
  const maxIntegrantes = participantes.maxIntegrantes;
  const seleccion = participantes.seleccion;
  const toggleSel = (id: "asesor" | "lider_equipo") => setParticipantes((prev) => ({ ...prev, seleccion: { ...prev.seleccion, [id]: !prev.seleccion[id] } }));

  
  const [perfilSeleccionadoId, setPerfilSeleccionadoId] = useState<string>("participante");
  const camposPorPerfil = participantes.camposPorPerfil;
  const [campoSeleccionadoId, setCampoSeleccionadoId] = useState<string | undefined>(undefined);

  // Categorías
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalCampoAbierto, setModalCampoAbierto] = useState<boolean>(false);
  const [modalCampoModo, setModalCampoModo] = useState<"crear" | "editar">("crear");
  const [campoEditando, setCampoEditando] = useState<CampoEvento | undefined>(undefined);
  const [modalCatAbierto, setModalCatAbierto] = useState<boolean>(false);
  const [modalCatModo, setModalCatModo] = useState<"crear" | "editar">("crear");
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | undefined>(undefined);

  const generarCampoId = () => `campo-${Math.random().toString(36).slice(2, 8)}`;
  const generarCatId = () => `cat-${Math.random().toString(36).slice(2, 8)}`;

  const abrirCrearCampo = () => { setModalCampoModo("crear"); setCampoEditando(undefined); setModalCampoAbierto(true); };
  const abrirEditarCampo = (campo: CampoEvento) => { if (campo.immutable) return; setModalCampoModo("editar"); setCampoEditando(campo); setModalCampoAbierto(true); };
  const cerrarModalCampo = () => setModalCampoAbierto(false);
  const manejarGuardarCampo = (data: CampoEvento) => {
    setParticipantes((prev) => {
      const lista = prev.camposPorPerfil[perfilSeleccionadoId] ?? [];
      if (modalCampoModo === "crear") {
        return { ...prev, camposPorPerfil: { ...prev.camposPorPerfil, [perfilSeleccionadoId]: [...lista, { id: generarCampoId(), nombre: data.nombre, tipo: data.tipo }] } };
      }
      if (modalCampoModo === "editar" && campoEditando) {
        return { ...prev, camposPorPerfil: { ...prev.camposPorPerfil, [perfilSeleccionadoId]: lista.map((c) => (c.id === campoEditando.id ? { ...c, nombre: data.nombre, tipo: data.tipo } : c)) } };
      }
      return prev;
    });
    setModalCampoAbierto(false);
  };
  const manejarEliminarCampo = (id: string) => {
    setParticipantes((prev) => ({
      ...prev,
      camposPorPerfil: {
        ...prev.camposPorPerfil,
        [perfilSeleccionadoId]: (prev.camposPorPerfil[perfilSeleccionadoId] ?? []).filter((c) => c.id !== id),
      },
    }));
    setModalCampoAbierto(false);
  };

  const abrirCrearCategoria = () => { setModalCatModo("crear"); setCategoriaEditando(undefined); setModalCatAbierto(true); };
  const abrirEditarCategoria = (cat: Categoria) => { setModalCatModo("editar"); setCategoriaEditando(cat); setModalCatAbierto(true); };
  const cerrarModalCategoria = () => setModalCatAbierto(false);
  const manejarGuardarCategoria = (data: Categoria) => {
    setCategorias((prev) => {
      if (modalCatModo === "crear") {
        return [...prev, { id: generarCatId(), nombre: data.nombre, cupo: data.cupo }];
      }
      if (modalCatModo === "editar" && categoriaEditando) {
        return prev.map((c) => (c.id === categoriaEditando.id ? { ...c, nombre: data.nombre, cupo: data.cupo } : c));
      }
      return prev;
    });
    setModalCatAbierto(false);
  };

  return (
    // Contenedor principal con header fijo, contenido con scroll y footer fijo
    <section className="flex-1 h-full min-h-0 flex flex-col">
      <div className="px-10 pt-10">
        <h1 className="text-2xl font-semibold text-slate-900">Participantes</h1>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-10 pb-6">
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-700 mb-2">Modalidad</p>
          {/* Leyenda de uso */}
          <div className="mb-3 rounded-xl bg-[#F7F7FF] border border-[#E0DDFB] px-4 py-3">
            <p className="text-[11px] text-slate-600">Elige si tu evento registra participantes de forma individual o por equipos. Según tu selección, configura los cupos y categorías.</p>
          </div>
          {/* Selector de modalidad tipo cards con iconos */}
          <div className="flex flex-wrap gap-4 mb-4">
          <button
            type="button"
            aria-label="Modo Individual"
            onClick={() => setParticipantes((prev) => ({ ...prev, modo: "individual" }))}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition w-full sm:w-auto ${
              modo === "individual"
                ? "bg-[#EFF0FF] border-[#C9C5FF] text-[#5B4AE5]"
                : "bg-white border-slate-200 text-slate-700 hover:bg-[#F8F8FF]"
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              modo === "individual" ? "bg-[#E7E6FF] text-[#5B4AE5]" : "bg-slate-100 text-slate-600"
            }`}>
              <FiUser size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold">Individual</p>
              <p className="text-[11px] text-slate-500">Cada participante se registra por separado</p>
            </div>
          </button>

          <button
            type="button"
            aria-label="Modo por equipos"
            onClick={() => setParticipantes((prev) => ({ ...prev, modo: "equipos" }))}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition w-full sm:w-auto ${
              modo === "equipos"
                ? "bg-[#EFF0FF] border-[#C9C5FF] text-[#5B4AE5]"
                : "bg-white border-slate-200 text-slate-700 hover:bg-[#F8F8FF]"
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              modo === "equipos" ? "bg-[#E7E6FF] text-[#5B4AE5]" : "bg-slate-100 text-slate-600"
            }`}>
              <FiUsers size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold">Por equipos</p>
              <p className="text-[11px] text-slate-500">Los participantes forman equipos</p>
            </div>
          </button>
        </div>
        {/* Opciones según modalidad */}
        <div className="rounded-2xl border border-[#E0DDFB] bg-white p-4 space-y-4">
          {modo === "individual" ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Definir cantidad máxima de participantes</label>
              <input type="number" min={1} placeholder="ej. 500" value={maxParticipantes} onChange={(e) => setParticipantes((prev) => ({ ...prev, maxParticipantes: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Máx. equipos participantes</label>
                <input type="number" min={1} placeholder="ej. 50" value={maxEquipos} onChange={(e) => setParticipantes((prev) => ({ ...prev, maxEquipos: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Mín. integrantes por equipo</label>
                <input type="number" min={1} placeholder="ej. 1" value={minIntegrantes} onChange={(e) => setParticipantes((prev) => ({ ...prev, minIntegrantes: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Máx. integrantes por equipo</label>
                <input type="number" min={1} placeholder="ej. 5" value={maxIntegrantes} onChange={(e) => setParticipantes((prev) => ({ ...prev, maxIntegrantes: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
              </div>
            </div>
          )}


          {/* Categorías */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">Categorías</p>
            <button type="button" onClick={abrirCrearCategoria} className="h-9 w-9 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white shadow-md flex items-center justify-center">+</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {categorias.length === 0 ? (
              <p className="text-xs text-slate-500">No se han agregado categorías.</p>
            ) : (
              categorias.map((cat) => (
                <button key={cat.id} type="button" onDoubleClick={() => abrirEditarCategoria(cat)} className="inline-flex items-center rounded-full px-4 py-2 text-sm border bg-white text-slate-700 border-slate-300 hover:bg-[#EFF0FF] hover:text-[#5B4AE5] hover:border-[#C9C5FF]">{cat.nombre} <span className="ml-2 text-slate-400">{cat.cupo}</span></button>
              ))
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Selección</p>
            <div className="rounded-xl px-1 py-3">
              <p className="text-[11px] text-slate-600">Selecciona el perfil para configurar sus campos. En equipos, el perfil "Integrante" siempre está activo y no se puede apagar.</p>
            </div>
            <div className={`grid grid-cols-1 ${modo === "equipos" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-3`}>
              {(
                modo === "equipos"
                  ? [
                      { id: "integrante", titulo: "Integrante", desc: "Variables de integrantes del equipo.", toggle: false },
                      { id: "lider_equipo", titulo: "Líder de equipo", desc: "Permitir seleccionar líder del equipo.", toggle: true },
                      { id: "asesor", titulo: "Asesor", desc: "Habilitar asesor en equipos.", toggle: true },
                    ]
                  : [
                      { id: "participante", titulo: "Participante", desc: "Variables del participante individual.", toggle: false },
                      { id: "asesor", titulo: "Asesor", desc: "Habilitar registro de asesor.", toggle: true },
                    ]
              ).map((opt) => {
                const activoPerfil = perfilSeleccionadoId === opt.id;
                const switchOn = opt.toggle ? !!seleccion[opt.id as keyof typeof seleccion] : true;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPerfilSeleccionadoId(opt.id)}
                    className={`text-left rounded-2xl border px-4 py-3 transition min-h-[72px] flex flex-col gap-1 ${activoPerfil ? "bg-[#EFF0FF] border-[#C9C5FF]" : switchOn ? "bg-white border-slate-200 hover:bg-[#EFF0FF] hover:border-[#C9C5FF]" : "bg-white border-slate-200"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${activoPerfil ? "text-[#5B4AE5]" : switchOn ? "text-slate-700" : "text-slate-400"}`}>{opt.titulo}</span>
                      {opt.toggle && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleSel(opt.id as "asesor" | "lider_equipo"); }}
                          className={`h-5 w-10 rounded-full transition ${switchOn ? "bg-[#5B4AE5]" : "bg-slate-300"}`}
                        >
                          <span className={`block h-5 w-5 bg-white rounded-full shadow transform transition ${switchOn ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      )}
                    </div>
                    <p className={`text-[11px] ${switchOn ? "text-slate-500" : "text-slate-400"}`}>{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campos necesarios del perfil seleccionado */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">Campos necesarios</p>
            <button type="button" onClick={abrirCrearCampo} className="h-9 w-9 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white shadow-md flex items-center justify-center">+</button>
          </div>
          <div className="mb-1 rounded-xl bg-[#F7F7FF] border border-[#E0DDFB] px-4 py-3">
            <p className="text-[11px] text-slate-600">Los siguientes campos se convierten en variables y parte del formulario de inscripción. Los inmutables aparecen en gris.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {(camposPorPerfil[perfilSeleccionadoId] ?? []).map((campo) => {
              const seleccionado = campoSeleccionadoId === campo.id;
              const noEditable = !!campo.immutable;
              const baseClase = `inline-flex items-center rounded-full px-4 py-2 text-sm border transition`;
              const claseEstado = noEditable
                ? "bg-slate-200 text-slate-600 border-slate-300"
                : seleccionado
                  ? "bg-[#EFF0FF] text-[#5B4AE5] border-[#C9C5FF]"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-[#EFF0FF] hover:text-[#5B4AE5] hover:border-[#C9C5FF]";
              return (
                <button key={campo.id} type="button" onClick={() => setCampoSeleccionadoId(campo.id)} onDoubleClick={() => abrirEditarCampo(campo)} className={`${baseClase} ${claseEstado}`}>{campo.nombre}</button>
              );
            })}
          </div>
        </div>
        </div>
      </div>
      <FooterAdminEventos onBack={() => navigate("../personal")} onNext={() => navigate("../ajuste")} step={{ current: 3, total: 5 }} />

      {/* Modales */}
      <ModalCampoEvento key={`${modalCampoModo}-${campoEditando?.id ?? 'nuevo'}`} abierto={modalCampoAbierto} modo={modalCampoModo} campo={campoEditando} onGuardar={manejarGuardarCampo} onEliminar={manejarEliminarCampo} onCerrar={cerrarModalCampo} />
      <ModalCategoriaIntegrantes abierto={modalCatAbierto} modo={modalCatModo} categoria={categoriaEditando} onGuardar={manejarGuardarCategoria} onCerrar={cerrarModalCategoria} />
    </section>
  );
};

export default SeccionIntegrantes;
