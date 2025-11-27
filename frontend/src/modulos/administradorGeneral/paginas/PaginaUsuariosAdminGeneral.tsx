import React, { useState } from "react";
import TablaUsuariosAdmin from "../componentes/TablaUsuariosAdmin";
import type { UsuarioRow } from "../componentes/tiposAdminGeneral";
import { ModalUsuarioAdmin } from "../componentes/ModalUsuarioAdmin";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

const usuariosDummy: UsuarioRow[] = [
  {
    id: 1,
    nombre: "Sofía",
    correo: "correo@gmail.com",
    telefono: "6381006000",
    evento: "Concurso de robótica Junior",
    rol: "Administradores de Eventos",
    status: "Activo",
  },
  {
    id: 2,
    nombre: "Daniel",
    correo: "correo@gmail.com",
    telefono: "6381006000",
    evento: "Concurso de robótica Junior",
    rol: "Administradores de Asistencias",
    status: "Finalizado",
  },
];

export const PaginaUsuariosAdminGeneral: React.FC = () => {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Encabezado + botones */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Participantes
          </h1>
          <p className="text-sm text-slate-500">
            Participantes del concurso de robótica junior · 2025
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#6581D6] text-white text-sm font-semibold px-4 py-2 shadow-sm hover:bg-[#5268bf]"
          >
            <FiPlus className="text-sm" />
            Agregar
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-white text-slate-700 text-sm font-semibold px-4 py-2 shadow-sm hover:bg-slate-100">
            <FiEdit2 className="text-sm" />
            Editar
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-white text-rose-600 text-sm font-semibold px-4 py-2 shadow-sm hover:bg-rose-50">
            <FiTrash2 className="text-sm" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <TablaUsuariosAdmin usuarios={usuariosDummy} />

      {/* Modal de añadir usuario */}
      <ModalUsuarioAdmin
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
      />
    </div>
  );
};
