// src/modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos.tsx
// Página PaginaCrearEventoAdminEventos
// Notas: layout del wizard de creación; renderiza Aside + Outlet de pasos.
import { Outlet, useLocation } from "react-router-dom";
import AsidePasosCrearEvento from "../componentes/creacionEvento/AsidePasosCrearEvento";

export const PaginaCrearEventoAdminEventos: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  // Determina el paso activo leyendo la URL actual del wizard
  const pasoActual = path.endsWith("/informacion")
    ? 1
    : path.endsWith("/personal")
    ? 2
    : path.endsWith("/integrantes")
    ? 3
    : path.endsWith("/ajuste")
    ? 4
    : 5;

  return (
    // 🔵 FONDO AZUL – ocupa toda la pantalla
    // Fondo y contenedor del wizard (scroll dentro del wrapper)
    <div className="h-full bg-gradient-to-b from-[#192D69] to-[#6581D6] px-1 md:px-1 py-1 md:py-1 overflow-hidden">
      {/* 🟦 CONTENEDOR BLANCO – adaptado al viewport, centrado horizontalmente */}
      <div className="h-[99%]  w-[99%] mx-auto bg-white rounded-[32px] shadow-2xl flex overflow-hidden">
        {/* Aside con pasos del flujo */}
        <AsidePasosCrearEvento pasoActual={pasoActual} />
        {/* Renderiza el contenido del paso actual mediante rutas hijas */}
        <Outlet />
      </div>
    </div>
  );
};
