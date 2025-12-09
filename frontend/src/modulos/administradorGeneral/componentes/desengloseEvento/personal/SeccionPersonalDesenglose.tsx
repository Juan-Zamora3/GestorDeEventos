import type { FC } from "react";
import { useMemo, useState } from "react";
import { FiSearch, FiDownload } from "react-icons/fi";

interface Row {
  id: string;
  nombre: string;
  apPaterno: string;
  apMaterno: string;
  roles: string[];
  correo: string;
  telefono: string;
}

const catalogoRoles = [
  "Coordinador General",
  "Edecan",
  "Gestor de constancias",
  "Maestro de ceremonias",
];

const base: Row[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `P${i + 1}`,
  nombre: [
    "Sofía",
    "Santiago",
    "Valentina",
    "Sebastián",
    "Isabella",
    "Alejandro",
    "Camila",
    "Daniel",
    "Lucía",
    "Martín",
    "Sofía",
    "Santiago",
  ][i],
  apPaterno: [
    "González",
    "Rodríguez",
    "Martínez",
    "García",
    "Pérez",
    "Fernández",
    "Díaz",
    "Gómez",
    "Ruiz",
    "Navarro",
    "González",
    "Rodríguez",
  ][i],
  apMaterno: [
    "Pérez",
    "López",
    "Hernández",
    "Sánchez",
    "Ramírez",
    "Torres",
    "Flores",
    "Cruz",
    "Morales",
    "Vega",
    "Pérez",
    "López",
  ][i],
  roles: [
    ["Coordinador General"],
    ["Coordinador General"],
    ["Edecan"],
    ["Edecan"],
    ["Edecan"],
    ["Edecan"],
    ["Edecan"],
    ["Gestor de constancias"],
    ["Gestor de constancias"],
    ["Gestor de constancias"],
    ["Gestor de constancias"],
    ["Maestro de ceremonias"],
  ][i],
  correo: "correo@gmail.com",
  telefono: "6381006000",
}));

const SeccionPersonalDesenglose: FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [rows] = useState<Row[]>(base);

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        `${r.nombre} ${r.apPaterno} ${r.apMaterno}`
          .toLowerCase()
          .includes(term) ||
        r.roles.join(", ").toLowerCase().includes(term) ||
        r.correo.toLowerCase().includes(term) ||
        r.telefono.toLowerCase().includes(term),
    );
  }, [busqueda, rows]);

  const exportCsv = () => {
    const headers = [
      "Nombre",
      "Apellido Paterno",
      "Apellido Materno",
      "Rol",
      "Correo",
      "Telefono",
    ];
    const lines = filtrados.map((r) =>
      [
        r.nombre,
        r.apPaterno,
        r.apMaterno,
        r.roles.join("; "),
        r.correo,
        r.telefono,
      ].join(","),
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "personal.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="px-6 sm:px-10 py-6">
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex-1 max-w-xl bg-[#F5F6FB] rounded-full flex items-center px-4 py-2 text-sm text-slate-700">
          <FiSearch className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 bg-transparent outline-none"
          />
        </div>
        {/* Aquí ya no hay seleccionar / eliminar / añadir */}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Personal del Evento
            </h3>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-700 bg-[#F5F6FB] px-3 py-1.5 rounded-full"
          >
            <FiDownload /> Exportar a excel
          </button>
        </div>
        <div className="border-t border-slate-100">
          {/* Scroll solo en la tabla */}
          <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#F5F6FB] text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Apellido Paterno</th>
                  <th className="px-4 py-3 text-left">Apellido Materno</th>
                  <th className="px-4 py-3 text-left">Rol</th>
                  <th className="px-4 py-3 text-left">Correo</th>
                  <th className="px-4 py-3 text-left">Telefono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">{r.nombre}</td>
                    <td className="px-4 py-3">{r.apPaterno}</td>
                    <td className="px-4 py-3">{r.apMaterno}</td>
                    <td className="px-4 py-3">{r.roles.join(", ")}</td>
                    <td className="px-4 py-3">{r.correo}</td>
                    <td className="px-4 py-3">{r.telefono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeccionPersonalDesenglose;
