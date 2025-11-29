import type { FC } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";

interface Props { titulo: string }

const tabs = [
  { id: "informacion", label: "Información" },
  { id: "equipos", label: "Equipos" },
  { id: "personal", label: "Personal" },
  { id: "asistencias", label: "Asistencias" },
  { id: "plantillas", label: "Plantillas" },
  { id: "constancias", label: "Constancias" },
  { id: "formulario", label: "Formulario" },
];

const NavbarEvento: FC<Props> = ({ titulo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const base = `/admin-eventos/evento/${id ?? ""}`;
  const path = location.pathname.replace(base, "").replace(/^\//, "");
  const activo = path.length === 0 ? "informacion" : path.split("/")[0];

  return (
    <header className="flex-shrink-0">
      <div className="bg-gradient-to-r from-[#192D69] to-[#6581D6] text-white rounded-t-[32px]">
        <div className="px-6 sm:px-10 pt-6">
          <div className="grid grid-cols-3 items-center">
            <div className="flex items-center">
              <button type="button" onClick={() => navigate(-1)} className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><FiChevronLeft /></button>
            </div>
            <div className="flex items-center justify-center">
              <h1 className="text-xl sm:text-2xl font-semibold">{titulo}</h1>
            </div>
            <div />
          </div>
        </div>
        <nav className="mt-5 px-6 sm:px-10 pb-5">
          <div className="w-full bg-[#E5E9F6] rounded-md">
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
      </div>
    </header>
  );
};

export default NavbarEvento;
