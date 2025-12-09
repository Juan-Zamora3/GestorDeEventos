// src/modulos/administradorEventos/componentes/desengloseEvento/constancias/NuevaConstancia.tsx
import type { FC } from "react";

type NuevaPlantillaPayload = {
  titulo: string;
  tipo: string;
  imagen: string; // normalmente la URL del PDF base
};

interface Props {
  onCreate: (nueva: NuevaPlantillaPayload) => void;
}

const NuevaConstancia: FC<Props> = ({ onCreate }) => {
  const crear = () => {
    const nueva: NuevaPlantillaPayload = {
      titulo: "Nueva Constancia",
      tipo: "Coordinador",
      imagen: "/Hackatec2.pdf", // pon aquí tu PDF base de constancia
    };

    onCreate(nueva);
  };

  return (
    <button
      type="button"
      onClick={crear}
      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white shadow-sm"
    >
      Nueva Constancia
    </button>
  );
};

export default NuevaConstancia;
