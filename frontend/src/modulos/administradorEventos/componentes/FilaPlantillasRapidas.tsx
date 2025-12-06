// src/modulos/administradorEventos/componentes/IncioEvento/FilaPlantillasRapidas.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import TarjetaPlantillaEvento from "./IncioEvento/TarjetaPlantillaEvento";
import type { PlantillaEvento } from "./tiposAdminEventos"; // 👈 sube un nivel

const plantillas: PlantillaEvento[] = [
  { id: "blanco",   titulo: "Evento en blanco", imagen: "/EventoBlanco.png" },
  { id: "concurso", titulo: "Concurso",         imagen: "/Concurso.png" },
  { id: "foro",     titulo: "Foro",             imagen: "/Foro.png" },
  { id: "cursos",   titulo: "Cursos",           imagen: "/Cursos.png" },
  { id: "mas",      titulo: "Más plantillas",   imagen: "/MasPlantillas.png" },
];

interface Props {
  size?: "normal" | "large";
  onMasClick?: () => void;
  /** si es true, NO se muestra la tarjeta “Más plantillas” */
  hideMas?: boolean;
}

const FilaPlantillasRapidas: React.FC<Props> = ({
  size = "normal",
  onMasClick,
  hideMas = false,
}) => {
  const navigate = useNavigate();

  const manejarClickPlantilla = (id: string) => {
    if (id === "mas") {
      if (onMasClick) {
        onMasClick(); // animación + navegación custom
      } else {
        navigate("/admin-eventos/plantillas");
      }
    } else {
      navigate("/admin-eventos/crear/informacion", {
        state: { plantillaId: id },
      });
    }
  };

  // 👇 aquí filtramos “Más plantillas” cuando hideMas = true
  const plantillasVisibles = hideMas
    ? plantillas.filter((p) => p.id !== "mas")
    : plantillas;

  return (
    <div className="w-full overflow-x-auto snap-x snap-mandatory">
      <div className="min-w-max flex items-center justify-between gap-8">
        {plantillasVisibles.map((plantilla) => (
          <TarjetaPlantillaEvento
            key={plantilla.id}
            plantilla={plantilla}
            size={size}
            onClick={() => manejarClickPlantilla(plantilla.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FilaPlantillasRapidas;
