// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import PaginaInicioSesion from "./modulos/autenticacion/paginas/PaginaInicioSesion";

/* ========== ADMIN GENERAL ========== */
import { LayoutAdminGeneral } from "./modulos/administradorGeneral/paginas/LayoutAdminGeneral";
import { PaginaAuditoriaAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaAuditoriaAdminGeneral";
import { PaginaUsuariosAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaUsuariosAdminGeneral";
import { PaginaHistorialAdminGeneral } from "./modulos/administradorGeneral/paginas/PaginaHistorialAdminGeneral";
import PaginaDesengloseEventoAdminGeneral from "./modulos/administradorGeneral/paginas/PaginaDesengloseEventoAdminGeneral";
import SeccionInformacionDesengloseAdminGeneral from "./modulos/administradorGeneral/componentes/desengloseEvento/informacion/SeccionInformacionDesenglose";
import SeccionEquiposDesengloseAdminGeneral from "./modulos/administradorGeneral/componentes/desengloseEvento/equipos/SeccionEquiposDesenglose";
import SeccionParticipantesDesengloseAdminGeneral from "./modulos/administradorGeneral/componentes/desengloseEvento/participantes/SeccionParticipantesDesenglose";
import SeccionPersonalDesengloseAdminGeneral from "./modulos/administradorGeneral/componentes/desengloseEvento/personal/SeccionPersonalDesenglose";
import SeccionAsistenciasDesengloseAdminGeneral from "./modulos/administradorGeneral/componentes/desengloseEvento/asistencias/SeccionAsistenciasDesenglose";
import SeccionPlantillasDesengloseAdminGeneral from "./modulos/administradorGeneral/componentes/desengloseEvento/plantillas/SeccionPlantillasDesenglose";
import SeccionConstanciasDesengloseAdminGeneral from "./modulos/administradorGeneral/componentes/desengloseEvento/constancias/SeccionConstanciasDesenglose";

/* ========== ADMIN EVENTOS ========== */
import LayoutAdminEventos from "./modulos/administradorEventos/paginas/LayoutAdminEventos";
import { PaginaCrearEventoAdminEventos } from "./modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos";
import { PaginaGaleriaPlantillasAdminEventos } from "./modulos/administradorEventos/paginas/PaginaGaleriaPlantillasAdminEventos";
import { PaginaListaEventosAdminEventos } from "./modulos/administradorEventos/paginas/PaginaListaEventosAdminEventos";
import  PaginaDetalleEventoAdminEventos  from "./modulos/administradorEventos/paginas/PaginaDetalleEventoAdminEventos";

/* ========== ADMIN ASISTENCIAS ========== */
import LayoutAdminAsistencias from "./modulos/administradorAsistencias/paginas/LayoutAdminAsistencias";
import PaginaListaEventosAdminAsistencias from "./modulos/administradorAsistencias/paginas/PaginaListaEventosAdminAsistencias";
import PaginaDetalleEventoAdminAsistencias from "./modulos/administradorAsistencias/paginas/PaginaDetalleEventoAdminAsistencias";

function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/" element={<PaginaInicioSesion />} />

      {/* 🟦 ADMIN GENERAL */}
      <Route path="/admin-general" element={<LayoutAdminGeneral />}>
        <Route index element={<Navigate to="auditoria" replace />} />

        <Route path="auditoria" element={<PaginaAuditoriaAdminGeneral />} />

        <Route
          path="auditoria/:id"
          element={<PaginaDesengloseEventoAdminGeneral />}
        >
          <Route index element={<SeccionInformacionDesengloseAdminGeneral />} />
          <Route
            path="informacion"
            element={<SeccionInformacionDesengloseAdminGeneral />}
          />
          <Route
            path="equipos"
            element={<SeccionEquiposDesengloseAdminGeneral />}
          />
          <Route
            path="participantes"
            element={<SeccionParticipantesDesengloseAdminGeneral />}
          />
          <Route
            path="personal"
            element={<SeccionPersonalDesengloseAdminGeneral />}
          />
          <Route
            path="asistencias"
            element={<SeccionAsistenciasDesengloseAdminGeneral />}
          />
          <Route
            path="plantillas"
            element={<SeccionPlantillasDesengloseAdminGeneral />}
          />
          <Route
            path="constancias"
            element={<SeccionConstanciasDesengloseAdminGeneral />}
          />
        </Route>

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
        <Route path="crear" element={<PaginaCrearEventoAdminEventos />} />

        {/* Detalle de evento (usa la config del wizard) */}
        <Route
          path="evento/:idEvento"
          element={<PaginaDetalleEventoAdminEventos />}
        />

        {/* Galería de plantillas */}
        <Route
          path="plantillas"
          element={<PaginaGaleriaPlantillasAdminEventos />}
        />
      </Route>

      {/* 🟣 ADMIN ASISTENCIAS */}
      <Route path="/admin-asistencias" element={<LayoutAdminAsistencias />}>
        {/* /admin-asistencias → /admin-asistencias/eventos */}
        <Route index element={<Navigate to="eventos" replace />} />

        <Route
          path="eventos"
          element={<PaginaListaEventosAdminAsistencias />}
        />

        {/* Ojo: aquí dejamos :id para que coincida con useParams<{ id: string }> */}
        <Route
          path="eventos/:id"
          element={<PaginaDetalleEventoAdminAsistencias />}
        />
      </Route>

      {/* RUTA DESCONOCIDA → LOGIN */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
