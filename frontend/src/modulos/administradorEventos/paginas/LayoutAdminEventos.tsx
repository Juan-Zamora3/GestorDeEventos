// src/modulos/administradorEventos/paginas/LayoutAdminEventos.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import HeaderAdminEventos from "../componentes/comunes/HeaderAdminEventos";

const LayoutAdminEventos: React.FC = () => {
  return (
    <div className="h-screen w-full bg-gradient-to-b from-[#192D69] to-[#6581D6] flex flex-col">
      {/* Barra superior con usuario/correo/cerrar sesión */}
      <HeaderAdminEventos />

      {/* Contenido: igual que tu diseño original, sin px-8/py-6 aquí */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutAdminEventos;
