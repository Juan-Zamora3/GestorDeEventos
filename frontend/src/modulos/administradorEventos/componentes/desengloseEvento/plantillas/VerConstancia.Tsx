import type { FC } from "react";
import { useRef, useState } from "react";

interface PlantillaItem {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  imagen: string;
}

interface Props {
  open: boolean;
  item: PlantillaItem;
  onClose: () => void;
  onGuardar: (data: { titulo: string; tipo: string }) => void;
}

const VerConstancia: FC<Props> = ({ open, item, onClose, onGuardar }) => {
  const [formNombre, setFormNombre] = useState<string>(item.titulo);
  const [formTipo, setFormTipo] = useState<string>(item.tipo);
  const [archivoNombre, setArchivoNombre] = useState<string>("");
  const [varTipografia, setVarTipografia] = useState<string>("Inter");
  const [varTam, setVarTam] = useState<number>(18);
  const [varAlign, setVarAlign] = useState<string>("Centrado");
  const [varColor, setVarColor] = useState<string>("#000000");
  const [varBold, setVarBold] = useState<boolean>(true);
  const [varItalic, setVarItalic] = useState<boolean>(false);
  const [varUnderline, setVarUnderline] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [texto, setTexto] = useState<string>("");

  const serialize = () => {
    const root = contentRef.current;
    if (!root) return "";
    const pieces: string[] = [];
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        pieces.push(node.textContent ?? "");
        return;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.dataset.var) {
          pieces.push(`{${el.dataset.var}}`);
          return;
        }
        el.childNodes.forEach(walk);
      }
    };
    root.childNodes.forEach(walk);
    return pieces.join("");
  };

  const makeChip = (v: string) => {
    const el = document.createElement("span");
    el.textContent = v;
    el.dataset.var = v;
    el.draggable = true;
    el.className = "inline-flex items-center px-2 py-[2px] rounded-full bg-[#E6E7EF] text-[11px] font-semibold text-slate-700 mx-[1px]";
    el.contentEditable = "false";
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer?.setData("application/x-var", v);
      e.dataTransfer?.setData("text/plain", `{${v}}`);
      e.dataTransfer!.effectAllowed = "copyMove";
    });
    return el;
  };

  const placeNodeAtCaret = (node: Node) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      contentRef.current?.append(node);
      return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const focusEditableEnd = () => {
    const el = contentRef.current;
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const insertVariable = (v: string) => {
    focusEditableEnd();
    const chip = makeChip(v);
    placeNodeAtCaret(chip);
    setTexto(serialize());
  };

  const startDrag = (e: React.DragEvent<HTMLButtonElement>, v: string) => {
    const token = `{${v}}`;
    e.dataTransfer.setData("text/plain", token);
    e.dataTransfer.setData("text", token);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setDragImage(e.currentTarget, 10, 10);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rawVar = e.dataTransfer.getData("application/x-var");
    if (rawVar) {
      const chip = makeChip(rawVar);
      placeNodeAtCaret(chip);
      setTexto(serialize());
      return;
    }
    const token = e.dataTransfer.getData("text/plain");
    if (token) {
      const m = token.match(/^\{(.+?)\}$/);
      const name = m ? m[1] : token;
      const chip = makeChip(name);
      placeNodeAtCaret(chip);
      setTexto(serialize());
    }
  };

  if (!open) return null;

  const guardar = () => { onGuardar({ titulo: formNombre, tipo: formTipo }); };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[1100px] max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <header className="px-8 py-5 bg-gradient-to-r from-[#3A62D6] to-[#5B4AE5] text-white flex items-center justify-between">
          <h2 className="text-lg font-semibold">Configuración De Constancia</h2>
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-full bg-white/20 text-white text-sm font-semibold">Cerrar</button>
        </header>
        <div className="flex-1 overflow-auto px-6 py-5 flex gap-6 items-start">
          <div className="w-[320px] flex-none">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Plantilla</label>
              <input value={formNombre} onChange={(e)=>setFormNombre(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" placeholder="Ejemplo: Constancia de 1er lugar" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Constancia</label>
              <select value={formTipo} onChange={(e)=>setFormTipo(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]">
                <option>Coordinador</option>
                <option>Edecan</option>
                <option>Gestor de constancias</option>
                <option>Maestro de ceremonias</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Archivo PDF</label>
              <div className="flex items-center gap-3">
                <input type="file" accept="application/pdf" onChange={(e)=> setArchivoNombre(e.target.files?.[0]?.name ?? "")} />
                {archivoNombre && (
                  <button type="button" onClick={()=> setArchivoNombre("")} className="text-[11px] font-semibold text-rose-600">Eliminar</button>
                )}
              </div>
              {archivoNombre && <p className="text-[11px] text-slate-500 mt-1">{archivoNombre}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Variables disponibles</label>
              <div className="flex flex-wrap gap-2">
                {['Nombre','Fecha','Mensaje','Equipo','Concurso','Añadir'].map((v)=>(
                  <button
                    key={v}
                    type="button"
                    draggable
                    onDragStart={(e)=> startDrag(e, v === 'Añadir' ? 'Variable' : v)}
                    onClick={()=> insertVariable(v === 'Añadir' ? 'Variable' : v)}
                    className="px-3 py-1.5 rounded-full bg-[#F2F3FB] text-[11px] font-semibold text-slate-700 cursor-grab active:cursor-grabbing"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Texto</label>
              <div
                ref={contentRef}
                contentEditable
                data-value={texto}
                onInput={()=> setTexto(serialize())}
                onDragOver={(e)=> { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                onDrop={handleDrop}
                className="w-full min-h-[120px] rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none"
              />
            </div>
            <div className="mt-6">
              <button type="button" onClick={guardar} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white shadow-sm">Guardar</button>
            </div>
          </div>
          <div className="flex-1">
            <div className="border rounded-xl overflow-hidden flex items-center justify-center bg-[#F9FAFF] h-[600px]">
              <img src={item.imagen} alt={item.titulo} className="max-h-full" />
            </div>
          </div>
          <div className="w-[280px] flex-none">
            <p className="text-sm font-semibold text-slate-900 mb-3">Detalles de la variable</p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipografia</label>
              <select value={varTipografia} onChange={(e)=>setVarTipografia(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]">
                <option>Inter</option>
                <option>Roboto</option>
                <option>Montserrat</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tamaño de Fuente</label>
              <input type="number" value={varTam} onChange={(e)=>setVarTam(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alineado</label>
              <select value={varAlign} onChange={(e)=>setVarAlign(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]">
                <option>Izquierda</option>
                <option>Centrado</option>
                <option>Derecha</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
              <input type="color" value={varColor} onChange={(e)=>setVarColor(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 bg-[#F9FAFF]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estilo de Fuente</label>
              <div className="space-y-2 text-[13px]">
                <label className="flex items-center gap-2"><input type="checkbox" checked={varBold} onChange={(e)=>setVarBold(e.target.checked)} className="h-4 w-4 accent-[#5B4AE5]" /> Negrita</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={varItalic} onChange={(e)=>setVarItalic(e.target.checked)} className="h-4 w-4 accent-[#5B4AE5]" /> Italica</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={varUnderline} onChange={(e)=>setVarUnderline(e.target.checked)} className="h-4 w-4 accent-[#5B4AE5]" /> Subrayado</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerConstancia;

