import type { FC } from "react";

interface PlantillaItem {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  imagen: string;
}

interface Props {
  onCreate: (n: PlantillaItem) => void;
}

const NuevaConstancia: FC<Props> = ({ onCreate }) => {
  const crear = () => {
    const n: PlantillaItem = {
      id: `PL${Date.now()}`,
      titulo: "Nueva Constancia",
      tipo: "Coordinador",
      fecha: new Date().toLocaleDateString(),
      imagen: "/Concurso.png",
    };
    onCreate(n);
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

