// src/modulos/administradorEventos/componentes/desengloseEvento/IntegrantesTable.tsx
import type { FC } from "react";
import { FiMoreVertical } from "react-icons/fi";

export interface IntegranteRow {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol: string;
  institucion: string;
  correo: string;
  telefono?: string;
  // opcional: puedes agregar id si viene de Firebase
  // id?: string;
}

interface Props {
  rows: IntegranteRow[];
  onAction?: (rowIndex: number, action: string) => void;
  variant?: "full" | "simple";
}

const IntegrantesTable: FC<Props> = ({
  rows,
  onAction,
  variant = "full",
}) => {
  const simple = variant === "simple";
  return (
    <div className="overflow-x-auto">
      <div
        className={`${
          simple ? "max-h-[280px]" : "max-h-[360px]"
        } overflow-y-auto`}
      >
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-xs text-slate-500">
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Apellido Paterno</th>
              <th className="px-4 py-2">Apellido Materno</th>
              <th className="px-4 py-2">Rol</th>
              {!simple && (
                <>
                  <th className="px-4 py-2">Institución</th>
                  <th className="px-4 py-2">Correo</th>
                  <th className="px-4 py-2">Teléfono</th>
                </>
              )}
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={idx}
                className="border-t border-slate-100 text-slate-800"
              >
                <td className="px-4 py-2">{r.nombre}</td>
                <td className="px-4 py-2">{r.apellidoPaterno}</td>
                <td className="px-4 py-2">{r.apellidoMaterno}</td>
                <td className="px-4 py-2">{r.rol}</td>
                {!simple && (
                  <>
                    <td className="px-4 py-2">{r.institucion}</td>
                    <td className="px-4 py-2">{r.correo}</td>
                    <td className="px-4 py-2">{r.telefono ?? ""}</td>
                  </>
                )}
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onAction?.(idx, "menu")}
                    className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
                  >
                    <FiMoreVertical />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={simple ? 5 : 8}
                  className="px-4 py-4 text-xs text-slate-500 text-center"
                >
                  Sin integrantes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IntegrantesTable;
