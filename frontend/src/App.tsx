// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PaginaInicioSesion from "./modulos/autenticacion/paginas/PaginaInicioSesion";

/* ========== ADMIN GENERAL (exports nombrados) ========== */
import { LayoutAdminGeneral } from "./modulos/administradorGeneral/paginas/LayoutAdminGeneral";
import { PaginaAuditoriaAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaAuditoriaAdminGeneral";
import { PaginaUsuariosAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaUsuariosAdminGeneral";
import { PaginaHistorialAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaHistorialAdminGeneral";

/* ========== ADMIN EVENTOS (exports *default*) ========== */
/* ========== ADMIN EVENTOS ========== */
import LayoutAdminEventos from "./modulos/administradorEventos/paginas/LayoutAdminEventos";
import  {PaginaCrearEventoAdminEventos } from "./modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos";
import { PaginaGaleriaPlantillasAdminEventos } from "./modulos/administradorEventos/paginas/PaginaGaleriaPlantillasAdminEventos";
import { PaginaListaEventosAdminEventos } from "./modulos/administradorEventos/paginas/PaginaListaEventosAdminEventos";


function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/" element={<PaginaInicioSesion />} />

      {/* ADMIN GENERAL */}
      <Route path="/admin-general" element={<LayoutAdminGeneral />}>
        <Route index element={<Navigate to="auditoria" replace />} />
        <Route path="auditoria" element={<PaginaAuditoriaAdminGeneral />} />
        <Route path="usuarios" element={<PaginaUsuariosAdminGeneral />} />
        <Route path="historial" element={<PaginaHistorialAdminGeneral />} />
      </Route>

      {/* ADMIN EVENTOS */}
      <Route path="/admin-eventos" element={<LayoutAdminEventos />}>
        {/* /admin-eventos → /admin-eventos/lista */}
        <Route index element={<Navigate to="lista" replace />} />
        <Route path="lista" element={<PaginaListaEventosAdminEventos />} />
        <Route path="crear" element={<PaginaCrearEventoAdminEventos />} />
        <Route
          path="plantillas"
          element={<PaginaGaleriaPlantillasAdminEventos />}
        />
      </Route>

      {/* RUTA DESCONOCIDA → LOGIN */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
