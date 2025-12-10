// src/modulos/administradorEventos/componentes/FilaPlantillasRapidas.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import TarjetaPlantillaEvento from "./TarjetaPlantillaEvento";
import type { PlantillaEvento } from "./tiposAdminEventos";

const plantillas: PlantillaEvento[] = [
  { id: "blanco",   titulo: "Evento en blanco", imagen: "/EventoBlanco.png" },
  { id: "concurso", titulo: "Concurso",         imagen: "/Concurso.png" },
  { id: "foro",     titulo: "Foro",             imagen: "/Foro.png" },
  { id: "cursos",   titulo: "Cursos",           imagen: "/Cursos.png" },
  { id: "mas",      titulo: "Más plantillas",   imagen: "/MasPlantillas.png" },
];

interface Props {
  size?: "normal" | "large";
}

const FilaPlantillasRapidas: React.FC<Props> = ({ size = "normal" }) => {
  const navigate = useNavigate();

  const manejarClickPlantilla = (id: string) => {
    if (id === "mas") {
      // Ir a la galería de plantillas
      navigate("/admin-eventos/plantillas");
    } else {
      // Abrir el wizard de creación de evento.
      // Más adelante, si quieres, puedes pasar query params tipo ?tipo=concurso
      navigate("/admin-eventos/crear");
    }
  };

  return (
    <div className="flex items-center gap-8">
      {plantillas.map((plantilla) => (
        <TarjetaPlantillaEvento
          key={plantilla.id}
          plantilla={plantilla}
          size={size}
          onClick={() => manejarClickPlantilla(plantilla.id)}
        />
      ))}
    </div>
  );
};

export default FilaPlantillasRapidas;
