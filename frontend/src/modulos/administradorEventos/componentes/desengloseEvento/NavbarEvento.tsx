// src/modulos/administradorEventos/componentes/desengloseEvento/NavbarEvento.tsx
import type { FC } from "react";
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { motion } from "framer-motion";

// 🔹 Firebase (OJO: solo 4 niveles hacia arriba)
import { db } from "../../../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface Props {
  titulo: string; // título fallback
}

const tabs = [
  { id: "informacion", label: "Información" },
  { id: "equipos", label: "Equipos" },
  { id: "participantes", label: "Participantes" },
  { id: "personal", label: "Personal" },
  { id: "asistencias", label: "Asistencias" },
  { id: "plantillas", label: "Plantillas" },
  { id: "constancias", label: "Constancias" },
  { id: "formulario", label: "Formulario" },
];

const NavbarEvento: FC<Props> = ({ titulo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const base = `/admin-eventos/evento/${id ?? ""}`;
  const path = location.pathname.replace(base, "").replace(/^\//, "");
  const activo = path.length === 0 ? "informacion" : path.split("/")[0];

  // 🔹 título dinámico desde Firestore (con fallback al prop)
  const [tituloEvento, setTituloEvento] = useState<string>(titulo);

  useEffect(() => {
    const cargarTitulo = async () => {
      if (!id) return;

      try {
        const ref = doc(db, "eventos", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const data = snap.data() as any;
        const info = data.config?.infoEvento ?? data.infoEvento ?? {};

        const nombre: string =
          info.nombre ??
          data.nombre ??
          data.nombre_evento ??
          titulo;

        setTituloEvento(nombre);
      } catch (err) {
        console.error("[NavbarEvento] Error al cargar título del evento:", err);
      }
    };

    void cargarTitulo();
  }, [id, titulo]);

  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onSalir = () => setExiting(true);
    window.addEventListener("admin-eventos:salir", onSalir as EventListener);
    return () =>
      window.removeEventListener(
        "admin-eventos:salir",
        onSalir as EventListener,
      );
  }, []);

  // ---------- refs para el indicador ----------
  const navRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const [glow, setGlow] = useState(false);
  const animTimer = useRef<number | undefined>(undefined);

  const recalcFromActiveTab = useCallback(() => {
    const container = navRef.current;
    const btn = tabRefs.current[activo];
    if (!container || !btn) return;

    const c = container.getBoundingClientRect();
    const b = btn.getBoundingClientRect();

    const left = b.left - c.left + 4; // pequeño margen interno
    const width = b.width - 8;

    setIndicator((prev) => {
      if (prev.width > 0) {
        const minX = Math.min(prev.left, left);
        const maxX = Math.max(prev.left + prev.width, left + width);
        const unionW = maxX - minX;

        setGlow(true);
        if (animTimer.current) window.clearTimeout(animTimer.current);

        animTimer.current = window.setTimeout(() => {
          setIndicator({ left, width });
          setGlow(false);
        }, 250);

        return { left: minX, width: unionW };
      }
      return { left, width };
    });
  }, [activo]);

  useLayoutEffect(() => {
    recalcFromActiveTab();
  }, [recalcFromActiveTab]);

  useLayoutEffect(() => {
    const onResize = () => recalcFromActiveTab();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recalcFromActiveTab]);

  return (
    <header className="flex-shrink-0">
      <div
        className={`bg-gradient-to-r from-[#192D69] to-[#6581D6] text-white rounded-t-[32px] transform-gpu transition-all duration-700 ${
          exiting
            ? "translate-y-6 opacity-0"
            : mounted
            ? "translate-y-0 opacity-100"
            : "-translate-y-6 opacity-0"
        }`}
      >
        {/* encabezado */}
        <div className="px-6 sm:px-10 pt-6">
          <div className="grid grid-cols-3 items-center">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("admin-eventos:salir"));
                }}
                className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transform-gpu transition hover:scale-105"
              >
                <FiChevronLeft />
              </button>
            </div>
            <div className="flex items-center justify-center">
              <h1 className="text-xl sm:text-2xl font-semibold">
                {tituloEvento}
              </h1>
            </div>
            <div />
          </div>
        </div>

        {/* navbar */}
        <nav className="mt-10 px-6 sm:px-10 pb-0">
          <div
            ref={navRef}
            className="relative w-full bg-[#E5E9F6] rounded-2xl px-6 py-4"
          >
            <ul className="flex items-center justify-center gap-8 text-sm text-[#5A5F8D]">
              {tabs.map((t) => {
                const selected = activo === t.id;
                return (
                  <li key={t.id} className="flex flex-col items-center">
                    <motion.button
                      type="button"
                      onClick={() =>
                        navigate(
                          t.id === "informacion" ? base : `${base}/${t.id}`,
                        )
                      }
                      ref={(el) => {
                        tabRefs.current[t.id] = el as HTMLButtonElement | null;
                      }}
                      className={`inline-block min-w-[7rem] px-3 py-2 rounded-lg text-center relative
                        ${
                          selected
                            ? "text-[#3C3A85] font-semibold bg-white shadow-md"
                            : "text-[#5A5F8D]"
                        }
                      `}
                      initial={false}
                      animate={
                        selected
                          ? { y: -4, scale: 1.06 }
                          : { y: 0, scale: 1 }
                      }
                      whileHover={{
                        y: -8,
                        scale: 1.1,
                        letterSpacing: "0.08em",
                        boxShadow: "0px 14px 35px rgba(0,0,0,0.22)",
                      }}
                      whileTap={{
                        scale: 0.96,
                        y: -2,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        mass: 0.4,
                      }}
                    >
                      {t.label}
                    </motion.button>
                  </li>
                );
              })}
            </ul>

            {/* indicador azul de abajo */}
            <span
              className={`absolute bottom-0 left-0 h-2 rounded-full bg-gradient-to-r from-[#5B5AE5] to-[#7B5CFF] transition-[transform,width] duration-500 ease-[cubic-bezier(0.22,1.0,0.28,1)] ${
                glow ? "drop-shadow-[0_0_12px_rgba(91,74,229,0.7)]" : ""
              }`}
              style={{
                transform: `translateX(${indicator.left}px)`,
                width: indicator.width || 0,
              }}
            />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavbarEvento;
