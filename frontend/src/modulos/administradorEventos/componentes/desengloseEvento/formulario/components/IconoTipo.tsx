// src/modulos/administradorEventos/componentes/desengloseEvento/formulario/IconoTipo.tsx
import {
  FiType,
  FiAlignLeft,
  FiMail,
  FiPhone,
  FiHash,
  FiCalendar,
  FiCheckSquare,
} from "react-icons/fi";
import type { TipoCampo } from "./constants";

const IconoTipo = ({ tipo }: { tipo: TipoCampo }) => {
  switch (tipo) {
    case "texto_corto":
      return <FiType className="text-slate-400" />;
    case "texto_largo":
      return <FiAlignLeft className="text-slate-400" />;
    case "email":
      return <FiMail className="text-slate-400" />;
    case "telefono":
      return <FiPhone className="text-slate-400" />;
    case "numero":
      return <FiHash className="text-slate-400" />;
    case "fecha":
      return <FiCalendar className="text-slate-400" />;
    case "seleccion_simple":
    case "seleccion_multiple":
      return <FiCheckSquare className="text-slate-400" />;
    default:
      return <FiType className="text-slate-400" />;
  }
};

export default IconoTipo;
