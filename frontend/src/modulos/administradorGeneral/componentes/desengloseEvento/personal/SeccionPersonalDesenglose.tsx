// src/modulos/administradorGeneral/componentes/desengloseEvento/personal/SeccionPersonalDesenglose.tsx
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
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "personal_evento.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white rounded-3xl shadow-sm p-5 h-full flex flex-col gap-4">
      {/* ENCABEZADO */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Personal del evento
          </h2>
          <p className="text-xs text-slate-500">
            Consulta y exporta el listado del personal asociado al
            evento.
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Roles configurados en el sistema:{" "}
            <span className="font-medium">
              {catalogoRoles.join(", ")}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5B4AE5] text-xs font-semibold text-white shadow-sm hover:bg-[#4338CA]"
        >
          <FiDownload className="text-sm" />
          Exportar a Excel
        </button>
      </header>

      {/* BUSCADOR */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 border border-slate-100">
        <FiSearch className="text-slate-400 text-sm" />
        <input
          type="text"
          placeholder="Buscar por nombre, rol, correo o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 bg-transparent outline-none text-xs text-slate-700"
        />
      </div>

      {/* TABLA */}
      <div className="flex-1 min-h-0 rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
        <div className="max-h-[280px] overflow-y-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-100 text-[11px] text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-2 font-medium">
                  Nombre
                </th>
                <th className="text-left px-4 py-2 font-medium">
                  Apellido Paterno
                </th>
                <th className="text-left px-4 py-2 font-medium">
                  Apellido Materno
                </th>
                <th className="text-left px-4 py-2 font-medium">
                  Rol
                </th>
                <th className="text-left px-4 py-2 font-medium">
                  Correo
                </th>
                <th className="text-left px-4 py-2 font-medium">
                  Teléfono
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtrados.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-800">
                    {r.nombre}
                  </td>
                  <td className="px-4 py-2 text-slate-800">
                    {r.apPaterno}
                  </td>
                  <td className="px-4 py-2 text-slate-800">
                    {r.apMaterno}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {r.roles.join(", ")}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {r.correo}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {r.telefono}
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-[11px] text-slate-400"
                  >
                    No se encontraron registros con el criterio de
                    búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default SeccionPersonalDesenglose;
