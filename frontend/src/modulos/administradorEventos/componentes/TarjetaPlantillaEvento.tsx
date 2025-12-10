// src/modulos/administradorEventos/componentes/TarjetaPlantillaEvento.tsx
import React from "react";
import type { PlantillaEvento } from "./tiposAdminEventos";

interface Props {
  plantilla: PlantillaEvento;
  onClick?: () => void;
  size?: "normal" | "large";
}

const TarjetaPlantillaEvento: React.FC<Props> = ({ plantilla, onClick, size = "normal" }) => {
  const sizeClasses =
    size === "large"
      ? "w-[260px] h-[180px]"   // un poco más grandes
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
        flex
      `}
      style={{ padding: 0 }}
    >
      <img
        src={plantilla.imagen}
        alt={plantilla.titulo}
        className="w-full h-full object-cover"
      />
    </button>
  );
};

export default TarjetaPlantillaEvento;
