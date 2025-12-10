// src/modulos/administradorEventos/paginas/LayoutAdminEventos.tsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";

const logoTecnm = "/logoTECNM.png";

const LayoutAdminEventos: React.FC = () => {
  const location = useLocation();
  const isEvento = location.pathname.startsWith("/admin-eventos/evento/");

  return (
    <div className="min-h-screen w-full bg-[#EEF0F7] flex flex-col">
      {/* HEADER (se oculta en detalle de evento) */}
      {!isEvento && (
        <header className="w-full bg-gradient-to-r from-[#192D69] to-[#6581D6] text-white px-8 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <img
              src={logoTecnm}
              alt="TECNOLÓGICO NACIONAL DE MÉXICO"
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold leading-tight">Usuario</p>
              <p className="text-[11px] opacity-80 leading-tight">correo@ejemplo.com</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/90 overflow-hidden flex items-center justify-center">
              <span className="text-sm font-bold text-sky-800">US</span>
            </div>
          </div>
        </header>
      )}

      {/* CONTENIDO */}
      <main className="flex-1 pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutAdminEventos;
