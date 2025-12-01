// Componente HeaderAdminEventos
// Notas: barra superior común del módulo Administrador de Eventos.
import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";

const logoTecnm = "/logoTECNM.png";

const tabs = [
  { id: "informacion", label: "Información" },
  { id: "equipos", label: "Equipos" },
  { id: "personal", label: "Personal" },
  { id: "asistencias", label: "Asistencias" },
  { id: "plantillas", label: "Plantillas" },
  { id: "constancias", label: "Constancias" },
  { id: "formulario", label: "Formulario" },
];

const HeaderAdminEventos: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEvento = location.pathname.startsWith("/admin-eventos/evento/");

  if (isEvento) {
    const baseMatch = location.pathname.match(/^\/admin-eventos\/evento\/([^/]*)/);
    const id = baseMatch?.[1] ?? "";
    const base = `/admin-eventos/evento/${id}`;
    const path = location.pathname.replace(base, "").replace(/^\//, "");
    const activo = path.length === 0 ? "informacion" : path.split("/")[0];

    return (
      <header className="w-full bg-gradient-to-r from-[#192D69] to-[#6581D6] text-white shadow-md">
        <div className="px-8 pt-4">
          <div className="grid grid-cols-3 items-center">
            <div className="flex items-center">
              <button type="button" onClick={() => navigate("/admin-eventos/lista")} className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <FiChevronLeft />
              </button>
            </div>
            <div className="flex items-center justify-center">
              <h1 className="text-lg sm:text-xl font-semibold">Concurso De Robotica Junior</h1>
            </div>
            <div />
          </div>
        </div>
        <nav className="mt-4">
          <div className="w-full bg-[#E5E9F6] ">
            <ul className="flex items-center justify-center gap-10 text-sm text-[#5A5F8D] px-4 py-3">
              {tabs.map((t) => {
                const selected = activo === t.id;
                return (
                  <li key={t.id} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => navigate(t.id === "informacion" ? base : `${base}/${t.id}`)}
                      className={`block w-28 text-center transition ${selected ? "text-[#4A4691] font-semibold" : "hover:text-[#4A4691]"}`}
                    >
                      {t.label}
                    </button>
                    {selected && (
                      <span className="mt-2 h-2 w-24 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF]" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="w-full bg-gradient-to-r from-[#192D69] to-[#6581D6] text-white px-8 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <img src={logoTecnm} alt="TECNOLÓGICO NACIONAL DE MÉXICO" className="h-10 w-auto" />
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-xs font-semibold leading-tight">Juan Enrique Zamora German</p>
          <p className="text-[11px] opacity-80 leading-tight">juannikki1232@gmail.com</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-white/90 overflow-hidden flex items-center justify-center">
          <span className="text-sm font-bold text-sky-800">JZ</span>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdminEventos;
