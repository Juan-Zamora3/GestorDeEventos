// src/modulos/administradorAsistencias/paginas/PaginaDetalleEventoAdminAsistencias.tsx
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import InfoEventoPanel from "../componentes/InfoEventoPanel";
import EquiposEventoPanel from "../componentes/EquiposEventoPanel";
import AsistenciasEventoPanel from "../componentes/AsistenciasEventoPanel";

type Tab = "informacion" | "equipos" | "asistencias";

const TABS: { id: Tab; label: string }[] = [
  { id: "informacion", label: "Información" },
  { id: "equipos", label: "Equipos" },
  { id: "asistencias", label: "Asistencias" },
];

const PaginaDetalleEventoAdminAsistencias: React.FC = () => {
  const [tab, setTab] = useState<Tab>("informacion");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const tituloEvento =
    id === "concurso-robotica" ? "Concurso de Robótica Junior" : "Evento";

  // Animaciones tipo NavbarEvento
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  const navRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [glow, setGlow] = useState(false);
  const animTimer = useRef<number | undefined>(undefined);

  const recalcFromActiveTab = useCallback(() => {
    const container = navRef.current;
    const btn = tabRefs.current[tab];
    if (!container || !btn) return;
    const c = container.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const left = b.left - c.left + 4;
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
  }, [tab]);

  useLayoutEffect(() => {
    recalcFromActiveTab();
  }, [recalcFromActiveTab]);

  useLayoutEffect(() => {
    const onResize = () => recalcFromActiveTab();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recalcFromActiveTab]);

  return (
    <div className="min-h-screen w-full bg-[#EEF0F7] flex flex-col">
      <motion.div
        className="flex flex-col flex-1"
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={exiting ? { y: 40, opacity: 0.02, scale: 0.98 } : mounted ? { y: 0, opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.28, 1] }}
      >
      <header className="flex-shrink-0">
        <div className={`bg-gradient-to-r from-[#192D69] to-[#6581D6] text-white rounded-t-[32px] transform-gpu transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"}`}>
          <div className="px-6 sm:px-10 pt-4">
            <div className="grid grid-cols-3 items-center">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setExiting(true);
                    window.setTimeout(() => {
                      navigate("/admin-asistencias");
                    }, 600);
                  }}
                  className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transform-gpu transition hover:scale-105"
                >
                  ←
                </button>
              </div>
              <div className="flex items-center justify-center">
                <h1 className="text-xl sm:text-2xl font-semibold">{tituloEvento}</h1>
              </div>
              <div />
            </div>
          </div>

          <nav className="mt-6 px-6 sm:px-10 pb-0">
            <div ref={navRef} className="relative w-full bg-[#E5E9F6] rounded-2xl px-6 py-3">
              <ul className="flex items-center justify-center gap-8 text-sm text-[#5A5F8D]">
                {TABS.map((t) => {
                  const selected = tab === t.id;
                  return (
                    <li key={t.id} className="flex flex-col items-center">
                      <motion.button
                        type="button"
                        onClick={() => setTab(t.id)}
                        ref={(el) => { tabRefs.current[t.id] = el as HTMLButtonElement | null; }}
                        className={`inline-block min-w-[7rem] px-3 py-2 rounded-lg text-center relative ${selected ? "text-[#3C3A85] font-semibold bg-white shadow-md" : "text-[#5A5F8D]"}`}
                        initial={false}
                        animate={selected ? { y: -4, scale: 1.06 } : { y: 0, scale: 1 }}
                        whileHover={{ y: -8, scale: 1.1, letterSpacing: "0.08em", boxShadow: "0px 14px 35px rgba(0,0,0,0.22)" }}
                        whileTap={{ scale: 0.96, y: -2 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.4 }}
                      >
                        {t.label}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
              <span
                className={`absolute bottom-0 left-0 h-2 rounded-full bg-gradient-to-r from-[#5B5AE5] to-[#7B5CFF] transition-[transform,width] duration-500 ease-[cubic-bezier(0.22,1.0,0.28,1)] ${glow ? "drop-shadow-[0_0_12px_rgba(91,74,229,0.7)]" : ""}`}
                style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width || 0 }}
              />
            </div>
          </nav>
        </div>
      </header>

      {/* ================= CONTENIDO ================= */}
      <main className="flex-1 px-10 py-8">
        {tab === "informacion" && <InfoEventoPanel />}
        {tab === "equipos" && <EquiposEventoPanel />}
        {tab === "asistencias" && <AsistenciasEventoPanel />}
      </main>
      </motion.div>
    </div>
  );
};

export default PaginaDetalleEventoAdminAsistencias;
