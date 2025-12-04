import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import FormularioPreview from "../componentes/desengloseEvento/formulario/components/FormularioPreview";
import { DEFAULT_THEME } from "../componentes/desengloseEvento/formulario/components/types";
import type { FormTheme } from "../componentes/desengloseEvento/formulario/components/types";

const PaginaFormularioEventoPublico: React.FC<{ interactive?: boolean }> = ({ interactive = true }) => {
  const { id } = useParams();
  const eventId = id ?? "sin-id";

  const theme: FormTheme = useMemo(() => {
    const raw = localStorage.getItem(`formTheme:${eventId}`);
    if (raw) {
      try {
        return JSON.parse(raw) as FormTheme;
      } catch {
        return DEFAULT_THEME;
      }
    }
    return DEFAULT_THEME;
  }, [eventId]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F0F2F5]">
      <FormularioPreview theme={theme} interactive={interactive} />
    </div>
  );
};

export default PaginaFormularioEventoPublico;
