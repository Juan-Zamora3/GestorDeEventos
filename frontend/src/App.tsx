import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PaginaInicioSesion from "./modulos/autenticacion/paginas/PaginaInicioSesion";

// 👇 OJO: ahora van con llaves porque son exports nombrados
import { LayoutAdminGeneral } from "./modulos/administradorGeneral/paginas/LayoutAdminGeneral";
import { PaginaAuditoriaAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaAuditoriaAdminGeneral";
import { PaginaUsuariosAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaUsuariosAdminGeneral";
import { PaginaHistorialAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaHistorialAdminGeneral";

function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<PaginaInicioSesion />} />

      {/* Layout del Administrador General con rutas hijas */}
      <Route path="/admin-general" element={<LayoutAdminGeneral />}>
        {/* /admin-general → /admin-general/auditoria */}
        <Route index element={<Navigate to="auditoria" replace />} />

        <Route path="auditoria" element={<PaginaAuditoriaAdminGeneral />} />
        <Route path="usuarios" element={<PaginaUsuariosAdminGeneral />} />
        <Route path="historial" element={<PaginaHistorialAdminGeneral />} />
      </Route>

      {/* Cualquier ruta desconocida → login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
