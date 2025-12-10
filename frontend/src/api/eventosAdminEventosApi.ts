 // src/api/eventosAdminEventosApi.ts
// API y tipos compartidos del módulo Administrador de Eventos (Firebase/Firestore).

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Tipos del frontend (no los duplicamos, solo los reusamos)
import type {
  AjusteConfig,
  ParticipantesDraft,
  CampoEvento,
  PersonalConfig,
} from "../modulos/administradorEventos/tiposAdminEventos";

import type { InfoEventoDraft } from "../modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos";

// Reexportamos para que otros archivos puedan importar desde aquí
export type { AjusteConfig, ParticipantesDraft };

// ---------------------------------------------------------
// Tipos para plantillas de evento
// ---------------------------------------------------------

export interface PlantillaEvento {
  id: string;
  nombrePlantilla: string;
  tipo: string;
  coverUrl: string | null;
  config?: {
    infoEvento: InfoEventoDraft;
    ajuste: AjusteConfig;
    participantes: ParticipantesDraft;
    personal: PersonalConfig;
  };
  createdAt: Date | null;
  createdBy?: {
    uid: string;
    nombre: string;
    correo: string;
  };
}

// ---------------------------------------------------------
// Campos base y extra para "Personal" en el wizard
// ---------------------------------------------------------

export const camposBasePersonal: CampoEvento[] = [
  {
    id: "pers-nombre",
    nombre: "Nombre",
    tipo: "texto_corto",
    immutable: true,
  },
  {
    id: "pers-ap-paterno",
    nombre: "Apellido Paterno",
    tipo: "texto_corto",
    immutable: true,
  },
  {
    id: "pers-ap-materno",
    nombre: "Apellido Materno",
    tipo: "texto_corto",
    immutable: true,
  },
  {
    id: "pers-correo",
    nombre: "Correo",
    tipo: "texto_corto",
    immutable: true,
  },
];

export const camposExtraPersonal: CampoEvento[] = [
  {
    id: "pers-telefono",
    nombre: "Teléfono",
    tipo: "texto_corto",
  },
  {
    id: "pers-puesto",
    nombre: "Puesto / Rol",
    tipo: "texto_corto",
  },
];

// ---------------------------------------------------------
// Personal por defecto para plantillas
// ---------------------------------------------------------

export function crearPersonalPlantillaPorDefecto(): PersonalConfig {
  return {
    roles: [
      {
        id: "rol-organizador",
        nombre: "Organizador",
        descripcion: "Personal encargado de coordinar el evento.",
        activo: true,
      },
    ],
    camposPorRol: {
      "rol-organizador": [...camposBasePersonal, ...camposExtraPersonal],
    },
  };
}

// ---------------------------------------------------------
// CRUD de PLANTILLAS de evento
// Colección: "plantillas_evento"
// ---------------------------------------------------------

const plantillasCol = collection(db, "plantillas_evento");

export async function obtenerPlantillasEvento(): Promise<PlantillaEvento[]> {
  const snap = await getDocs(plantillasCol);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      nombrePlantilla: data.nombrePlantilla ?? "Sin nombre",
      tipo: data.tipo ?? "otro",
      coverUrl: data.coverUrl ?? null,
      config: data.config ?? undefined,
      createdAt: data.createdAt?.toDate?.() ?? null,
      createdBy: data.createdBy ?? undefined,
    } satisfies PlantillaEvento;
  });
}

export async function eliminarPlantillaEvento(id: string): Promise<void> {
  const ref = doc(db, "plantillas_evento", id);
  await deleteDoc(ref);
}

// Si quieres guardar nuevas plantillas desde el wizard puedes crear aquí
// una función guardarPlantillaEvento(payload: PlantillaEvento | Parcial).

// ---------------------------------------------------------
// Configuración de EVENTOS (wizard → Firestore)
// Colección: "eventos"
// ---------------------------------------------------------

export interface ConfigEventoGuardada {
  infoEvento: InfoEventoDraft;
  ajuste: AjusteConfig;
  participantes: ParticipantesDraft;
}

/**
 * Carga la configuración completa del evento desde Firestore.
 * Espera que el documento tenga un campo "config" con:
 *  { infoEvento, ajuste, participantesConfig }
 */
