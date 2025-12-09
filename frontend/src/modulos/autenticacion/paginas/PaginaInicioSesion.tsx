import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Firebase Auth
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

// Firestore
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../../../firebase/firebaseConfig";

// Hash de contraseña para usuarios_admin_evento
import SHA256 from "crypto-js/sha256";

const logoItsp = "/logo-itsp.png";
const imagenCampus = "/login-campus.png";

// Mapeo rol -> rutanpm install -D @types/crypto-js
const RUTA_POR_ROL: Record<string, string> = {
  ADMIN_GENERAL: "/admin-general",
  ADMIN_EVENTOS: "/admin-eventos",
  ADMIN_ASISTENCIAS: "/admin-asistencias",
};

// Tipos de datos que esperamos en Firestore
type UsuarioGlobal = {
  id_usuario?: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  correo_institucional: string;
  activo?: boolean;
  roles_globales?: string[];
};

type UsuarioAdminEvento = {
  activo?: boolean;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  nombre_completo?: string;
  correo: string;
  telefono?: string;
  password_hash: string;
  rol_codigo: "ADMIN_EVENTOS" | "ADMIN_ASISTENCIAS";
  rol_legible?: string;
  evento_asignado?: string;
};

export default function PaginaInicioSesion() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Traduce mensajes de error de Firebase a algo más amigable
  const traducirError = (code: string | undefined): string => {
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Correo o contraseña incorrectos.";
      case "auth/too-many-requests":
        return "Demasiados intentos. Espera un momento antes de volver a intentar.";
      default:
        return "Ocurrió un error al iniciar sesión. Inténtalo de nuevo.";
    }
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const correoLimpio = correo.trim().toLowerCase();

    try {
      let yaInicioSesion = false;

      // 1️⃣ Intentar con Firebase Auth + colección "usuarios" (ADMIN_GENERAL)
      try {
        await setPersistence(
          auth,
          mantenerSesion ? browserLocalPersistence : browserSessionPersistence,
        );

        const cred = await signInWithEmailAndPassword(
          auth,
          correoLimpio,
          contrasena,
        );

        const uid = cred.user.uid;

        const q = query(
          collection(db, "usuarios"),
          where("auth_uid", "==", uid),
          limit(1),
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          // No hay perfil en la colección usuarios → no consideramos este login válido.
          throw { code: "auth/user-not-found" };
        }

        const docSnap = snap.docs[0];
        const data = docSnap.data() as UsuarioGlobal;

        if (data.activo === false) {
          throw new Error("Tu usuario está inactivo. Contacta al administrador.");
        }

        const roles = Array.isArray(data.roles_globales)
          ? data.roles_globales
          : [];
        const rolConRuta = roles.find((r) => RUTA_POR_ROL[r]);

        if (!rolConRuta) {
          throw new Error(
            "Tu usuario no tiene un módulo asignado. Contacta al administrador.",
          );
        }

        const nombreCompleto =
          [data.nombre, data.apellido_paterno, data.apellido_materno]
            .filter(Boolean)
            .join(" ") || data.correo_institucional;

        const usuarioActual = {
          id_usuario: data.id_usuario ?? docSnap.id,
          nombreCompleto,
          correo: data.correo_institucional,
          rolPrincipal: rolConRuta,
        };

        localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
        localStorage.setItem("rol", rolConRuta);
        localStorage.setItem(
          "mantenerSesion",
          mantenerSesion ? "true" : "false",
        );

        navigate(RUTA_POR_ROL[rolConRuta]);
        yaInicioSesion = true;
      } catch (errAuth: any) {
        const code = errAuth?.code as string | undefined;

        // Si fue un error "normal" de credenciales, seguimos con la colección local.
        // Si fue otro error de Auth (red, configuración, etc.), lo mostramos.
        if (
          code &&
          code !== "auth/user-not-found" &&
          code !== "auth/wrong-password"
        ) {
          throw errAuth;
        }
      }

      // 2️⃣ Si NO entró por Auth, intentamos con la colección usuarios_admin_evento
      if (!yaInicioSesion) {
        // 👇 Ojo: si tu colección está como SUBCOLECCIÓN, cambia esta línea por:
        // const colRef = collection(db, "usuarios", "usuarios_admin_evento");
        const colRef = collection(db, "usuarios_admin_evento");
        const q2 = query(
          colRef,
          where("correo", "==", correoLimpio),
          limit(1),
        );
        const snap2 = await getDocs(q2);

        if (snap2.empty) {
          throw new Error("Correo o contraseña incorrectos.");
        }

        const docSnap2 = snap2.docs[0];
        const data2 = docSnap2.data() as UsuarioAdminEvento;

        if (data2.activo === false) {
          throw new Error("Tu usuario está inactivo. Contacta al administrador.");
        }

        // Hash de la contraseña ingresada
        const hashIngresada = SHA256(contrasena).toString();

        if (!data2.password_hash || data2.password_hash !== hashIngresada) {
          throw new Error("Correo o contraseña incorrectos.");
        }

        const rol = data2.rol_codigo;
        const rutaDestino = RUTA_POR_ROL[rol] ?? "/admin-eventos";

        const nombreCompleto2 =
          data2.nombre_completo ||
          [data2.nombre, data2.apellido_paterno, data2.apellido_materno]
            .filter(Boolean)
            .join(" ") ||
          data2.correo;

        const usuarioActual2 = {
          id_usuario: docSnap2.id,
          nombreCompleto: nombreCompleto2,
          correo: data2.correo,
          rolPrincipal: rol,
        };

        localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual2));
        localStorage.setItem("rol", rol);
        localStorage.setItem(
          "mantenerSesion",
          mantenerSesion ? "true" : "false",
        );

        navigate(rutaDestino);
      }
    } catch (err: any) {
      console.error("[Login] Error:", err);
      if (err?.code) {
        setError(traducirError(err.code));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido al iniciar sesión.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-10 py-8">
      <div className="w-full max-w-6xl flex items-stretch">
        {/* IZQUIERDA: LOGO + FORMULARIO */}
        <div className="flex-1 flex flex-col justify-center pr-10">
          <div className="flex items-center gap-3 mb-10">
            <img src={logoItsp} alt="Logo ITSPP" className="h-12 w-auto" />
            <div className="flex flex-col leading-tight">
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

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="mt-2 w-full rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-sm font-semibold py-2.5 shadow-sm transition-colors"
            >
              {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
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
