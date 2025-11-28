// Sección Formulario (Paso 5)
// Placeholder para definición de formularios de inscripción/asistencia.
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ModalPreguntaFormulario from "./ModalPreguntaFormulario";
import { FiMoreVertical, FiPlus } from "react-icons/fi";

type TipoCampo =
  | "texto_corto"
  | "texto_largo"
  | "email"
  | "telefono"
  | "seleccion_simple"
  | "seleccion_multiple"
  | "numero"
  | "fecha";

type PreguntaForm = {
  id: string;
  nombre: string;
  tipo: TipoCampo;
  placeholder?: string;
  obligatorio: boolean;
  config?: { opciones?: string[] };
};

const genId = () => `preg-${Math.random().toString(36).slice(2, 8)}`;

const BASE_PREGUNTAS: PreguntaForm[] = [
  { id: "preg-nombre", nombre: "Nombre Completo", tipo: "texto_corto", placeholder: "ej. Jose", obligatorio: true },
  { id: "preg-ap-paterno", nombre: "Apellido Paterno", tipo: "texto_corto", placeholder: "ej. Rodríguez", obligatorio: true },
  { id: "preg-ap-materno", nombre: "Apellido Materno", tipo: "texto_corto", placeholder: "ej. Martínez", obligatorio: false },
  { id: "preg-correo", nombre: "Correo", tipo: "email", placeholder: "ej. correo@email.com", obligatorio: true },
  { id: "preg-celular", nombre: "Celular", tipo: "telefono", placeholder: "ej. 6371004000", obligatorio: false },
  { id: "preg-institucion", nombre: "Institución", tipo: "seleccion_multiple", placeholder: "Selecciona tu instituto", obligatorio: false, config: { opciones: ["TecNM", "UANL", "UNAM"] } },
  { id: "preg-escolaridad", nombre: "Escolaridad", tipo: "seleccion_multiple", placeholder: "Selecciona tu escolaridad", obligatorio: false, config: { opciones: ["TSU", "Licenciatura", "Maestría"] } },
];

const labelTipo = (t: TipoCampo) => {
  switch (t) {
    case "texto_corto":
      return "Texto corto";
    case "texto_largo":
      return "Texto largo";
    case "email":
      return "Email";
    case "telefono":
      return "Teléfono";
    case "seleccion_simple":
      return "Selección simple";
    case "seleccion_multiple":
      return "Selección múltiple";
    case "numero":
      return "Número";
    case "fecha":
      return "Fecha";
  }
};

