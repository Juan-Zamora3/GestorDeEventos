// src/App.tsx
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
import { PaginaCrearEventoAdminEventos } from "./modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos";
import SeccionInformacionEvento from "./modulos/administradorEventos/componentes/creacionEvento/informacion/SeccionInformacionEvento";
import SeccionPersonal from "./modulos/administradorEventos/componentes/creacionEvento/personal/SeccionPersonal";
import SeccionIntegrantes from "./modulos/administradorEventos/componentes/creacionEvento/integrantes/SeccionIntegrantes";
import SeccionAjusteEvento from "./modulos/administradorEventos/componentes/creacionEvento/ajuste/SeccionAjusteEvento";
import SeccionFormulario from "./modulos/administradorEventos/componentes/creacionEvento/formulario/SeccionFormulario";
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
        <Route path="crear" element={<PaginaCrearEventoAdminEventos />}>
          <Route index element={<Navigate to="informacion" replace />} />
          <Route path="informacion" element={<SeccionInformacionEvento />} />
          <Route path="personal" element={<SeccionPersonal />} />
          <Route path="integrantes" element={<SeccionIntegrantes />} />
          <Route path="ajuste" element={<SeccionAjusteEvento />} />
          <Route path="formulario" element={<SeccionFormulario />} />
        </Route>
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
