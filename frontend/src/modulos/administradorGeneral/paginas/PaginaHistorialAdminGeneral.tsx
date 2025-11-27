import React from "react";
import TablaHistorialAdmin from "../componentes/TablaHistorialAdmin";
import type { EntradaHistorial } from "../componentes/tiposAdminGeneral";

const historialDummy: EntradaHistorial[] = [
  {
    id: 1,
    nombre: "Daniel",
    rol: "Administradores de Asistencias",
    evento: "Concurso de robótica Junior",
    accion: 'Se agregó equipo "Los Trataleritos"',
    fecha: "26/11/2024",
    hora: "16:40",
  },
  {
    id: 2,
    nombre: "Sofía",
    rol: "Administradores de Eventos",
    evento: "Concurso de robótica Junior",
    accion: "Se generaron 30 constancias por correo",
    fecha: "26/11/2024",
    hora: "16:45",
  },
];

export const PaginaHistorialAdminGeneral: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-800 mb-4">
        Historial de acciones
      </h1>
      <TablaHistorialAdmin entradas={historialDummy} />
    </div>
  );
};
