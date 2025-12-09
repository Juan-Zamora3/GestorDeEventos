import type { FC } from "react";
import { createPortal } from "react-dom";

interface PlantillaItem {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  imagen: string;
}

interface Props {
  open: boolean;
  item: PlantillaItem;
  onClose: () => void;
  onGuardar: (data: { titulo: string; tipo: string }) => void; // ya no se usa, pero se mantiene en la firma
}

/** Construye la URL del PDF para el MODAL con zoom fijo y sin UI */
const buildPdfSrc = (pdfUrl?: string) => {
  // si no viene un pdf válido, usa uno por defecto
  const base =
    pdfUrl && pdfUrl.trim().toLowerCase().endsWith(".pdf")
      ? pdfUrl
      : "/Hackatec2.pdf";

  const zoom = "60"; // ajusta si quieres verlo más grande o más chico
  return `${base}#page=1&zoom=${zoom}`;
};

const VerConstancia: FC<Props> = ({ open, item, onClose }) => {
  if (!open) return null;

  const pdfSrc = buildPdfSrc(item.imagen);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      {/* Modal: solo vista previa central */}
      <div className="w-[1400px] max-w-[98vw] h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <header className="px-8 py-5 bg-gradient-to-r from-[#3A62D6] to-[#5B4AE5] text-white flex items-center justify-between flex-none">
          <h2 className="text-lg font-semibold">
            Configuración De Constancia
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-full bg-white/20 text-white text-sm font-semibold"
          >
            Cerrar
          </button>
        </header>

        {/* SOLO COLUMNA CENTRAL */}
        <div className="flex-1 p-6 bg-slate-50 flex items-center justify-center">
          <div className="relative w-full max-w-[900px] h-full max-h-[780px] rounded-2xl bg-white shadow-xl overflow-hidden">
            {/* PDF */}
            <iframe
  key={pdfSrc}
  src={pdfSrc}
  title={item.titulo}
  className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none"
  loading="lazy"
/>

            {/* Mensaje fijo encima del PDF */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-10">
  <p className="text-center text-xl font-semibold text-black drop-shadow-sm">
    Aquí aparecerá el texto de la constancia.
  </p>
</div>

          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default VerConstancia;
