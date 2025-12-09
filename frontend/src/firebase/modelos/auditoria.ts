// src/firebase/modelos/auditoria.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export interface AuditoriaAccion {
  id_usuario: string;
  modulo: string;
  accion: string;
  descripcion: string;
  entidad_afectada: string;
  id_entidad: string | null;
  ip_origen?: string;
}

const auditoriaCol = collection(db, "auditoria_acciones");

export async function registrarAuditoria(data: AuditoriaAccion) {
  await addDoc(auditoriaCol, {
    ...data,
    fecha_hora: serverTimestamp(),
  });
}
