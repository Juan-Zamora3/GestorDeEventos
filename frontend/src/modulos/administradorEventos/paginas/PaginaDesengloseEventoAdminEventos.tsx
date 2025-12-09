// src/modulos/administradorEventos/paginas/PaginaDesengloseEventoAdminEventos.tsx
import type { FC } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const PaginaDesengloseEventoAdminEventos: FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onSalir = () => {
      setExiting(true);
      const timer = window.setTimeout(() => {
        navigate("/admin-eventos/lista", { state: { animateUp: true } });
      }, 600);
      return () => window.clearTimeout(timer);
    };

    window.addEventListener("admin-eventos:salir", onSalir as EventListener);
    return () => {
      window.removeEventListener("admin-eventos:salir", onSalir as EventListener);
    };
  }, [navigate]);

  return (
    <div className="h-full px-1 md:px-1 py-1 md:py-1 overflow-hidden">
      <motion.div
        className="h-full w-[99%] mx-auto bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={
          exiting
            ? { y: 40, opacity: 0.02, scale: 0.98 }
            : mounted
            ? { y: 0, opacity: 1, scale: 1 }
            : {}
        }
        transition={{ duration: 0.6, ease: [0.22, 1, 0.28, 1] }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};

export default PaginaDesengloseEventoAdminEventos;
