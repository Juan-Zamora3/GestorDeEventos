// src/modulos/administradorEventos/componentes/desengloseEvento/constancias/SeccionConstanciasDesenglose.tsx
import type { FC } from "react";
import { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight,
  FiDownload,
  FiPrinter,
  FiEye,
  FiSend,
  FiClock,
} from "react-icons/fi";
import ModalDescargarConstancias from "./ModalDescargarConstancias";
import ModalEnviarConstancias from "./ModalEnviarConstancias";
import HistorialEnvioCorreos from "./HistorialEnvioCorreos";
import ModalImprimirConstancias from "./ModalImprimirConstancias";

interface Persona { id: string; nombre: string }
interface Categoria { id: string; titulo: string; personas: Persona[] }

const categorias: Categoria[] = [
  {
    id: "coordinadores",
    titulo: "Coordinadores",
    personas: ["Juan Zamora", "Israel Pelayo", "Julie Torres"].map((n, i) => ({
      id: `C${i + 1}`,
      nombre: n,
    })),
  },
  {
    id: "participantes",
    titulo: "Participantes",
    personas: [
      "Sofía González",
      "Santiago Rodríguez",
      "Valentina Martínez",
      "Sebastián García",
    ].map((n, i) => ({ id: `P${i + 1}`, nombre: n })),
  },
  {
    id: "asesores",
    titulo: "Asesores",
    personas: ["Lucía Ruiz", "Martín Navarro"].map((n, i) => ({
      id: `A${i + 1}`,
      nombre: n,
    })),
  },
];

