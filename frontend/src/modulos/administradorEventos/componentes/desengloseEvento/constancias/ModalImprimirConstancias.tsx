// src/modulos/administradorEventos/componentes/desengloseEvento/constancias/ModalImprimirConstancias.tsx
import { useMemo, useState, useEffect } from "react";
import type { FC } from "react";

interface Persona {
  id: string;
  nombre: string;
}
interface Categoria {
  id: string;
  titulo: string;
  personas: Persona[];
}

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  categorias: Categoria[];
  onAceptar: (config: {
    tipo: "pdf" | "zip";
    seleccion: { categoriaId: string; personaIds: string[] }[];
  }) => void;
}

const ModalImprimirConstancias: FC<Props> = ({
  abierto,
  onCerrar,
  categorias,
  onAceptar,
}) => {
  const [tipo, setTipo] = useState<"pdf" | "zip">("pdf");
  const [filtros, setFiltros] = useState<Set<string>>(
    () => new Set(categorias.map((c) => c.id)),
  );

  // 🔹 Si cambian las categorías (por Firebase), actualizamos filtros
  useEffect(() => {
    setFiltros(new Set(categorias.map((c) => c.id)));
  }, [categorias]);

  const personasFiltradas = useMemo(() => {
    return categorias
      .filter((c) => filtros.has(c.id))
      .flatMap((c) =>
        c.personas.map((p) => ({ ...p, categoriaId: c.id })),
      );
  }, [categorias, filtros]);

  if (!abierto) return null;

  const toggleFiltro = (id: string) => {
    setFiltros((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const aceptar = () => {
    const seleccion = categorias
      .filter((c) => filtros.has(c.id))
      .map((c) => ({
        categoriaId: c.id,
        personaIds: c.personas.map((p) => p.id),
      }));
    onAceptar({ tipo, seleccion });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[900px] h-[70vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] px-8 py-4">
          <div className="flex items-center justify-between">
            <p className="text-white text-sm font-semibold">
              Imprimir constancias
            </p>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-full bg-white/20 p-1">
                {(["pdf", "zip"] as const).map((t) => {
                  const active = tipo === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipo(t)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                        active
                          ? "bg-white text-slate-800"
                          : "text-white"
                      }`}
                    >
                      {t === "pdf" ? "PDF" : "ZIP"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 flex-1 overflow-auto">
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Filtrar
            </p>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => {
                const active = filtros.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleFiltro(c.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                      active
                        ? "bg-[#E9ECF9] text-slate-800"
                        : "bg-[#F2F3FB] text-slate-700"
                    }`}
                  >
                    {c.titulo}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200">
            <div className="px-3 py-2 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-700">
                Constancia de
              </p>
            </div>
            <ul className="max-h-[320px] overflow-auto">
              {personasFiltradas.map((p) => (
                <li
                  key={`${p.categoriaId}-${p.id}`}
                  className="px-3 py-2 text-sm text-slate-800 border-t border-slate-100 first:border-t-0"
                >
                  {p.nombre}
                </li>
              ))}
              {personasFiltradas.length === 0 && (
                <li className="px-3 py-4 text-sm text-slate-500">
                  Sin resultados
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="px-8 py-4 flex justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCerrar}
            className="px-6 py-2.5 rounded-full bg-[#EEF0F7] text-sm font-semibold text-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={aceptar}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-sm font-semibold text-white"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalImprimirConstancias;
