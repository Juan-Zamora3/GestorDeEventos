// src/modulos/administradorEventos/paginas/LayoutAdminEventos.tsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";

const logoTecnm = "/logoTECNM.png";

const LayoutAdminEventos: React.FC = () => {
  const claseTab = "px-6 py-2 rounded-full text-sm font-medium transition";

  return (
    <div className="min-h-screen w-full bg-[#EEF0F7] flex flex-col">
      {/* HEADER */}
      <header className="w-full bg-gradient-to-r from-[#192D69] to-[#6581D6] text-white px-8 py-3 flex items-center justify-between shadow-md">
        {/* Logo TECNM */}
        <div className="flex items-center gap-3">
          <img
            src={logoTecnm}
            alt="TECNOLÓGICO NACIONAL DE MÉXICO"
            className="h-10 w-auto"
          />
        </div>

        
       

        {/* Usuario */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold leading-tight">
              Juan Enrique Zamora German
            </p>
            <p className="text-[11px] opacity-80 leading-tight">
              juannikki1232@gmail.com
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-white/90 overflow-hidden flex items-center justify-center">
            <span className="text-sm font-bold text-sky-800">JZ</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutAdminEventos;
