// Componente HeaderAdminEventos
// Notas: barra superior común del módulo Administrador de Eventos.
import type { FC } from "react";
import { useLocation } from "react-router-dom";
import NavbarEvento from "../desengloseEvento/NavbarEvento";

const logoTecnm = "/logoTECNM.png";

const HeaderAdminEventos: FC = () => {
  const location = useLocation();
  const isEvento = location.pathname.startsWith("/admin-eventos/evento/");

  // 🔹 Cuando estás en /admin-eventos/evento/:id/... usa el navbar animado
  if (isEvento) {
    // Luego puedes cambiar este título por el nombre real del evento
    return <NavbarEvento titulo="Concurso de Robótica Junior" />;
  }

  // 🔹 Header normal para las demás pantallas del módulo
  return (
    <header className="w-full bg-transparent text-white px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={logoTecnm}
          alt="TECNOLÓGICO NACIONAL DE MÉXICO"
          className="h-10 w-auto"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-xs font-semibold leading-tight">
            Juan Enrique Zamora German
          </p>
          <p className="text-[11px] opacity-80 leading-tight">
            juannikki1232@gmail.com
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-white/90 overflow-hidden flex items-center justify-center">
          <span className="text-sm font-bold text-sky-800">JZ</span>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdminEventos;
