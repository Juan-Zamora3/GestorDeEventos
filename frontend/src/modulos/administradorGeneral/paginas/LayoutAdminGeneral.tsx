// src/modulos/administradorGeneral/paginas/LayoutAdminGeneral.tsx
import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";

const logoTecnm = "/logoTECNM.png";

type TabAdmin = "auditoria" | "usuarios" | "historial";

interface UsuarioActual {
  id_usuario: string;
  nombreCompleto: string; // lo vamos a usar como alias, pero el correo manda
  correo: string;
  rolPrincipal: string;
}

export const LayoutAdminGeneral: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<UsuarioActual | null>(null);

  useEffect(() => {
    // 1) Intentar leer de localStorage (por si lo guardaste en el login)
    const raw = localStorage.getItem("usuarioActual");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as UsuarioActual;
        setUsuario(parsed);
      } catch {
        localStorage.removeItem("usuarioActual");
      }
    }

    // 2) Fallback: escuchar el usuario de Firebase Auth
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUsuario(null);
        return;
      }
      // Si ya había algo en state por localStorage, lo respetamos
      setUsuario((prev) =>
        prev ??
        ({
          id_usuario: user.uid,
          nombreCompleto: user.email ?? "Administrador general",
          correo: user.email ?? "",
          rolPrincipal: "ADMIN_GENERAL",
        } as UsuarioActual),
      );
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("[Logout] error", e);
    }
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("rol");
    localStorage.removeItem("mantenerSesion");
    navigate("/"); // ruta del login
  };

  const path = location.pathname;
  const isEvento = path.startsWith("/admin-general/auditoria/");
  let tabActiva: TabAdmin = "auditoria";

  if (path.includes("/usuarios")) tabActiva = "usuarios";
  else if (path.includes("/historial")) tabActiva = "historial";

  const getClaseTab = (tab: TabAdmin) =>
    `px-8 py-2 rounded-full text-sm font-medium transition ${
      tabActiva === tab
        ? "bg-white text-sky-800 shadow-sm"
        : "bg-white/10 text-white hover:bg-white/20"
    }`;

  // 👇 Texto que se va a mostrar (prioridad: usuario.correo -> auth.currentUser.email -> texto fijo)
  const correoMostrar =
    usuario?.correo ??
    auth.currentUser?.email ??
    "admin.general@puertopenasco.tecnm.mx";

  // 👇 Iniciales del avatar a partir del correo (antes del @)
  const avatarTexto = correoMostrar
    ? correoMostrar.split("@")[0].slice(0, 2).toUpperCase()
    : "AG";

  return (
    <div className="min-h-screen w-full bg-[#EFF3FB] flex flex-col">
      {!isEvento && (
        <header
          className="w-full text-white px-8 py-3 flex items-center justify-between shadow-md"
          style={{
            background: "linear-gradient(90deg, #192D69 0%, #6581D6 100%)",
          }}
        >
          <img
            src={logoTecnm}
            alt="TECNOLÓGICO NACIONAL DE MÉXICO"
            className="h-10 w-auto"
          />

          <nav className="flex items-center gap-4">
            <Link to="auditoria" className={getClaseTab("auditoria")}>
              Auditoría
            </Link>
            <Link to="usuarios" className={getClaseTab("usuarios")}>
              Usuarios
            </Link>
            <Link to="historial" className={getClaseTab("historial")}>
              Historial
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              {/* 🔹 Aquí mostramos el correo */}
              <p className="text-xs font-semibold leading-tight">
                {correoMostrar}
              </p>
              {/* Línea de abajo: solo un rol descriptivo fijo */}
              <p className="text-[11px] opacity-80 leading-tight">
                Administrador general
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/90 overflow-hidden flex items-center justify-center">
              <span className="text-sm font-bold text-[#192D69]">
                {avatarTexto}
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
      )}

      <main
        className={
          isEvento
            ? "flex-1 min-h-0 overflow-y-auto px-0 py-0"
            : "flex-1 px-8 py-6"
        }
      >
        {isEvento ? (
          <Outlet />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={path}
              initial={{ x: -40, opacity: 0, scale: 0.98 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.28, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};
