// src/modulos/administradorGeneral/componentes/ModalUsuarioAdmin.tsx
import React, { useState } from "react";
import {
  crearUsuarioAdminGeneral,
  type NuevoUsuarioAdminEvento,
} from "../../../api/adminGeneralApi";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onGuardado: () => void; // para recargar la tabla después de guardar
}

export const ModalUsuarioAdmin: React.FC<Props> = ({
  abierto,
  onCerrar,
  onGuardado,
}) => {
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] =
    useState<"ADMIN_EVENTOS" | "ADMIN_ASISTENCIAS">("ADMIN_EVENTOS");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!abierto) return null;

  const limpiarFormulario = () => {
    setNombre("");
    setApellidoPaterno("");
    setApellidoMaterno("");
    setTelefono("");
    setCorreo("");
    setPassword("");
    setRol("ADMIN_EVENTOS");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellidoPaterno.trim()) {
      setError("Nombre y apellido paterno son obligatorios.");
      return;
    }
    if (!correo.trim()) {
      setError("El correo es obligatorio.");
      return;
    }
    if (!password.trim()) {
      setError("La contraseña es obligatoria.");
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      const payload: NuevoUsuarioAdminEvento = {
        nombre: nombre.trim(),
        apellidoPaterno: apellidoPaterno.trim(),
        apellidoMaterno: apellidoMaterno.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        password: password.trim(),
        rol,
        // eventoAsignado: "Concurso de robótica Junior", // si luego quieres
      };

      await crearUsuarioAdminGeneral(payload);

      limpiarFormulario();
      onGuardado(); // recarga la lista
      onCerrar();
    } catch (e) {
      console.error("[ModalUsuarioAdmin] Error al guardar usuario", e);
      setError(
        "No se pudo guardar el usuario. Verifica la información e intenta de nuevo.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full mx-4 py-6 px-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Añadir usuario administrador
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Aquí se registran los administradores de eventos o de asistencias.
          La contraseña se guarda encriptada en una colección separada
          (sin usar Firebase Auth).
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs px-3 py-2">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ej. Juan"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Apellido paterno
              </label>
              <input
                type="text"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ej. Zamora"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Apellido materno
              </label>
              <input
                type="text"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ej. 6381202101"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Correo
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ej. juan-@gmail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Contraseña inicial"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Rol
              </label>
              <select
                value={rol}
                onChange={(e) =>
                  setRol(e.target.value as "ADMIN_EVENTOS" | "ADMIN_ASISTENCIAS")
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ADMIN_EVENTOS">
                  Administradores de Eventos
                </option>
                <option value="ADMIN_ASISTENCIAS">
                  Administradores de Asistencias
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                limpiarFormulario();
                onCerrar();
              }}
              className="px-6 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[#6581D6] text-white text-sm font-semibold hover:bg-[#5268bf] disabled:opacity-60"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Aceptar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
