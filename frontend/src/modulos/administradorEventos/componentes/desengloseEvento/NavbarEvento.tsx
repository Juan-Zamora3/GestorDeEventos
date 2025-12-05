import type { FC } from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { motion } from "framer-motion";

interface Props { titulo: string }

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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  const navRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const animTimer = useRef<number | undefined>(undefined);
  const [glow, setGlow] = useState(false);

  const updateIndicator = useCallback(() => {
    const container = navRef.current;
    const activeBtn = tabRefs.current[activo];
    if (!container || !activeBtn) return;

    const c = container.getBoundingClientRect();
    const a = activeBtn.getBoundingClientRect();
    const x = a.left - c.left + (a.width - Math.min(a.width - 8, 96)) / 2;
    const w = Math.min(a.width - 8, 96);
    const target = { left: x, width: w };
    const prev = indicator;

    if (prev.width > 0) {
      const minX = Math.min(prev.left, target.left);
      const maxX = Math.max(prev.left + prev.width, target.left + target.width);
      const unionW = maxX - minX;
      setGlow(true);
      setIndicator({ left: minX, width: unionW });
      if (animTimer.current) window.clearTimeout(animTimer.current);
      animTimer.current = window.setTimeout(() => {
        setIndicator(target);
        setGlow(false);
      }, 560);
    } else {
      setIndicator(target);
    }
  }, [activo, indicator]);

  useEffect(() => {
    const t = window.setTimeout(() => updateIndicator(), 0);
    return () => window.clearTimeout(t);
  }, [activo, updateIndicator]);

  useEffect(() => {
    const onResize = () => {
      const container = navRef.current;
      const activeBtn = tabRefs.current[activo];
      if (!container || !activeBtn) return;
      const c = container.getBoundingClientRect();
      const a = activeBtn.getBoundingClientRect();
      const left = a.left - c.left + (a.width - Math.min(a.width - 8, 96)) / 2;
      const width = Math.min(a.width - 8, 96);
      setIndicator({ left, width });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activo]);

  return (
    <header className="flex-shrink-0">
      <div
        className={`bg-gradient-to-r from-[#192D69] to-[#6581D6] text-white rounded-t-[32px] transform-gpu transition-all duration-700 ${
          mounted ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
        }`}
      >
        <div className="px-6 sm:px-10 pt-6">
          <div className="grid grid-cols-3 items-center">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transform-gpu transition hover:scale-105"
              >
                <FiChevronLeft />
              </button>
            </div>
            <div className="flex items-center justify-center">
              <h1 className="text-xl sm:text-2xl font-semibold">{titulo}</h1>
            </div>
            <div />
          </div>
        </div>
        <nav className="mt-5 px-6 sm:px-10 pb-5">
          <div
            ref={navRef}
            className="relative w-full bg-[#E5E9F6] rounded-md px-2 py-1"
          >
            <ul className="flex items-center justify-center gap-10 text-sm text-[#5A5F8D]">
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
                      className={`inline-block w-28 px-3 py-2 rounded-lg text-center transition-colors duration-200 cursor-pointer
                        ${
                          selected
                            ? "text-[#4A4691] font-semibold bg-white/80 shadow-md"
                            : "text-[#5A5F8D]"
                        }
                        hover:text-[#4A4691] hover:font-semibold hover:bg-white/70
                      `}
                      initial={false}
                      animate={
                        selected
                          ? { y: -2, scale: 1.04 }
                          : { y: 0, scale: 1 }
                      }
                      whileHover={{
                        y: -10,
                        scale: 1.12,
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
            <span
              className={`absolute bottom-0 left-0 h-2 rounded-full bg-gradient-to-r from-[#5B5AE5] to-[#7B5CFF] transition-[transform,width] duration-800 ease-[cubic-bezier(0.22,1.4,0.28,1)] ${
                glow ? "drop-shadow-[0_0_10px_rgba(91,74,229,0.6)]" : ""
              }`}
              style={{
                transform: `translateX(${indicator.left}px)`,
                width: indicator.width,
              }}
            />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavbarEvento;