const SeccionFormulario: FC = () => {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"individual" | "equipos">("individual");
  const [preguntas, setPreguntas] = useState<PreguntaForm[]>(() => [...BASE_PREGUNTAS]);
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | undefined>(undefined);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modalModo, setModalModo] = useState<"crear" | "editar">("crear");
  const [preguntaEditando, setPreguntaEditando] = useState<PreguntaForm | undefined>(undefined);
  const abrirCrear = () => {
    setModalModo("crear");
    setPreguntaEditando(undefined);
    setModalAbierto(true);
  };
  const abrirEditar = (p: PreguntaForm) => {
    setModalModo("editar");
    setPreguntaEditando(p);
    setModalAbierto(true);
  };
  const cerrarModal = () => setModalAbierto(false);
  const manejarGuardar = (data: PreguntaForm) => {
    setPreguntas((prev) => {
      if (modalModo === "crear") return [...prev, { ...data, id: genId() }];
      if (modalModo === "editar" && preguntaEditando) return prev.map((p) => (p.id === preguntaEditando.id ? { ...p, ...data, id: preguntaEditando.id } : p));
      return prev;
    });
    setModalAbierto(false);
  };
  const manejarEliminar = (id: string) => {
    setPreguntas((prev) => prev.filter((p) => p.id !== id));
    setModalAbierto(false);
  };

  const preguntasConReglas = () => {
    if (modo !== "equipos") return preguntas;
    const regla = { id: "min-int", nombre: "Cantidad mínima de integrantes", tipo: "numero" as const, placeholder: "ej. 1", obligatorio: true };
    const equipoPreset: PreguntaForm[] = [
      { id: "equipo-lider-nombre", nombre: "Nombre-Líder", tipo: "texto_corto", placeholder: "ej. Juan", obligatorio: false },
      { id: "equipo-lider-ap-paterno", nombre: "Apellido paterno-Líder", tipo: "texto_corto", placeholder: "ej. Pérez", obligatorio: false },
      { id: "equipo-lider-ap-materno", nombre: "Apellido materno-Líder", tipo: "texto_corto", placeholder: "ej. García", obligatorio: false },
      { id: "equipo-lider-correo", nombre: "Correo-Líder", tipo: "email", placeholder: "ej. lider@correo.com", obligatorio: false },
      { id: "equipo-part1-nombre", nombre: "Nombre-participante1", tipo: "texto_corto", placeholder: "ej. Ana", obligatorio: false },
      { id: "equipo-part1-ap-paterno", nombre: "Apellido paterno-participante1", tipo: "texto_corto", placeholder: "ej. López", obligatorio: false },
      { id: "equipo-part1-ap-materno", nombre: "Apellido materno-participante1", tipo: "texto_corto", placeholder: "ej. Ruiz", obligatorio: false },
      { id: "equipo-part2-nombre", nombre: "Nombre-participante2", tipo: "texto_corto", placeholder: "ej. Carlos", obligatorio: false },
      { id: "equipo-part2-ap-paterno", nombre: "Apellido paterno-participante2", tipo: "texto_corto", placeholder: "ej. Hernández", obligatorio: false },
      { id: "equipo-part2-ap-materno", nombre: "Apellido materno-participante2", tipo: "texto_corto", placeholder: "ej. Díaz", obligatorio: false },
      { id: "equipo-asesor", nombre: "Asesor", tipo: "texto_corto", placeholder: "Nombre del asesor", obligatorio: false },
    ];
    return [regla, ...equipoPreset];
  };

  return (
    <section className="flex-1 h-full min-h-0 flex flex-col">
      <div className="px-10 pt-10 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Formulario</h1>
        <button type="button" onClick={abrirCrear} className="h-9 w-9 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white shadow-md flex items-center justify-center"><FiPlus /></button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-10 pb-6">
        <div className="mb-3 rounded-xl bg-[#F7F7FF] border border-[#E0DDFB] px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setModo("individual")} className={`px-3 py-1 rounded-full text-xs border ${modo === "individual" ? "bg-[#EFF0FF] border-[#C9C5FF] text-[#5B4AE5]" : "bg-white border-slate-300 text-slate-700"}`}>Individual</button>
            <button type="button" onClick={() => setModo("equipos")} className={`px-3 py-1 rounded-full text-xs border ${modo === "equipos" ? "bg-[#EFF0FF] border-[#C9C5FF] text-[#5B4AE5]" : "bg-white border-slate-300 text-slate-700"}`}>Equipos</button>
          </div>
          <p className="text-[11px] text-slate-600">En equipos, la cantidad mínima de integrantes es obligatoria; los demás campos son opcionales.</p>
        </div>
        </div>

        <div className="rounded-2xl border border-[#E0DDFB] bg-white p-0 overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <p className="text-xs font-semibold text-slate-700">Nuevo Campo</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="px-4 py-2">Nombre del Campo</th>
                <th className="px-4 py-2">Tipo de Campo</th>
                <th className="px-4 py-2">Texto de ejemplo</th>
                <th className="px-4 py-2">Obligatorio</th>
                <th className="px-4 py-2 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {preguntasConReglas().map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-800">{p.nombre}</td>
                  <td className="px-4 py-2 text-slate-700">{labelTipo(p.tipo)}</td>
                  <td className="px-4 py-2 text-slate-500">{p.placeholder ?? ""}</td>
                  <td className="px-4 py-2 text-slate-700">{p.obligatorio ? "Sí" : "No"}</td>
                  <td className="px-2 py-2 text-right">
                    <div className="relative inline-block">
                      <button type="button" onClick={() => setMenuAbiertoId(menuAbiertoId === p.id ? undefined : p.id)} className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center"><FiMoreVertical /></button>
                      {menuAbiertoId === p.id && (
                        <div className="absolute right-0 mt-2 w-28 bg-white border border-slate-200 rounded-xl shadow-md text-xs">
                          <button type="button" onClick={() => { setMenuAbiertoId(undefined); abrirEditar(p); }} className="block w-full text-left px-3 py-2 hover:bg-slate-50">Editar</button>
                          <button type="button" onClick={() => { setMenuAbiertoId(undefined); manejarEliminar(p.id); }} className="block w-full text-left px-3 py-2 hover:bg-slate-50">Eliminar</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <div className="px-10 flex items-center justify-between pt-4 border-t border-slate-100">
        <button type="button" onClick={() => navigate("../ajuste")} className="px-8 py-2.5 rounded-full bg-white text-slate-700 text-sm font-semibold shadow-sm border border-slate-200">Volver</button>
        <span className="text-xs text-slate-400">Paso <span className="font-semibold text-slate-600">5</span> de <span className="font-semibold text-slate-600">5</span></span>
        <button type="button" className="px-8 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md">Finalizar</button>
      </div>

      <ModalPreguntaFormulario
        abierto={modalAbierto}
        modo={modalModo}
        pregunta={preguntaEditando}
        onGuardar={manejarGuardar}
        onEliminar={(id) => manejarEliminar(id)}
        onCerrar={cerrarModal}
      />
    </section>
  );
};

export default SeccionFormulario;
