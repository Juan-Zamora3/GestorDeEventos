import type { FC } from "react";
import { useState } from "react";

const camposMock = [
  { id: "nombre", label: "Nombre", tipo: "texto" },
  { id: "correo", label: "Correo", tipo: "email" },
  { id: "telefono", label: "Teléfono", tipo: "telefono" },
  { id: "institucion", label: "Institución", tipo: "texto" },
];

const SeccionFormularioDesenglose: FC = () => {
  const [query, setQuery] = useState("");
  const filtrados = camposMock.filter((c) =>
    `${c.label} ${c.tipo}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm px-8 py-6 flex flex-col h-full">
      <div className="flex items-center mb-5 gap-4">
        <div className="flex-1 max-w-xl bg-[#F5F6FB] rounded-full flex items-center px-4 py-2 text-sm text-slate-700">
          <input
            type="text"
            placeholder="Buscar campo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Formulario del Evento</h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Vista previa de campos configurados para registro.
          </p>
        </div>

        <div className="border-t border-slate-100">
          <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#F5F6FB] text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left">Campo</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3">{c.label}</td>
                    <td className="px-4 py-3">{c.tipo}</td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-[12px] text-slate-500" colSpan={2}>
                      Sin campos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeccionFormularioDesenglose;

