// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import PaginaInicioSesion from "./modulos/autenticacion/paginas/PaginaInicioSesion";

/* ========== ADMIN GENERAL ========== */
import { LayoutAdminGeneral } from "./modulos/administradorGeneral/paginas/LayoutAdminGeneral";
import { PaginaAuditoriaAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaAuditoriaAdminGeneral";
import { PaginaUsuariosAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaUsuariosAdminGeneral";
import { PaginaHistorialAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaHistorialAdminGeneral";

/* ========== ADMIN EVENTOS ========== */
import LayoutAdminEventos from "./modulos/administradorEventos/paginas/LayoutAdminEventos";

import { PaginaCrearEventoAdminEventos } from "./modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos";
import PaginaDesengloseEventoAdminEventos from "./modulos/administradorEventos/paginas/PaginaDesengloseEventoAdminEventos";
import SeccionInformacionEvento from "./modulos/administradorEventos/componentes/creacionEvento/informacion/SeccionInformacionEvento";
import SeccionPersonal from "./modulos/administradorEventos/componentes/creacionEvento/personal/SeccionPersonal";
import SeccionIntegrantes from "./modulos/administradorEventos/componentes/creacionEvento/integrantes/SeccionIntegrantes";
import SeccionAjusteEvento from "./modulos/administradorEventos/componentes/creacionEvento/ajuste/SeccionAjusteEvento";
import SeccionFormulario from "./modulos/administradorEventos/componentes/creacionEvento/formulario/SeccionFormulario";
import SeccionInformacionDesenglose from "./modulos/administradorEventos/componentes/desengloseEvento/informacion/SeccionInformacionDesenglose";
import SeccionEquiposDesenglose from "./modulos/administradorEventos/componentes/desengloseEvento/equipos/SeccionEquiposDesenglose";
import SeccionPersonalDesenglose from "./modulos/administradorEventos/componentes/desengloseEvento/personal/SeccionPersonalDesenglose";
import SeccionAsistenciasDesenglose from "./modulos/administradorEventos/componentes/desengloseEvento/asistencias/SeccionAsistenciasDesenglose";
import SeccionPlantillasDesenglose from "./modulos/administradorEventos/componentes/desengloseEvento/plantillas/SeccionPlantillasDesenglose";
import SeccionConstanciasDesenglose from "./modulos/administradorEventos/componentes/desengloseEvento/constancias/SeccionConstanciasDesenglose";
import SeccionFormularioDesenglose from "./modulos/administradorEventos/componentes/desengloseEvento/formulario/SeccionFormularioDesenglose";
import { PaginaGaleriaPlantillasAdminEventos } from "./modulos/administradorEventos/paginas/PaginaGaleriaPlantillasAdminEventos";
import { PaginaListaEventosAdminEventos } from "./modulos/administradorEventos/paginas/PaginaListaEventosAdminEventos";

/* ========== ADMIN ASISTENCIAS ========== */
import LayoutAdminAsistencias from "./modulos/administradorAsistencias/paginas/LayoutAdminAsistencias";
import PaginaListaEventosAdminAsistencias from "./modulos/administradorAsistencias/paginas/PaginaListaEventosAdminAsistencias";
import PaginaDetalleEventoAdminAsistencias from "./modulos/administradorAsistencias/paginas/PaginaDetalleEventoAdminAsistencias";
import PaginaFormularioEventoPublico from "./modulos/administradorEventos/paginas/PaginaFormularioEventoPublico";

function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/" element={<PaginaInicioSesion />} />

      {/* 🟦 ADMIN GENERAL */}
      <Route path="/admin-general" element={<LayoutAdminGeneral />}>
        <Route index element={<Navigate to="auditoria" replace />} />
        <Route path="auditoria" element={<PaginaAuditoriaAdminGeneral />} />
        <Route path="usuarios" element={<PaginaUsuariosAdminGeneral />} />
        <Route path="historial" element={<PaginaHistorialAdminGeneral />} />
      </Route>

      {/* 🟧 ADMIN EVENTOS */}
      <Route path="/admin-eventos" element={<LayoutAdminEventos />}>
        {/* /admin-eventos → /admin-eventos/lista */}
        <Route index element={<Navigate to="lista" replace />} />

        {/* Lista de eventos */}
        <Route path="lista" element={<PaginaListaEventosAdminEventos />} />

        {/* Wizard de creación de evento */}
        <Route path="crear" element={<PaginaCrearEventoAdminEventos />}>
          {/* /admin-eventos/crear → /admin-eventos/crear/informacion */}
          <Route index element={<Navigate to="informacion" replace />} />
          <Route path="informacion" element={<SeccionInformacionEvento />} />
          <Route path="personal" element={<SeccionPersonal />} />
          <Route path="integrantes" element={<SeccionIntegrantes />} />
          <Route path="ajuste" element={<SeccionAjusteEvento />} />
          <Route path="formulario" element={<SeccionFormulario />} />
        </Route>

        {/* Galería de plantillas */}
        <Route path="plantillas" element={<PaginaGaleriaPlantillasAdminEventos />} />

        {/* Desenglose de evento */}
        <Route path="evento/:id" element={<PaginaDesengloseEventoAdminEventos />}>
          <Route index element={<SeccionInformacionDesenglose />} />
          <Route path="informacion" element={<SeccionInformacionDesenglose />} />
          <Route path="equipos" element={<SeccionEquiposDesenglose />} />
          <Route path="personal" element={<SeccionPersonalDesenglose />} />
          <Route path="asistencias" element={<SeccionAsistenciasDesenglose />} />
          <Route path="plantillas" element={<SeccionPlantillasDesenglose />} />
          <Route path="constancias" element={<SeccionConstanciasDesenglose />} />
          <Route path="formulario" element={<SeccionFormularioDesenglose />} />
        </Route>
      </Route>

      {/* 🟣 ADMIN ASISTENCIAS */}
      <Route path="/admin-asistencias" element={<LayoutAdminAsistencias />}>
        {/* /admin-asistencias → /admin-asistencias/eventos */}
        <Route index element={<Navigate to="eventos" replace />} />
        <Route path="eventos" element={<PaginaListaEventosAdminAsistencias />} />
        <Route path="eventos/:id" element={<PaginaDetalleEventoAdminAsistencias />} />
      </Route>

      <Route path="/formulario/preview/:id" element={<PaginaFormularioEventoPublico interactive />} />
      <Route path="/formulario/:id" element={<PaginaFormularioEventoPublico interactive />} />

      {/* RUTA DESCONOCIDA → LOGIN */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
