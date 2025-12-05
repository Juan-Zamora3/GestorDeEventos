// src/modulos/administradorEventos/componentes/TarjetaPlantillaEvento.tsx
import React from "react";
import type { PlantillaEvento } from "../tiposAdminEventos";

interface Props {
  plantilla: PlantillaEvento;
  onClick?: () => void;
  size?: "normal" | "large";
}

const TarjetaPlantillaEvento: React.FC<Props> = ({ plantilla, onClick, size = "normal" }) => {
  const sizeClasses =
    size === "large"
      ? "w-[250px] aspect-[6/4]"
      : "w-[250px] aspect-[6/4]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${sizeClasses}
        rounded-xl
        overflow-hidden
        bg-white
        ring-2 ring-white
        transition
        relative flex
        snap-start
      `}
      style={{ padding: 0 }}
    >
      <img
        src={plantilla.imagen}
        alt={plantilla.titulo}
        className="w-full h-full object-cover block"
      />
      <div className="absolute top-2 left-2 right-2">
        <span className="text-white text-[24px] font-bold drop-shadow">
          {plantilla.titulo}
        </span>
      </div>
    </button>
  );
};

export default TarjetaPlantillaEvento;
