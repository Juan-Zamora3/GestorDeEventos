// src/modulos/administradorEventos/componentes/TarjetaPlantillaEvento.tsx
import React from "react";
import type { PlantillaEvento } from "./tiposAdminEventos";

interface Props {
  plantilla: PlantillaEvento;
  onClick?: () => void;
  size?: "normal" | "large";
}

const TarjetaPlantillaEvento: React.FC<Props> = ({
  plantilla,
  onClick,
  size = "normal",
}) => {
  const sizeClasses =
    size === "large"
      ? "w-[260px] h-[180px]"
      : "w-[230px] h-[150px]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${sizeClasses}
        rounded-[28px]
        overflow-hidden
        bg-white
        shadow-sm
        border-[3px] border-white
        hover:shadow-md hover:-translate-y-0.5
        transition
        relative
        flex
      `}
      style={{ padding: 0 }}
    >
      <img
        src={plantilla.imagen}
        alt={plantilla.titulo}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 pb-3 pt-6 flex items-end">
        <span className="text-xs font-semibold text-white drop-shadow-sm">
          {plantilla.titulo}
        </span>
      </div>
    </button>
  );
};

export default TarjetaPlantillaEvento;
