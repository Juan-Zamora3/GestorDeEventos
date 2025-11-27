import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const logoItsp = "/logo-itsp.png";
const imagenCampus = "/login-campus.png";

export default function PaginaInicioSesion() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(false);

  const navigate = useNavigate();

  const manejarEnvio = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 🔐 Usuarios quemados temporalmente
    const usuarios = [
      {
        correo: "admin@itsp.com",
        contrasena: "admin123",
        rol: "ADMIN_GENERAL",
        ruta: "/admin-general",
      },
      {
        correo: "admin.eventos@itsp.com",
        contrasena: "123456",
        rol: "ADMIN_EVENTOS",
        ruta: "/admin-eventos",
      },
    ];

    const correoLimpio = correo.trim().toLowerCase();
    const encontrado = usuarios.find(
      (u) =>
        u.correo.toLowerCase() === correoLimpio &&
        u.contrasena === contrasena
    );

    console.log("Intento login:", { correo, contrasena, encontrado });

    if (!encontrado) {
      alert("Credenciales incorrectas");
      return;
    }

    localStorage.setItem("rol", encontrado.rol);
    localStorage.setItem(
      "mantenerSesion",
      mantenerSesion ? "true" : "false"
    );

    console.log("Navegando a:", encontrado.ruta);
    navigate(encontrado.ruta);
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-10 py-8">
      <div className="w-full max-w-6xl flex items-stretch">
        {/* IZQUIERDA: LOGO + FORMULARIO */}
        <div className="flex-1 flex flex-col justify-center pr-10">
          <div className="flex items-center gap-3 mb-10">
            <img src={logoItsp} alt="Logo ITSPP" className="h-12 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold text-slate-200 uppercase tracking-[0.18em]"></span>
              <span className="text-[10px] font-semibold text-slate-800 uppercase tracking-[0.18em]">
                Instituto Tecnológico Superior
              </span>
              <span className="text-[10px] text-slate-700 uppercase tracking-[0.18em]">
                de Puerto Peñasco
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
              Inicio de sesión
            </h1>
            <p className="text-sm text-slate-600 max-w-md">
              Este login es para ingresar a la aplicación de gestión de eventos
              y constancias del ITSPP.
            </p>
            {/* 👇 Info temporal para que recuerdes los usuarios de prueba */}
            <div className="mt-3 text-[11px] text-slate-500 space-y-1">
              <p><strong>Admin general:</strong> admin@itsp.com / admin123</p>
              <p><strong>Admin eventos:</strong> admin.eventos@itsp.com / 123456</p>
            </div>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-sky-600">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="ejemplo@puertopenasco.tecnm.mx"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={mostrarContrasena ? "text" : "password"}
                  required
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-300 px-3 pr-10 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {mostrarContrasena ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                checked={mantenerSesion}
                onChange={(e) => setMantenerSesion(e.target.checked)}
              />
              <span>¿Mantener la sesión después de cerrar la aplicación?</span>
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold py-2.5 shadow-sm transition-colors"
            >
              The Iniciar sesión
            </button>
          </form>
        </div>

        {/* DERECHA: IMAGEN */}
        <div className="flex-1 flex items-center justify-end">
          <div className="w-full h-[520px] rounded-3xl overflow-hidden">
            <img
              src={imagenCampus}
              alt="Campus ITSPP"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
