// src/api/adminEventosApi.ts
// API del módulo Administrador de Eventos usando SOLO Firebase/Firestore.

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

import type {
  AjusteDraft,
  InfoEventoDraft,
} from "../modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos";
import type { ParticipantesDraft } from "../modulos/administradorEventos/componentes/tiposAdminEventos";

export interface PreguntaFormularioBackend {
  nombre: string;
  tipo: string;
  placeholder: string;
  obligatorio: boolean;
  opciones: string[];
  source: "manual" | "participantes";
}

export interface CrearEventoPayload {
  infoEvento: InfoEventoDraft;
  ajuste: AjusteDraft;
  participantes: ParticipantesDraft;
  preguntas: PreguntaFormularioBackend[];
}

export interface CrearEventoResponse {
  id_evento: string;
}

function parseDateOrNull(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  // Date inválida -> NaN
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Crea un evento completo en Firestore.
 *
 * Estructura en la colección "eventos":
 *  - Campos planos para listados:
 *      titulo, fecha_inicio_evento, fecha_fin_evento, estado, modalidad, etc.
 *  - Campo "config" con la configuración completa:
 *      { infoEvento, ajuste, participantesConfig, formulario }
 */
export async function crearEventoConConfiguracion(
  payload: CrearEventoPayload,
): Promise<CrearEventoResponse> {
  const { infoEvento, ajuste, participantes, preguntas } = payload;

  // 🔎 Validaciones básicas (opcional pero recomendado)
  if (!infoEvento.nombre || !infoEvento.nombre.trim()) {
    throw new Error("El evento debe tener un nombre.");
  }

  const fechaInicioDate = parseDateOrNull(infoEvento.fechaInicioEvento);
  const fechaFinDate = parseDateOrNull(infoEvento.fechaFinEvento);

  if (!fechaInicioDate || !fechaFinDate) {
    throw new Error("Debes definir fecha de inicio y fin del evento.");
  }

  if (fechaFinDate.getTime() < fechaInicioDate.getTime()) {
    throw new Error("La fecha de fin del evento no puede ser anterior al inicio.");
  }

  const eventosRef = collection(db, "eventos");

  const docRef = await addDoc(eventosRef, {
    // --------- Resumen plano del evento (para listados, filtros, etc.) -----
    titulo: infoEvento.nombre.trim(),
    descripcion: infoEvento.descripcion.trim(),

    // Guardamos como Date (Firestore => Timestamp) Y mantenemos compatibilidad
    fecha_inicio_evento: fechaInicioDate,
    fecha_fin_evento: fechaFinDate,
    fecha_inicio: fechaInicioDate,
    fecha_fin: fechaFinDate,

    fecha_inicio_inscripciones:
      parseDateOrNull(infoEvento.fechaInicioInscripciones) ??
      infoEvento.fechaInicioInscripciones ??
      null,
    fecha_fin_inscripciones:
      parseDateOrNull(infoEvento.fechaFinInscripciones) ??
      infoEvento.fechaFinInscripciones ??
      null,

    // Imagen portada plana para otros módulos (Admin General)
    imagen_portada: infoEvento.imagenPortadaUrl ?? null,

    // Por ahora fijos; luego puedes exponerlos en la UI
    tipo_evento: "Concurso",
    modalidad: "Presencial",
    estado: "ACTIVO", // lo dejamos en mayúsculas para que cuadre con Admin General

    // --------- Configuración completa del evento ----------------------------
    config: {
      infoEvento,
      ajuste,
      participantesConfig: participantes,
      formulario: preguntas,
    },

    // Bandera lógica adicional
    activo: true,
    creadoEn: serverTimestamp(),
  });

  return { id_evento: docRef.id };
}
