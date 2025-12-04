import { useRef, useState } from "react";
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
  const editorRef = useRef<HTMLDivElement | null>(null);

  if (!abierto) return null;

  const serialize = () => {
    const root = editorRef.current;
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
    const editor = editorRef.current;
    if (!editor) return;
    const inside = !!sel && sel.rangeCount > 0 && (sel.anchorNode === editor || (sel.anchorNode && editor.contains(sel.anchorNode)));
    if (!inside) {
      focusEditableEnd();
    }
    const nextSel = window.getSelection();
    if (!nextSel || nextSel.rangeCount === 0) {
      editor.append(node);
      return;
    }
    const range = nextSel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    nextSel.removeAllRanges();
    nextSel.addRange(range);
  };

  const focusEditableEnd = () => {
    const el = editorRef.current;
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
    setMensaje(serialize());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    focusEditableEnd();
    const rawVar = e.dataTransfer.getData("application/x-var");
    if (rawVar) {
      const chip = makeChip(rawVar);
      placeNodeAtCaret(chip);
      setMensaje(serialize());
      return;
    }
    const token = e.dataTransfer.getData("text/plain");
    if (token) {
      const m = token.match(/^\{(.+?)\}$/);
      const name = m ? m[1] : token;
      const chip = makeChip(name);
      placeNodeAtCaret(chip);
      setMensaje(serialize());
    }
  };

  const guardDropOutsideEditor = (e: React.DragEvent<HTMLDivElement>) => {
    const target = e.target as Node;
    const editor = editorRef.current;
    if (!editor) return;
    if (!editor.contains(target)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
      onDragOverCapture={(e)=> guardDropOutsideEditor(e)}
      onDropCapture={(e)=> guardDropOutsideEditor(e)}
    >
      <div className="w-[900px] h-[70vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-8 py-6 flex-1 overflow-auto">
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
                      <button
                        key={v}
                        type="button"
                        draggable
                        onDragStart={(e)=> {
                          const name = v === "Añadir" ? "Variable" : v;
                          const token = `{${name}}`;
                          e.dataTransfer.setData("text/plain", token);
                          e.dataTransfer.setData("text", token);
                          e.dataTransfer.effectAllowed = "copy";
                          e.dataTransfer.setDragImage(e.currentTarget, 10, 10);
                        }}
                        onClick={()=> insertVariable(v === "Añadir" ? "Variable" : v)}
                        className="px-3 py-1.5 rounded-full bg-[#F2F3FB] text-[11px] font-semibold text-slate-700 cursor-grab active:cursor-grabbing"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    data-value={mensaje}
                    onInput={()=> setMensaje(serialize())}
                    onDragOver={(e)=> { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                    onDrop={handleDrop}
                    className="w-full min-h-[120px] rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
          {canal === "WhatsApp" && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-700 mb-1">Mensaje</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {variables.map((v)=> (
                  <button
                    key={v}
                    type="button"
                    draggable
                    onDragStart={(e)=> {
                      const name = v === "Añadir" ? "Variable" : v;
                      const token = `{${name}}`;
                      e.dataTransfer.setData("text/plain", token);
                      e.dataTransfer.setData("text", token);
                      e.dataTransfer.effectAllowed = "copy";
                      e.dataTransfer.setDragImage(e.currentTarget, 10, 10);
                    }}
                    onClick={()=> insertVariable(v === "Añadir" ? "Variable" : v)}
                    className="px-3 py-1.5 rounded-full bg-[#F2F3FB] text-[11px] font-semibold text-slate-700 cursor-grab active:cursor-grabbing"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div
                ref={editorRef}
                contentEditable
                data-value={mensaje}
                onInput={()=> setMensaje(serialize())}
                onDragOver={(e)=> { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                onDrop={handleDrop}
                className="w-full min-h-[120px] rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none"
              />
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
