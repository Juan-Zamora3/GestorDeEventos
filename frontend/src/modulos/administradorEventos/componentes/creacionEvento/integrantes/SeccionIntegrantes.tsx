// Sección Integrantes (Paso 3)
// Permite elegir modalidad de participación (individual/equipos) y configurar opciones.
// Incluye: selector de modalidad, definición de cupos, categorías y campos necesarios.
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { CampoEvento } from "../../tiposAdminEventos";
import ModalCampoEvento from "../ModalCampoEvento";
import ModalCategoriaIntegrantes from "./ModalCategoriaIntegrantes";
import { FiUser, FiUsers } from "react-icons/fi";
import type { Categoria } from "./ModalCategoriaIntegrantes";

const SeccionIntegrantes: FC = () => {
  const navigate = useNavigate();
  // Estado de modalidad: individual o por equipos
  const [modo, setModo] = useState<"individual" | "equipos">("individual");
  // Cupos para individual
  const [maxParticipantes, setMaxParticipantes] = useState<string>("");
  // Cupos para equipos
  const [maxEquipos, setMaxEquipos] = useState<string>("");
  const [minIntegrantes, setMinIntegrantes] = useState<string>("1");
  const [maxIntegrantes, setMaxIntegrantes] = useState<string>("5");
  const [seleccion, setSeleccion] = useState<Record<"asesor" | "lider_equipo", boolean>>({ asesor: false, lider_equipo: false });
  const toggleSel = (id: "asesor" | "lider_equipo") => setSeleccion((prev) => ({ ...prev, [id]: !prev[id] }));

  // Campos necesarios (variables) con predefinidos inmutables
  const baseCampos: CampoEvento[] = [
    { id: "campo-nombre", nombre: "Nombre", tipo: "texto", immutable: true },
    { id: "campo-correo", nombre: "Correo", tipo: "texto", immutable: true },
    { id: "campo-telefono", nombre: "Telefono", tipo: "texto", immutable: true },
    { id: "campo-institucion", nombre: "Institución", tipo: "texto", immutable: true },
  ];
  const [campos, setCampos] = useState<CampoEvento[]>(baseCampos);
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
    setCampos((prev) => {
      if (modalCampoModo === "crear") {
        return [...prev, { id: generarCampoId(), nombre: data.nombre, tipo: data.tipo }];
      }
      if (modalCampoModo === "editar" && campoEditando) {
        return prev.map((c) => (c.id === campoEditando.id ? { ...c, nombre: data.nombre, tipo: data.tipo } : c));
      }
      return prev;
    });
    setModalCampoAbierto(false);
  };
  const manejarEliminarCampo = (id: string) => { setCampos((prev) => prev.filter((c) => c.id !== id)); setModalCampoAbierto(false); };

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
            onClick={() => setModo("individual")}
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
            onClick={() => setModo("equipos")}
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
              <input type="number" min={1} placeholder="ej. 500" value={maxParticipantes} onChange={(e) => setMaxParticipantes(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Máx. equipos participantes</label>
                <input type="number" min={1} placeholder="ej. 50" value={maxEquipos} onChange={(e) => setMaxEquipos(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Mín. integrantes por equipo</label>
                <input type="number" min={1} placeholder="ej. 1" value={minIntegrantes} onChange={(e) => setMinIntegrantes(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Máx. integrantes por equipo</label>
                <input type="number" min={1} placeholder="ej. 5" value={maxIntegrantes} onChange={(e) => setMaxIntegrantes(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
              </div>
            </div>
          )}


          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Selección</p>
            <div className="rounded-xl  px-1 py-3">
              <p className="text-[11px] text-slate-600">Selección de opciones adicionales según modalidad.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(modo === "equipos"
                ? [
                    { id: "asesor", titulo: "Asesor", desc: "Habilitar asesor en equipos." },
                    { id: "lider_equipo", titulo: "Líder de equipo", desc: "Permitir seleccionar líder del equipo." },
                  ]
                : [
                    { id: "asesor", titulo: "Asesor", desc: "Habilitar registro de asesor para participantes." },
                  ]
              ).map((opt) => {
                const activo = !!seleccion[opt.id as keyof typeof seleccion];
                return (
                  <div key={opt.id} className={`rounded-2xl border px-4 py-3 ${activo ? "bg-[#EFF0FF] border-[#C9C5FF]" : "bg-white border-slate-200"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${activo ? "text-[#5B4AE5]" : "text-slate-700"}`}>{opt.titulo}</span>
                      <button type="button" onClick={() => toggleSel(opt.id as "asesor" | "lider_equipo")} className={`h-5 w-10 rounded-full transition ${activo ? "bg-[#5B4AE5]" : "bg-slate-300"}`}>
                        <span className={`block h-5 w-5 bg-white rounded-full shadow transform transition ${activo ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

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

          {/* Campos necesarios */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">Campos necesarios</p>
            <button type="button" onClick={abrirCrearCampo} className="h-9 w-9 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white shadow-md flex items-center justify-center">+</button>
          </div>
          <div className="mb-1 rounded-xl bg-[#F7F7FF] border border-[#E0DDFB] px-4 py-3">
            <p className="text-[11px] text-slate-600">Los siguientes campos se convierten en variables y parte del formulario de inscripción. Los inmutables aparecen en gris.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {campos.map((campo) => {
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
      {/* Footer con navegación del wizard */}
      <div className="px-10 flex items-center justify-between pt-4 border-t border-slate-100">
        <button type="button" onClick={() => navigate("../personal")} className="px-8 py-2.5 rounded-full bg-white text-slate-700 text-sm font-semibold shadow-sm border border-slate-200">Volver</button>
        <span className="text-xs text-slate-400">Paso <span className="font-semibold text-slate-600">3</span> de <span className="font-semibold text-slate-600">5</span></span>
        <button type="button" onClick={() => navigate("../ajuste")} className="px-8 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md">Siguiente</button>
      </div>

      {/* Modales */}
      <ModalCampoEvento key={`${modalCampoModo}-${campoEditando?.id ?? 'nuevo'}`} abierto={modalCampoAbierto} modo={modalCampoModo} campo={campoEditando} onGuardar={manejarGuardarCampo} onEliminar={manejarEliminarCampo} onCerrar={cerrarModalCampo} />
      <ModalCategoriaIntegrantes abierto={modalCatAbierto} modo={modalCatModo} categoria={categoriaEditando} onGuardar={manejarGuardarCategoria} onCerrar={cerrarModalCategoria} />
    </section>
  );
};

export default SeccionIntegrantes;