export async function cargarConfigEvento(
  idEvento: string,
): Promise<ConfigEventoGuardada | null> {
  const ref = doc(db, "eventos", idEvento);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data() as any;
  const cfg = data.config ?? {};

  const info: InfoEventoDraft =
    cfg.infoEvento ?? {
      nombre: data.titulo ?? "",
      descripcion: data.descripcion ?? "",
      fechaInicioEvento: data.fecha_inicio_evento ?? "",
      fechaFinEvento: data.fecha_fin_evento ?? "",
      fechaInicioInscripciones: data.fecha_inicio_inscripciones ?? "",
      fechaFinInscripciones: data.fecha_fin_inscripciones ?? "",
      imagenPortadaUrl: data.imagen_portada ?? null,
    };

  const ajuste: AjusteConfig = cfg.ajuste ?? {
    caracteristicas: {
      asistencia_qr: false,
      confirmacion_pago: false,
      envio_correo: false,
      asistencia_tiempos: false,
    },
    envioQR: "correo",
    costoInscripcion: "",
    tiempos: [],
  };

  const participantes: ParticipantesDraft =
    cfg.participantesConfig ?? cfg.participantes ?? {
      modo: "individual",
      maxParticipantes: "",
      maxEquipos: "",
      minIntegrantes: "1",
      maxIntegrantes: "5",
      seleccion: { asesor: false, lider_equipo: false },
      camposPorPerfil: {
        participante: [],
        asesor: [],
        integrante: [],
        lider_equipo: [],
      },
    };

  return { infoEvento: info, ajuste, participantes };
}

/**
 * Actualiza la información básica de un evento (nombre, descripción, fechas)
 * y deja rastro mínimo en un log simple.
 */
export async function actualizarInfoEvento(
  idEvento: string,
  infoParcial: {
    nombre: string;
    descripcion: string;
    fechaInicioEvento: string;
    fechaFinEvento: string;
    fechaInicioInscripciones: string;
    fechaFinInscripciones: string;
  },
  usuario: { uid: string; nombre: string; correo: string },
): Promise<void> {
  const ref = doc(db, "eventos", idEvento);

  await updateDoc(ref, {
    titulo: infoParcial.nombre,
    descripcion: infoParcial.descripcion,
    fecha_inicio_evento: infoParcial.fechaInicioEvento || null,
    fecha_fin_evento: infoParcial.fechaFinEvento || null,
    fecha_inicio_inscripciones: infoParcial.fechaInicioInscripciones || null,
    fecha_fin_inscripciones: infoParcial.fechaFinInscripciones || null,
    "config.infoEvento": {
      nombre: infoParcial.nombre,
      descripcion: infoParcial.descripcion,
      fechaInicioEvento: infoParcial.fechaInicioEvento,
      fechaFinEvento: infoParcial.fechaFinEvento,
      fechaInicioInscripciones: infoParcial.fechaInicioInscripciones,
      fechaFinInscripciones: infoParcial.fechaFinInscripciones,
    },
    actualizadoEn: serverTimestamp(),
    actualizadoPor: {
      uid: usuario.uid,
      nombre: usuario.nombre,
      correo: usuario.correo,
    },
  });

  // Log muy simple
  const bitacoraCol = collection(db, "eventos", idEvento, "bitacora_cambios");
  await addDoc(bitacoraCol, {
    tipo: "ACTUALIZAR_INFO",
    detalle: "Actualización de información básica del evento",
    infoParcial,
    usuario,
    creadoEn: serverTimestamp(),
  });
}

/**
 * Elimina un evento y deja registro en una colección de "eventos_eliminados".
 * (La eliminación es definitiva sobre la colección principal).
 */
export async function eliminarEvento(
  idEvento: string,
  usuario: { uid: string; nombre: string; correo: string },
): Promise<void> {
  const ref = doc(db, "eventos", idEvento);

  // Guardamos una copia mínima antes de borrar
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : null;

  const logCol = collection(db, "eventos_eliminados");
  await addDoc(logCol, {
    idEvento,
    data,
    eliminadoPor: usuario,
    eliminadoEn: serverTimestamp(),
  });

  await deleteDoc(ref);
}
