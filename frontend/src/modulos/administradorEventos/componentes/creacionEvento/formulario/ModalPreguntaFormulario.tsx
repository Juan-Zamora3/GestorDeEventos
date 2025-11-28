import { useState } from "react";
import type { FC } from "react";
import { FiTrash2 } from "react-icons/fi";

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

interface Props {
  abierto: boolean;
  modo: "crear" | "editar";
  pregunta?: PreguntaForm;
  onGuardar: (pregunta: PreguntaForm) => void;
  onEliminar?: (id: string) => void;
  onCerrar: () => void;
}

const ModalPreguntaFormulario: FC<Props> = ({ abierto, modo, pregunta, onGuardar, onEliminar, onCerrar }) => {
  const [nombre, setNombre] = useState<string>(pregunta?.nombre ?? "");
  const [tipo, setTipo] = useState<TipoCampo>(pregunta?.tipo ?? "texto_corto");
  const [placeholder, setPlaceholder] = useState<string>(pregunta?.placeholder ?? "");
  const [obligatorio, setObligatorio] = useState<boolean>(pregunta?.obligatorio ?? false);
  const [opcionNueva, setOpcionNueva] = useState<string>("");
  const [opciones, setOpciones] = useState<string[]>(pregunta?.config?.opciones ?? []);

  if (!abierto) return null;

  const titulo = modo === "crear" ? "Agregar pregunta" : "Editar pregunta";
  const textoAccion = modo === "crear" ? "Agregar" : "Guardar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config = tipo === "seleccion_simple" || tipo === "seleccion_multiple" ? { opciones } : undefined;
    const base: PreguntaForm = {
      id: pregunta?.id ?? "",
      nombre: nombre.trim(),
      tipo,
      placeholder: placeholder.trim(),
      obligatorio,
      config,
    };
    onGuardar(base);
  };

  const addOpcion = () => {
    const val = opcionNueva.trim();
    if (!val) return;
    setOpciones((prev) => [...prev, val]);
    setOpcionNueva("");
  };

  const removeOpcion = (idx: number) => {
    setOpciones((prev) => prev.filter((_, i) => i !== idx));
  };

  const showOpciones = tipo === "seleccion_simple" || tipo === "seleccion_multiple";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 overflow-y-auto">
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-[680px] max-h-[80vh] overflow-y-auto py-6 px-8">
        {modo === "editar" && pregunta?.id && (
          <button type="button" onClick={() => onEliminar && onEliminar(pregunta.id)} className="absolute right-4 top-4 p-2 rounded-full text-rose-600 hover:bg-rose-50" aria-label="Eliminar">
            <FiTrash2 />
          </button>
        )}
        <h2 className="text-xl font-semibold text-slate-800 mb-4">{titulo}</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Texto de la pregunta</label>
            <input type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ej. Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de campo</label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" value={tipo} onChange={(e) => setTipo(e.target.value as TipoCampo)}>
                <option value="texto_corto">Texto corto</option>
                <option value="texto_largo">Texto largo</option>
                <option value="email">Email</option>
                <option value="telefono">Teléfono</option>
                <option value="seleccion_simple">Selección simple</option>
                <option value="seleccion_multiple">Selección múltiple</option>
                <option value="numero">Número</option>
                <option value="fecha">Fecha</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Texto de ejemplo</label>
              <input type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ej. Ingresa tu respuesta" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Obligatoria</span>
            <button type="button" onClick={() => setObligatorio(!obligatorio)} className={`h-5 w-10 rounded-full transition ${obligatorio ? "bg-[#5B4AE5]" : "bg-slate-300"}`}>
              <span className={`block h-5 w-5 bg-white rounded-full shadow transform transition ${obligatorio ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {showOpciones && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-700">Opciones</p>
              <div className="flex items-center gap-2">
                <input type="text" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Agregar opción" value={opcionNueva} onChange={(e) => setOpcionNueva(e.target.value)} />
                <button type="button" onClick={addOpcion} className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-xs font-semibold">Añadir</button>
              </div>
              {opciones.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {opciones.map((opt, idx) => (
                    <span key={`${opt}-${idx}`} className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border bg-white text-slate-700 border-slate-300">
                      {opt}
                      <button type="button" onClick={() => removeOpcion(idx)} className="text-slate-500 hover:text-rose-600">×</button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">Aún no hay opciones.</p>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onCerrar} className="px-6 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">Cancelar</button>
            <button type="submit" className="px-6 py-2 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold">{textoAccion}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPreguntaFormulario;