const SeccionConstanciasDesenglose: FC = () => {
  const [catId, setCatId] = useState<string>(categorias[0].id);
  const [seleccionPorCat, setSeleccionPorCat] = useState<
    Record<string, Set<string>>
  >(() => {
    const s: Record<string, Set<string>> = {};
    categorias.forEach((c) => {
      s[c.id] = new Set(c.personas.map((p) => p.id));
    });
    return s;
  });
  const [index, setIndex] = useState<number>(0);
  const [openDescargar, setOpenDescargar] = useState(false);
  const [openEnviar, setOpenEnviar] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [openImprimir, setOpenImprimir] = useState(false);

  const actual = useMemo(
    () => categorias.find((c) => c.id === catId)!,
    [catId],
  );

  // dirección animación tabs (izq / der)
  const [lastCatIndex, setLastCatIndex] = useState<number>(0);
  const [navDir, setNavDir] = useState<number>(0);

  const cambiarCategoria = (id: string) => {
    const iNext = categorias.findIndex((c) => c.id === id);
    setNavDir(iNext > lastCatIndex ? 1 : -1);
    setLastCatIndex(iNext);
    setCatId(id);
    setIndex(0);
  };

  // scroll suave de tabs
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  useEffect(() => {
    const c = tabsContainerRef.current;
    const a = tabRefs.current[catId];
    if (!c || !a) return;
    const target = a.offsetLeft - c.clientWidth / 2 + a.clientWidth / 2;
    c.scrollTo({ left: target, behavior: "smooth" });
  }, [catId]);

  const seleccionIds = seleccionPorCat[catId] ?? new Set<string>();
  const seleccionados = actual.personas.filter((p) =>
    seleccionIds.has(p.id),
  );
  const total = seleccionados.length;
  const personaActual = seleccionados[index] ?? seleccionados[0];

  const togglePersona = (id: string) => {
    setSeleccionPorCat((prev) => {
      const next = { ...prev };
      const set = new Set(next[catId] ?? new Set<string>());
      if (set.has(id)) set.delete(id);
      else set.add(id);
      next[catId] = set;
      return next;
    });
    setIndex(0);
  };

  const seleccionarTodo = () => {
    setSeleccionPorCat((prev) => ({
      ...prev,
      [catId]: new Set(actual.personas.map((p) => p.id)),
    }));
    setIndex(0);
  };

  const anterior = () => {
    if (total) setIndex((i) => (i - 1 + total) % total);
  };
  const siguiente = () => {
    if (total) setIndex((i) => (i + 1) % total);
  };

  // === PLANTILLA PARA PREVIEW / ENVÍO ===
  // Por ahora está fija, cámbiala luego por la URL guardada en BD
  const PLANTILLA_PDF_URL = "/Hackatec2.pdf";
  const pdfSrc = `${PLANTILLA_PDF_URL}?ctx=constancias#page=1&zoom=page-width&toolbar=0&navpanes=0`;


  // misma idea que antes para generar imagen rápida
  const generarImagen = (nombre: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // franja decorativa derecha
    ctx.fillStyle = "#c62828";
    ctx.fillRect(760, 0, 40, canvas.height);

    ctx.fillStyle = "#6b7280";
    ctx.font = "28px Inter";
    ctx.textAlign = "center";
    ctx.fillText("CONSTANCIA", 400, 200);

    ctx.fillStyle = "#111827";
    ctx.font = "24px Inter";
    ctx.fillText(nombre, 400, 320);

    return canvas.toDataURL("image/png");
  };

  const descargar = () => {
    if (!personaActual) return;
    const url = generarImagen(personaActual.nombre);
    const a = document.createElement("a");
    a.href = url;
    a.download = `constancia_${personaActual.nombre}.png`;
    a.click();
  };

  const ver = () => {
    if (!personaActual) return;
    const url = generarImagen(personaActual.nombre);
    window.open(url, "_blank");
  };

  const imprimir = () => {
    setOpenImprimir(true);
  };

  return (
    <section className="px-6 sm:px-10 py-6">
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={imprimir}
            className="px-5 py-2.5 rounded-full bg-[#F2F3FB] text-sm font-semibold text-slate-700 inline-flex items-center gap-2 shadow-sm transform-gpu transition hover:bg-[#E9ECF9] hover:-translate-y-[1px] hover:scale-[1.02]"
          >
            <FiPrinter /> Imprimir
          </button>
          <button
            type="button"
            onClick={ver}
            className="px-5 py-2.5 rounded-full bg-[#F2F3FB] text-sm font-semibold text-slate-700 inline-flex items-center gap-2 shadow-sm transform-gpu transition hover:bg-[#E9ECF9] hover:-translate-y-[1px] hover:scale-[1.02]"
          >
            <FiEye /> Ver
          </button>
          <button
            type="button"
            onClick={() => setOpenHistorial(true)}
            className="px-5 py-2.5 rounded-full bg-[#F2F3FB] text-sm font-semibold text-slate-700 inline-flex items-center gap-2 shadow-sm transform-gpu transition hover:bg-[#E9ECF9] hover:-translate-y-[1px] hover:scale-[1.02]"
          >
            <FiClock /> Historial
          </button>
          <button
            type="button"
            onClick={() => setOpenEnviar(true)}
            className="px-5 py-2.5 rounded-full bg-[#F2F3FB] text-sm font-semibold text-slate-700 inline-flex items-center gap-2 shadow-sm transform-gpu transition hover:bg-[#E9ECF9] hover:-translate-y-[1px] hover:scale-[1.02]"
          >
            <FiSend /> Enviar
          </button>
          <button
            type="button"
            onClick={() => setOpenDescargar(true)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white inline-flex items-center gap-2 shadow-sm transform-gpu transition hover:brightness-110 hover:-translate-y-[1px] hover:scale-[1.02]"
          >
            <FiDownload /> Descargar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ===== LADO IZQUIERDO (categorías + selección personas) ===== */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="-mt-3 -mx-3 rounded-t-2xl bg-gradient-to-r from-[#192D69] to-[#6581D6] px-4 py-2">
            <div className="flex items-center justify-between">
              <motion.div
                ref={tabsContainerRef}
                className="flex items-center gap-6 overflow-x-auto px-2 no-scrollbar"
                key={catId}
                initial={{ x: navDir * 12, opacity: 0.98 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {categorias.map((c) => {
                  const active = c.id === catId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => cambiarCategoria(c.id)}
                      ref={(el) => {
                        tabRefs.current[c.id] = el;
                      }}
                      className={`text-xs font-semibold px-2 py-1 ${
                        active
                          ? "text-white border-b-2 border-white/70"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      {c.titulo}
                    </button>
                  );
                })}
              </motion.div>
              <button
                type="button"
                onClick={siguiente}
                className="text-white/90 hover:text-white inline-flex items-center"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2 mt-2">
            <p className="text-xs font-semibold text-slate-700">
              {actual.titulo}
            </p>
            <button
              type="button"
              onClick={seleccionarTodo}
              className="text-[11px] font-semibold text-[#356BFF]"
            >
              Seleccionar todo
            </button>
          </div>

          {/* Lista SIN scrollbar interno */}
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={`lista-${catId}`}
              className="space-y-1"
              initial={{ x: navDir * 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -navDir * 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              {actual.personas.map((p) => {
                const checked = seleccionIds.has(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
                      checked ? "bg-[#EFF0FF]" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePersona(p.id)}
                      className="h-4 w-4 accent-[#5B4AE5]"
                    />
                    <span className="text-xs text-slate-800">
                      {p.nombre}
                    </span>
                  </label>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </aside>

        {/* ===== LADO DERECHO: PREVIEW CON PLANTILLA ===== */}
        <main className="rounded-2xl border border-slate-200 bg-white p-4">
  <div className="flex items-center justify-between mb-3">
    <p className="text-sm font-semibold text-slate-900">Previsualización</p>
  </div>

  <div className="flex items-center justify-center">
    <div
      className="
        relative 
        w-[720px] 
        aspect-[210/297]       /* proporción carta vertical */
        bg-[#F9FAFF]
        rounded-xl 
        border border-slate-200 
        overflow-hidden
      "
    >
      {/* Fondo de la constancia (puede ser PNG o JPG generado de tu PDF) */}
     <iframe
  src={pdfSrc}
  title="Plantilla constancia"
  className="absolute inset-0 w-full h-full rounded-xl pointer-events-none"
/>

      {personaActual ? (
        <>
          {/* Aquí iría el texto fijo que será parte de la constancia si quieres */}
          {/* Título / texto fijo (opcional) */}
          {/* 
          <div
            className="absolute left-1/2 w-[70%] text-center"
            style={{ top: "47%", transform: "translateX(-50%)" }}
          >
            <p className="text-base font-semibold tracking-[0.15em] text-slate-700">
              CONSTANCIA
            </p>
          </div>
          */}

          {/* Nombre pegado a la constancia */}
          <div
            className="absolute left-1/2 w-[70%] text-center"
            style={{
              top: "34%",              // Mueve esto arriba/abajo hasta que quede exacto
              transform: "translateX(-55%)",
            }}
          >
            <p className="text-lg font-semibold text-[#1F2933] tracking-wide">
              {personaActual.nombre}
            </p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-slate-500">
            Selecciona personas para previsualizar
          </p>
        </div>
      )}
    </div>
  </div>

  <div className="mt-4 flex items-center justify-between">
    <button
      type="button"
      onClick={anterior}
      className="h-8 w-8 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white inline-flex items-center justify-center"
    >
      ‹
    </button>
    <p className="text-xs text-slate-600">
      Constancia {total ? index + 1 : 0} de {total}
    </p>
    <button
      type="button"
      onClick={siguiente}
      className="h-8 w-8 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white inline-flex items-center justify-center"
    >
      <FiChevronRight />
    </button>
  </div>
</main>

      </div>

      {/* ===== MODALES ===== */}
      {openDescargar && (
        <ModalDescargarConstancias
          abierto={openDescargar}
          onCerrar={() => setOpenDescargar(false)}
          onAceptar={(cfg) => {
            void cfg;
            setOpenDescargar(false);
            descargar();
          }}
        />
      )}
      {openImprimir && (
        <ModalImprimirConstancias
          abierto={openImprimir}
          categorias={categorias}
          onCerrar={() => setOpenImprimir(false)}
          onAceptar={(cfg) => {
            void cfg;
            setOpenImprimir(false);
          }}
        />
      )}
      {openEnviar && (
        <ModalEnviarConstancias
          abierto={openEnviar}
          onCerrar={() => setOpenEnviar(false)}
          onAceptar={(cfg) => {
            void cfg;
            setOpenEnviar(false);
          }}
        />
      )}
      {openHistorial && (
        <HistorialEnvioCorreos
          abierto={openHistorial}
          onCerrar={() => setOpenHistorial(false)}
        />
      )}
    </section>
  );
};

export default SeccionConstanciasDesenglose;
