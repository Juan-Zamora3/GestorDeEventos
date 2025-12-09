// src/firebase/modelos/usuarios.ts
import { collection, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../firebaseConfig";

export interface UsuarioDoc {
  id_usuario: string;        // UUID (igual que id del doc)
  auth_uid: string;          // UID de Firebase Auth
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_institucional: string;
  telefono: string;
  activo: boolean;
  fecha_creacion: any;       // Timestamp
  roles_globales: string[];  // ej. ["ADMIN_GENERAL", "ADMIN_EVENTOS"]
}

const usuariosCol = collection(db, "usuarios");

export async function crearUsuarioDoc(data: UsuarioDoc) {
  const ref = doc(usuariosCol, data.id_usuario);
  await setDoc(ref, {
    ...data,
    fecha_creacion: serverTimestamp(),
  });
}

export async function obtenerUsuarioPorId(id_usuario: string) {
  const ref = doc(usuariosCol, id_usuario);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UsuarioDoc;
}
