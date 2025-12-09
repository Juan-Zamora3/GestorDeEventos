// src/modulos/administradorEventos/componentes/desengloseEvento/constancias/VerConstancia.tsx
import type {
  FC,
  DragEvent,
  CSSProperties,
  MouseEvent as ReactMouseEvent,
} from "react"; 
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { PlantillaItem } from "./SeccionPlantillasDesenglose";

interface Props {
  open: boolean;
  item: PlantillaItem;
  onClose: () => void;
  onGuardar: (data: { titulo: string; tipo: string }) => void;
}

/** Construye la URL del PDF para el MODAL con zoom fijo y sin UI */
const buildPdfSrc = (pdfUrl?: string) => {
  const base =
    pdfUrl && pdfUrl.trim() !== "" ? pdfUrl : "/Hackatec2.pdf";
  const zoom = "60";
  return `${base}#page=1&zoom=${zoom}`;
};

const VerConstancia: FC<Props> = ({ open, item, onClose, onGuardar }) => {
  const [formNombre, setFormNombre] = useState<string>(item.titulo);
  const [formTipo, setFormTipo] = useState<string>(item.tipo);
  const [archivoNombre, setArchivoNombre] = useState<string>("");
  const [archivoUrl, setArchivoUrl] = useState<string | undefined>(undefined);

  const [varTipografia, setVarTipografia] = useState<string>("Inter");
  const [varTam, setVarTam] = useState<number>(18);
  const [varAlign, setVarAlign] = useState<string>("Centrado");
  const [varColor, setVarColor] = useState<string>("#000000");
  const [varBold, setVarBold] = useState<boolean>(true);
  const [varItalic, setVarItalic] = useState<boolean>(false);
  const [varUnderline, setVarUnderline] = useState<boolean>(false);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [texto, setTexto] = useState<string>("");

  const previewRef = useRef<HTMLDivElement | null>(null);
  const [textPos, setTextPos] = useState<{ x: number; y: number }>({
    x: 50,
    y: 60,
  });
  const dragStartRef = useRef<{
    x: number;
    y: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    // limpiar blob cuando se destruye el componente
    return () => {
      if (archivoUrl && archivoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(archivoUrl);
      }
    };
  }, [archivoUrl]);

  // --- utilidades para variables/chips ---

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

        if (el.tagName === "BR") {
          pieces.push("\n");
          return;
        }

        const isBlock =
          el.tagName === "DIV" ||
          el.tagName === "P" ||
          el.tagName === "LI";

        el.childNodes.forEach(walk);

        if (isBlock) {
          pieces.push("\n");
        }
      }
    };

    root.childNodes.forEach(walk);

    const raw = pieces.join("");

    return raw
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd();
  };

  const makeChip = (v: string) => {
    const el = document.createElement("span");
    el.textContent = v;
    el.dataset.var = v;
    el.draggable = true;
    el.className =
      "inline-flex items-center px-2 py-[2px] rounded-full bg-[#E6E7EF] text-[11px] font-semibold text-slate-700 mx-[1px]";
    el.contentEditable = "false";
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer?.setData("application/x-var", v);
      e.dataTransfer?.setData("text/plain", `{${v}}`);
      e.dataTransfer!.effectAllowed = "copyMove";
    });
    return el;
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

  const placeNodeAtCaret = (node: Node) => {
    const sel = window.getSelection();
    const editor = contentRef.current;
    if (!editor) return;

    const inside =
      !!sel &&
      sel.rangeCount > 0 &&
      (sel.anchorNode === editor ||
        (sel.anchorNode && editor.contains(sel.anchorNode)));

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

  const insertVariable = (v: string) => {
    focusEditableEnd();
    const chip = makeChip(v);
    placeNodeAtCaret(chip);
    setTexto(serialize());
  };

  const startDragChip = (e: DragEvent<HTMLButtonElement>, v: string) => {
    const token = `{${v}}`;
    e.dataTransfer.setData("text/plain", token);
    e.dataTransfer.setData("text", token);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setDragImage(e.currentTarget, 10, 10);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    focusEditableEnd();
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

  const guardDropOutsideEditor = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as Node;
    const editor = contentRef.current;
    if (!editor) return;
    if (!editor.contains(target)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!open) return null;

  const guardar = () => {
    onGuardar({ titulo: formNombre, tipo: formTipo });
  };

  // PDF base: si el item trae una URL a PDF en `imagen`, la usamos
  const basePdfUrl =
    archivoUrl ||
    (item.imagen?.toLowerCase().endsWith(".pdf")
      ? item.imagen
      : undefined);

  const pdfSrc = buildPdfSrc(basePdfUrl);

  const previewTextStyle: CSSProperties = {
    fontFamily: varTipografia,
    fontSize: `${varTam}px`,
    color: varColor,
    fontWeight: varBold ? "700" : "400",
    fontStyle: varItalic ? "italic" : "normal",
    textDecoration: varUnderline ? "underline" : "none",
    textAlign:
      varAlign === "Izquierda"
        ? "left"
        : varAlign === "Derecha"
        ? "right"
        : "center",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  const handleTextMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragStartRef.current = {
      x: textPos.x,
      y: textPos.y,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
    setDragging(true);
  };

  const handlePreviewMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!dragging || !dragStartRef.current || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const { x, y, mouseX, mouseY } = dragStartRef.current;

    const dx = e.clientX - mouseX;
    const dy = e.clientY - mouseY;

    const startXPx = (x / 100) * rect.width;
    const startYPx = (y / 100) * rect.height;

    const newXPx = startXPx + dx;
    const newYPx = startYPx + dy;

    let newX = (newXPx / rect.width) * 100;
    let newY = (newYPx / rect.height) * 100;

    newX = Math.min(95, Math.max(5, newX));
    newY = Math.min(95, Math.max(5, newY));

    setTextPos({ x: newX, y: newY });
  };

  const handleStopDrag = () => {
    setDragging(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30"
      onDragOverCapture={guardDropOutsideEditor}
      onDropCapture={guardDropOutsideEditor}
    >
      <div className="w-[1600px] max-w-[98vw] h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <header className="px-8 py-5 bg-gradient-to-r from-[#3A62D6] to-[#5B4AE5] text-white flex items-center justify-between flex-none">
          <h2 className="text-lg font-semibold">
            Configuración De Constancia
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-full bg-white/20 text-white text-sm font-semibold"
          >
            Cerrar
          </button>
        </header>

        <div className="flex-1 px-6 py-5 flex gap-6 items-stretch overflow-x-hidden overflow-y-auto">
          {/* IZQUIERDA: datos + editor */}
          <div className="w-[360px] flex-none h-full overflow-y-auto">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Plantilla
              </label>
              <input
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
                placeholder="Ejemplo: Constancia de 1er lugar"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Constancia
              </label>
              <select
                value={formTipo}
                onChange={(e) => setFormTipo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
              >
                <option>Coordinador</option>
                <option>Edecan</option>
                <option>Gestor de constancias</option>
                <option>Maestro de ceremonias</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Archivo PDF (vista previa local)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setArchivoNombre(f?.name ?? "");
                    if (archivoUrl && archivoUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(archivoUrl);
                    }
                    setArchivoUrl(f ? URL.createObjectURL(f) : undefined);
                  }}
                />
                {archivoNombre && (
                  <button
                    type="button"
                    onClick={() => {
                      setArchivoNombre("");
                      if (archivoUrl && archivoUrl.startsWith("blob:")) {
                        URL.revokeObjectURL(archivoUrl);
                      }
                      setArchivoUrl(undefined);
                    }}
                    className="text-[11px] font-semibold text-rose-600"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              {archivoNombre && (
                <p className="text-[11px] text-slate-500 mt-1">
                  {archivoNombre}
                </p>
              )}
              <p className="text-[10px] text-slate-400 mt-1">
                Nota: por ahora este archivo solo se usa para la vista previa
                local. Para almacenarlo de forma definitiva se debe integrar
                Firebase Storage más adelante.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Variables disponibles
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Nombre",
                  "Fecha",
                  "Mensaje",
                  "Equipo",
                  "Concurso",
                  "Añadir",
                ].map((v) => (
                  <button
                    key={v}
                    type="button"
                    draggable
                    onDragStart={(e) =>
                      startDragChip(e, v === "Añadir" ? "Variable" : v)
                    }
                    onClick={() =>
                      insertVariable(v === "Añadir" ? "Variable" : v)
                    }
                    className="px-3 py-1.5 rounded-full bg-[#F2F3FB] text-[11px] font-semibold text-slate-700 cursor-grab active:cursor-grabbing"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Texto
              </label>
              <div
                ref={contentRef}
                contentEditable
                data-value={texto}
                onInput={() => setTexto(serialize())}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                }}
                onDrop={handleDrop}
                className="w-full h-[180px] overflow-y-auto rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none whitespace-pre-wrap break-words"
              />
            </div>

            <div className="mt-6 mb-2">
              <button
                type="button"
                onClick={guardar}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white shadow-sm"
              >
                Guardar
              </button>
            </div>
          </div>

          {/* CENTRO: vista previa del PDF + texto arrastrable */}
          <div className="flex-1 h-full overflow-y-auto min-w-0">
            <div className="border rounded-xl bg-[#F9FAFF] h-full flex items-center justify-center p-4">
              <div
                ref={previewRef}
                className="relative w-full max-w-[860px] h-[720px] rounded-xl bg-white shadow overflow-hidden"
                onMouseMove={handlePreviewMouseMove}
                onMouseUp={handleStopDrag}
                onMouseLeave={handleStopDrag}
              >
                <iframe
                  key={pdfSrc}
                  src={pdfSrc}
                  title="Vista previa PDF"
                  className="absolute inset-0 w-full h-full rounded-xl pointer-events-none"
                />
                <div
                  onMouseDown={handleTextMouseDown}
                  style={{
                    position: "absolute",
                    top: `${textPos.y}%`,
                    left: `${textPos.x}%`,
                    transform: "translate(-50%, -50%)",
                    cursor: dragging ? "grabbing" : "grab",
                    pointerEvents: "auto",
                  }}
                  className="px-6"
                >
                  <p
                    style={previewTextStyle}
                    className="max-h-[80%] max-w-[100%] overflow-hidden"
                  >
                    {texto || "Aquí aparecerá el texto de la constancia."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DERECHA: estilos de fuente */}
          <div className="w-[320px] flex-none h-full overflow-y-auto">
            <p className="text-sm font-semibold text-slate-900 mb-3">
              Detalles de la variable
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipografía
              </label>
              <select
                value={varTipografia}
                onChange={(e) => setVarTipografia(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
              >
                <option>Inter</option>
                <option>Roboto</option>
                <option>Montserrat</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tamaño de Fuente
              </label>
              <input
                type="number"
                value={varTam}
                onChange={(e) => setVarTam(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alineado
              </label>
              <select
                value={varAlign}
                onChange={(e) => setVarAlign(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF]"
              >
                <option>Izquierda</option>
                <option>Centrado</option>
                <option>Derecha</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={varColor}
                onChange={(e) => setVarColor(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-[#F9FAFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estilo de Fuente
              </label>
              <div className="space-y-2 text-[13px]">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={varBold}
                    onChange={(e) => setVarBold(e.target.checked)}
                    className="h-4 w-4 accent-[#5B4AE5]"
                  />
                  Negrita
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={varItalic}
                    onChange={(e) => setVarItalic(e.target.checked)}
                    className="h-4 w-4 accent-[#5B4AE5]"
                  />
                  Itálica
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={varUnderline}
                    onChange={(e) => setVarUnderline(e.target.checked)}
                    className="h-4 w-4 accent-[#5B4AE5]"
                  />
                  Subrayado
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default VerConstancia;
