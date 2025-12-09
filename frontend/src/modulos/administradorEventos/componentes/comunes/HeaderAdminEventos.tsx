// src/modulos/administradorEventos/componentes/layout/HeaderAdminEventos.tsx
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import NavbarEvento from "../desengloseEvento/NavbarEvento";
import { auth } from "../../../../firebase/firebaseConfig";

const logoTecnm = "/logoTECNM.png";

interface UsuarioActual {
  id_usuario: string;
  nombreCompleto: string;
  correo: string;
  rolPrincipal: string;
}

const HeaderAdminEventos: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<UsuarioActual | null>(null);

  // Cargar usuarioActual desde localStorage
  useEffect(() => {
    const raw = localStorage.getItem("usuarioActual");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as UsuarioActual;
      setUsuario(parsed);
    } catch {
      // si está corrupto, lo limpiamos
      localStorage.removeItem("usuarioActual");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("[HeaderAdminEventos] Error al cerrar sesión", e);
    }
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("rol");
    localStorage.removeItem("mantenerSesion");
    navigate("/"); // login
  };

  // ¿Estamos dentro del desglose de un evento?
  const isEvento = location.pathname.startsWith("/admin-eventos/evento/");

  if (isEvento) {
    // Intentar leer el título del evento desde el state del navigate
    const state = location.state as
      | { tituloEvento?: string; nombreEvento?: string }
      | undefined;

    const tituloEvento =
      state?.tituloEvento ||
      state?.nombreEvento ||
      "Evento sin título";

    return <NavbarEvento titulo={tituloEvento} />;
  }

  // Header normal para las demás pantallas del módulo
  const nombre = usuario?.nombreCompleto ?? "Usuario";
  const correo = usuario?.correo ?? "";
  const iniciales = nombre
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
            {nombre}
          </p>
          <p className="text-[11px] opacity-80 leading-tight">
            {correo}
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-white/90 overflow-hidden flex items-center justify-center">
          <span className="text-sm font-bold text-sky-800">
            {iniciales || "US"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="ml-2 rounded-full bg-white/10 hover:bg-white/20 text-[11px] px-3 py-1 font-medium"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default HeaderAdminEventos;
