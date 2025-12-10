// src/api/auditoriaApi.ts
import { db } from "../firebase/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export type ModuloAuditoria =
  | "admin-eventos"
  | "admin-general"
  | "asistencias"
  | "constancias";

export interface EntradaAuditoria {
  modulo: ModuloAuditoria;
  tipoAccion: string; // "CREAR_EVENTO", "ACTUALIZAR_EVENTO", etc.
  descripcion: string;
  idEvento?: string;
  idPlantilla?: string;
  usuario?: {
    id?: string;
    nombre?: string;
    correo?: string;
  };
  extra?: Record<string, unknown>;
}

/**
 * Registra una entrada de auditoría en la colección "auditoria".
 * El admin general luego puede leer esto y mostrarlo en su tabla.
 */
export async function registrarAuditoria(
  entrada: EntradaAuditoria,
): Promise<void> {
  try {
    await addDoc(collection(db, "auditoria"), {
      ...entrada,
      fecha: serverTimestamp(),
    });
  } catch (error) {
    // NO trones la app por un fallo de log, solo repórtalo en consola
    console.error("[auditoriaApi] Error al registrar auditoría:", error);
  }
}
