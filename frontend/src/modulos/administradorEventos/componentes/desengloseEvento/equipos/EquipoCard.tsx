// src/modulos/administradorEventos/componentes/desengloseEvento/EquipoCard.tsx
import type { FC } from "react";
import { FiUsers, FiUser } from "react-icons/fi";

interface EquipoData {
  id: string;
  nombre: string;
  institucion: string;
  integrantes: number;
  asesor: string;
  // 👇 opcional: mapea esto con tu doc de Firebase (teléfono, correo, etc.)
  // telefonoContacto?: string;
  // correoContacto?: string;
}

interface Props {
  data: EquipoData;
  seleccionado?: boolean;
  onToggleSeleccion?: () => void;
  onVerParticipantes?: () => void;
}

const EquipoCard: FC<Props> = ({
  data,
  seleccionado,
  onToggleSeleccion,
  onVerParticipantes,
}) => {
  return (
    <article
      className={`bg-white rounded-2xl border ${
        seleccionado ? "border-[#5B4AE5]" : "border-slate-200"
      } shadow-sm overflow-hidden cursor-pointer transform-gpu transition-all hover:shadow-md hover:-translate-y-1 hover:scale-[1.02]`}
      onClick={onToggleSeleccion}
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF]" />
      <div className="p-4">
        <h3 className="text-[15px] font-semibold text-slate-900">
          {data.nombre}
        </h3>
        <p className="text-xs text-slate-600 mt-0.5">{data.institucion}</p>

        <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-slate-700">
          <div className="flex items-center gap-2">
            <FiUsers className="text-slate-500" />
            <span className="opacity-80">Integrantes</span>
          </div>
          <div className="text-right font-semibold">{data.integrantes}</div>

          <div className="flex items-center gap-2">
            <FiUser className="text-slate-500" />
            <span className="opacity-80">Asesor</span>
          </div>
          <div className="text-right">{data.asesor}</div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onVerParticipantes?.();
          }}
          className="mt-3 text-[12px] font-semibold text-[#2953E8]"
        >
          PARTICIPANTES
        </button>
      </div>
    </article>
  );
};

export default EquipoCard;
