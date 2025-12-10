// src/modulos/administradorGeneral/componentes/desengloseEvento/constancias/SeccionConstanciasDesenglose.tsx
import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight,
  FiDownload,
  FiPrinter,
  FiSend,
  FiClock,
} from "react-icons/fi";

interface Persona {
  id: string;
  nombre: string;
}

interface Categoria {
  id: string;
  titulo: string;
  personas: Persona[];
}

// Mock de categorías/personas mientras conectas a BD
const categorias: Categoria[] = [
  {
    id: "coordinadores",
    titulo: "Coordinadores",
    personas: ["Juan Zamora", "Israel Pelayo", "Julie Torres"].map(
      (n, i) => ({
        id: `C${i + 1}`,
        nombre: n,
      }),
    ),
  },
  {
    id: "participantes",
    titulo: "Participantes",
    personas: [
      "Sofía González",
      "Santiago Rodríguez",
      "Valentina Martínez",
      "Sebastián García",
    ].map((n, i) => ({
      id: `P${i + 1}`,
      nombre: n,
    })),
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
  const [catId, setCatId] = useState<string>(categorias[0]?.id ?? "");
  const [seleccionPorCat, setSeleccionPorCat] = useState<
    Record<string, Set<string>>
  >(() => {
    const s: Record<string, Set<string>> = {};
    categorias.forEach((c) => {
      s[c.id] = new Set(c.personas.map((p) => p.id)); // todos seleccionados al inicio
    });
    return s;
  });

  const [index, setIndex] = useState(0);

  // Solo mantenemos el modal de historial, el resto de "openX" se elimina
  const [openHistorial, setOpenHistorial] = useState(false);

  // Para animación al cambiar de categoría
  const [lastCatIndex, setLastCatIndex] = useState(0);
  const [navDir, setNavDir] = useState(0);

  const actual = useMemo(
    () => categorias.find((c) => c.id === catId) ?? categorias[0],
    [catId],
  );

  const cambiarCategoria = (id: string) => {
    const iNext = categorias.findIndex((c) => c.id === id);
    if (iNext === -1) return;

    setNavDir(iNext > lastCatIndex ? 1 : -1);
    setLastCatIndex(iNext);
    setCatId(id);
    setIndex(0);
  };

  // Scroll suave de las tabs
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const c = tabsContainerRef.current;
    const a = tabRefs.current[catId];
    if (!c || !a) return;

    const target =
      a.offsetLeft - c.clientWidth / 2 + a.clientWidth / 2;

    c.scrollTo({
      left: target,
      behavior: "smooth",
    });
  }, [catId]);

  const seleccionIds = seleccionPorCat[catId] ?? new Set<string>();
  const seleccionados = actual.personas.filter((p) =>
    seleccionIds.has(p.id),
  );

  const total = seleccionados.length;
  const personaActual =
    total > 0 ? seleccionados[index] : undefined;

  const togglePersona = (id: string) => {
    setSeleccionPorCat((prev) => {
      const next: Record<string, Set<string>> = { ...prev };
      const set = new Set(next[catId] ?? new Set<string>());

      if (set.has(id)) {
        set.delete(id);
      } else {
        set.add(id);
      }

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
    if (!total) return;
    setIndex((i) => (i - 1 + total) % total);
  };

  const siguiente = () => {
    if (!total) return;
    setIndex((i) => (i + 1) % total);
  };

  // === PLANTILLA PARA PREVIEW / ENVÍO ===
  const [archivoUrl] = useState<string | undefined>(undefined);

  const buildPdfSrc = (pdfUrl?: string) => {
    const base =
      pdfUrl && pdfUrl.trim() !== ""
        ? pdfUrl
        : "/Hackatec2.pdf"; // placeholder
    const zoom = "60";
    return `${base}#page=1&zoom=${zoom}`;
  };

  const pdfSrc = buildPdfSrc(archivoUrl);

  // Generar imagen rápida de constancia (mock)
  const generarImagen = (nombre: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

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
    if (!url) return;

    const a = document.createElement("a");
    a.href = url;
    a.download = `constancia_${personaActual.nombre}.png`;
    a.click();
  };

  const imprimir = () => {
    if (!personaActual) return;
    // Lógica simple: abre nueva ventana con la imagen para imprimir
    const url = generarImagen(personaActual.nombre);
    if (!url) return;

    const w = window.open("");
    if (!w) return;

    w.document.write(
      `<img src="${url}" style="width:100%;max-width:800px;" />`,
    );
    w.document.close();
    w.focus();
    w.print();
  };

  const enviarPorCorreo = () => {
    // Aquí luego conectarás API real
    if (!personaActual) return;
    // Por ahora solo muestra un log para que se use la función
    // eslint-disable-next-line no-console
    console.log(
      `Simulando envío de constancia por correo a ${personaActual.nombre}`,
    );
    alert(
      `Simulando envío de constancia por correo a ${personaActual.nombre}`,
    );
  };

  return (
    <section className="bg-white rounded-3xl shadow-sm p-5 h-full flex flex-col gap-4">
      {/* ENCABEZADO */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Constancias del evento
          </h2>
          <p className="text-xs text-slate-500">
            Previsualiza las constancias por rol y realiza acciones
            de descarga, impresión y envío.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenHistorial(true)}
          className="px-4 py-2 rounded-full bg-[#F2F3FB] text-xs font-semibold text-slate-700 inline-flex items-center gap-2 shadow-sm transform-gpu transition hover:bg-[#E9ECF9] hover:-translate-y-[1px] hover:scale-[1.02]"
        >
          <FiClock className="text-sm" />
          Historial de envíos
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* LADO IZQUIERDO: CATEGORÍAS + LISTA */}
        <div className="flex flex-col bg-slate-50 rounded-2xl p-3 gap-3 min-h-[260px]">
          {/* Tabs de categorías */}
          <div
            ref={tabsContainerRef}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300/60"
          >
            {categorias.map((c) => {
              const active = c.id === catId;
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    tabRefs.current[c.id] = el;
                  }}
                  type="button"
                  onClick={() => cambiarCategoria(c.id)}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition whitespace-nowrap ${
                    active
                      ? "bg-[#5B4AE5] text-white border-[#5B4AE5]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {c.titulo}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-700">
              {actual?.titulo}
            </h3>
            <button
              type="button"
              onClick={seleccionarTodo}
              className="text-[11px] font-semibold text-[#5B4AE5] hover:text-[#4338CA]"
            >
              Seleccionar todo
            </button>
          </div>

          {/* Lista de personas */}
          <div className="flex-1 overflow-y-auto rounded-xl bg-white border border-slate-100 p-2 space-y-1">
            {actual?.personas.map((p) => {
              const checked = seleccionIds.has(p.id);
              return (
                <label
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePersona(p.id)}
                      className="h-4 w-4 accent-[#5B4AE5]"
                    />
                    <span className="text-slate-700">
                      {p.nombre}
                    </span>
                  </div>
                </label>
              );
            })}

            {actual?.personas.length === 0 && (
              <p className="text-[11px] text-slate-400 text-center py-4">
                No hay personas configuradas para esta categoría.
              </p>
            )}
          </div>
        </div>

        {/* LADO DERECHO: PREVIEW + ACCIONES */}
        <div className="flex flex-col bg-slate-50 rounded-2xl p-3 gap-3 min-h-[260px]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-700">
              Previsualización
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <FiClock className="text-xs" />
              {total > 0
                ? `Constancia ${index + 1} de ${total}`
                : "Sin personas seleccionadas"}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-2 min-h-[220px]">
            {/* Contenedor del preview con animación */}
            <div className="flex-1 flex items-center justify-center">
              <AnimatePresence initial={false} custom={navDir}>
                <motion.div
                  key={personaActual?.id ?? "vacio"}
                  custom={navDir}
                  initial={{ x: navDir === 1 ? 40 : -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: navDir === 1 ? -40 : 40, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 22,
                  }}
                  className="relative w-full max-w-sm aspect-[8/11] bg-white rounded-xl shadow-md border border-slate-100 p-4 flex flex-col items-center justify-center overflow-hidden"
                >
                  {personaActual ? (
                    <>
                      {/* Aquí podrías reemplazar por un iframe con el PDF usando pdfSrc */}
                      {/* <iframe src={pdfSrc} className="w-full h-full" /> */}
                      <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-4">
                        CONSTANCIA
                      </p>
                      <p className="text-sm font-semibold text-center text-slate-900">
                        {personaActual.nombre}
                      </p>
                      <p className="mt-2 text-[11px] text-center text-slate-500">
                        Vista previa ilustrativa de la constancia.
                      </p>
                    </>
                  ) : (
                    <p className="text-[11px] text-slate-400 text-center px-4">
                      Selecciona al menos una persona en la lista
                      para previsualizar la constancia.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controles de navegación y acciones */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={anterior}
                  disabled={total === 0}
                  className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
                >
                  <FiChevronRight className="rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={siguiente}
                  disabled={total === 0}
                  className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
                >
                  <FiChevronRight />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={descargar}
                  disabled={!personaActual}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                >
                  <FiDownload className="text-xs" />
                  Descargar
                </button>
                <button
                  type="button"
                  onClick={imprimir}
                  disabled={!personaActual}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                >
                  <FiPrinter className="text-xs" />
                  Imprimir
                </button>
                <button
                  type="button"
                  onClick={enviarPorCorreo}
                  disabled={!personaActual}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5B4AE5] text-[11px] font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4338CA]"
                >
                  <FiSend className="text-xs" />
                  Enviar por correo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SIMPLE DE HISTORIAL (sin componente externo) */}
      <AnimatePresence>
        {openHistorial && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Historial de envíos de constancias
                </h3>
                <button
                  type="button"
                  onClick={() => setOpenHistorial(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cerrar
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Aquí después conectarás el historial real desde la
                base de datos. Por ahora es solo un marcador de
                posición para que compile.
              </p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• 10/12/2025 – Envío masivo de constancias.</li>
                <li>• 09/12/2025 – Reenvío de 3 constancias.</li>
                <li>• 08/12/2025 – Prueba de envío del evento.</li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SeccionConstanciasDesenglose;
