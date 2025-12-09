// src/api/adminGeneralApi.ts
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  Timestamp,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import type {
  UsuarioRow,
  EventoCard,
  EntradaHistorial,
} from "../modulos/administradorGeneral/componentes/tiposAdminGeneral";

// ================== Helpers generales ==================
const formatearFecha = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatearHora = (d: Date) => {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

// Hash de contraseña con Web Crypto (SHA-256)
async function hashPassword(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ================== Eventos (Auditoría) ==================
export async function obtenerEventosAdminGeneral(): Promise<EventoCard[]> {
  const snap = await getDocs(collection(db, "eventos"));
  const eventos: EventoCard[] = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data() as any;

    const fi =
      data.fecha_inicio instanceof Timestamp
        ? data.fecha_inicio.toDate()
        : null;
    const ff =
      data.fecha_fin instanceof Timestamp
        ? data.fecha_fin.toDate()
        : null;

    eventos.push({
      id: (data.id_evento ?? docSnap.id) as string,
      titulo: data.titulo ?? "Sin título",
      tipo: data.tipo_evento ?? "Concurso",
      fechaInicio: fi ? formatearFecha(fi) : "",
      fechaFin: ff ? formatearFecha(ff) : "",
      equipos: data.total_equipos ? `${data.total_equipos} equipos` : "—",
      personas: data.total_personas
        ? `${data.total_personas} personas`
        : "—",
      imagen: data.imagen_portada ?? "/login-campus.png",
      activo:
        (data.estado ?? "ACTIVO").toString().toUpperCase() === "ACTIVO",
    });
  });

  return eventos;
}

// ================== USUARIOS ADMIN X EVENTO ==================

// Payload para crear/actualizar desde el modal
export interface NuevoUsuarioAdminEvento {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono?: string;
  correo: string;
  password: string;
  rol: "ADMIN_EVENTOS" | "ADMIN_ASISTENCIAS";
  // si después quieres asignarlo a un evento específico, aquí se puede agregar
  eventoAsignado?: string;
}

// Normaliza el rol a texto bonito
const mapRolEventoLegible = (rol?: string): string => {
  if (!rol) return "Sin rol";
  const r = rol.toUpperCase();
  if (r.includes("ADMIN_EVENTOS")) return "Administradores de Eventos";
  if (r.includes("ADMIN_ASISTENCIAS"))
    return "Administradores de Asistencias";
  if (r.includes("ADMIN_GENERAL")) return "Administradores Generales";
  return rol;
};

/** 🔹 Obtener usuarios administradores (colección usuarios_admin_evento) */
export async function obtenerUsuariosAdminGeneral(): Promise<UsuarioRow[]> {
  const snap = await getDocs(collection(db, "usuarios_admin_evento"));
  const filas: UsuarioRow[] = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data() as any;

    const nombreCompleto =
      data.nombre_completo ||
      [data.nombre, data.apellido_paterno, data.apellido_materno]
        .filter(Boolean)
        .join(" ");

    const activoFlag =
      typeof data.activo === "boolean" ? data.activo : true;

    filas.push({
      id: docSnap.id,
      nombre: nombreCompleto || "Sin nombre",
      correo: data.correo ?? data.correo_institucional ?? "",
      telefono: data.telefono ?? "",
      evento: data.evento_asignado ?? "—",
      rol: mapRolEventoLegible(data.rol_codigo ?? data.rol),
      status: activoFlag ? "Activo" : "Finalizado",
    });
  });

  return filas;
}

/** 🔹 Crear usuario admin (SOLO Firestore, sin Auth) */
export async function crearUsuarioAdminGeneral(
  payload: NuevoUsuarioAdminEvento,
): Promise<void> {
  const {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    telefono,
    correo,
    password,
    rol,
    eventoAsignado,
  } = payload;

  const passwordHash = await hashPassword(password);

  const nombreCompleto = [nombre, apellidoPaterno, apellidoMaterno]
    .filter(Boolean)
    .join(" ");

  await addDoc(collection(db, "usuarios_admin_evento"), {
    nombre,
    apellido_paterno: apellidoPaterno,
    apellido_materno: apellidoMaterno ?? "",
    nombre_completo: nombreCompleto,
    telefono: telefono ?? "",
    correo,
    rol_codigo: rol,
    rol_legible: mapRolEventoLegible(rol),
    evento_asignado: eventoAsignado ?? "",
    activo: true,
    password_hash: passwordHash,
    fecha_creacion: serverTimestamp(),
  });
}

/** 🔹 Actualizar usuario admin (incluye poder cambiar password) */
export interface ActualizarUsuarioAdminEvento {
  id: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  telefono?: string;
  correo?: string;
  password?: string; // si se manda, se re-hashéa
  rol?: "ADMIN_EVENTOS" | "ADMIN_ASISTENCIAS";
  eventoAsignado?: string;
  activo?: boolean;
}

export async function actualizarUsuarioAdminGeneral(
  payload: ActualizarUsuarioAdminEvento,
): Promise<void> {
  const {
    id,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    telefono,
    correo,
    password,
    rol,
    eventoAsignado,
    activo,
  } = payload;

  const ref = doc(db, "usuarios_admin_evento", id);
  const updateData: any = {};

  if (nombre !== undefined) updateData.nombre = nombre;
  if (apellidoPaterno !== undefined)
    updateData.apellido_paterno = apellidoPaterno;
  if (apellidoMaterno !== undefined)
    updateData.apellido_materno = apellidoMaterno;
  if (telefono !== undefined) updateData.telefono = telefono;
  if (correo !== undefined) updateData.correo = correo;
  if (eventoAsignado !== undefined)
    updateData.evento_asignado = eventoAsignado;
  if (activo !== undefined) updateData.activo = activo;

  if (rol !== undefined) {
    updateData.rol_codigo = rol;
    updateData.rol_legible = mapRolEventoLegible(rol);
  }

  if (password !== undefined && password.trim() !== "") {
    updateData.password_hash = await hashPassword(password);
  }

  if (Object.keys(updateData).length === 0) return;

  await updateDoc(ref, updateData);
}

/** 🔹 Eliminar usuario admin (BD REAL, usuarios_admin_evento) */
export async function eliminarUsuarioAdminGeneral(
  idUsuario: string,
): Promise<void> {
  const ref = doc(db, "usuarios_admin_evento", idUsuario);
  await deleteDoc(ref);
}

// ================== HISTORIAL ==================
export async function obtenerHistorialAdminGeneral(): Promise<
  EntradaHistorial[]
> {
  const snap = await getDocs(collection(db, "auditoria_acciones"));
  const res: EntradaHistorial[] = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data() as any;
    const fecha =
      data.fecha_hora instanceof Timestamp
        ? data.fecha_hora.toDate()
        : null;

    res.push({
      id: docSnap.id,
      nombre: data.nombre_usuario ?? "—",
      rol: data.rol_descriptivo ?? data.modulo ?? "—",
      evento: data.evento_titulo ?? data.entidad_afectada ?? "—",
      accion: data.accion ?? "—",
      fecha: fecha ? formatearFecha(fecha) : "",
      hora: fecha ? formatearHora(fecha) : "",
    });
  });

  return res;
}
