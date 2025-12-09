// src/modulos/administradorEventos/componentes/TarjetaPlantillaEvento.tsx
import React from "react";
import type { PlantillaEvento } from "../tiposAdminEventos";

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
      ? "w-[250px] aspect-[6/4]"
      : "w-[250px] aspect-[6/4]";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`
        ${sizeClasses}
        rounded-xl
        overflow-visible
        bg-white
        ring-2 ring-white hover:ring-4 hover:ring-white/90
        transform-gpu transition-all duration-300 hover:scale-[1.05] hover:shadow-xl
        relative flex
        snap-start
        cursor-pointer
      `}
      style={{ padding: 0 }}
    >
      <img
        src={plantilla.imagen}
        alt={plantilla.titulo}
        className="w-full h-full object-cover block rounded-xl"
      />
      <div className="absolute top-2 left-2 right-2">
        <span className="text-white text-[24px] font-bold drop-shadow">
          {plantilla.titulo}
        </span>
      </div>
    </div>
  );
};

export default TarjetaPlantillaEvento;
