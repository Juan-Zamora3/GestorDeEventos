// src/api/eventosAdminEventosApi.ts
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * TIPOS BASE DEL WIZARD
 * =====================
 */

export type Tiempo = {
  id: string;
  nombre: string;
  inicio: string; // HH:mm
  fin: string; // HH:mm
};

export type AjusteConfig = {
  caracteristicas: {
    asistencia_qr: boolean;
    confirmacion_pago: boolean;
    envio_correo: boolean;
    asistencia_tiempos: boolean;
  };
  envioQR: "correo" | "ninguno";
  costoInscripcion: string;
  tiempos: Tiempo[];
};

export type CampoEvento = {
  id: string;
  nombre: string;
  tipo: "texto" | "email" | "telefono" | "opciones" | string;
  immutable?: boolean;
};

export type RolPersonalConfig = {
  id: string;
  nombre: string;
  descripcion: string;
  activo?: boolean;
};

export type PersonalConfig = {
  roles: RolPersonalConfig[];
  camposPorRol: Record<string, CampoEvento[]>;
};

export type ParticipantesDraft = {
  modo: "individual" | "equipos";
  maxParticipantes: string;
  maxEquipos: string;
  minIntegrantes: string;
  maxIntegrantes: string;
  seleccion: {
    asesor: boolean;
    lider_equipo: boolean;
  };
  camposPorPerfil: {
    participante: CampoEvento[];
    asesor: CampoEvento[];
    integrante: CampoEvento[];
    lider_equipo: CampoEvento[];
  };
};

/** Config de información general del evento (solo este evento) */
export type InfoEventoConfig = {
  nombre: string;
  descripcion: string;
  fechaInicioEvento: string; // "YYYY-MM-DD"
  fechaFinEvento: string;
  fechaInicioInscripciones: string;
  fechaFinInscripciones: string;
  imagenPortadaUrl?: string | null;
};

const crearInfoEventoPlantillaVacia = (): InfoEventoConfig => ({
  nombre: "",
  descripcion: "",
  fechaInicioEvento: "",
  fechaFinEvento: "",
  fechaInicioInscripciones: "",
  fechaFinInscripciones: "",
  imagenPortadaUrl: null,
});

const crearAjustePlantillaPorDefecto = (): AjusteConfig => ({
  caracteristicas: {
    asistencia_qr: true,
    confirmacion_pago: false,
    envio_correo: true,
    asistencia_tiempos: false,
  },
  envioQR: "correo",
  costoInscripcion: "",
  tiempos: [],
});

const crearParticipantesPlantillaPorDefecto = (): ParticipantesDraft => ({
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
});

/**
 * PERSONAL BASE
 * =============
 */

export const rolesPersonalBase: RolPersonalConfig[] = [
  {
    id: "coordinadores",
    nombre: "Coordinadores",
    descripcion: "Organizan, planifican y supervisan actividades del evento.",
    activo: true,
  },
  {
    id: "jurado",
    nombre: "Jurado",
    descripcion: "Evalúan y verifican objetivos del evento.",
    activo: true,
  },
  {
    id: "colaboradores",
    nombre: "Colaboradores",
    descripcion: "Apoyan actividades para alcanzar objetivos.",
    activo: true,
  },
  {
    id: "asesores",
    nombre: "Asesores",
    descripcion: "Orientan y brindan apoyo especializado.",
    activo: false,
  },
  {
    id: "patrocinadores",
    nombre: "Patrocinadores",
    descripcion: "Aportan recursos y apoyo.",
    activo: false,
  },
  {
    id: "invitados",
    nombre: "Invitados",
    descripcion: "Participan de manera especial en el evento.",
    activo: false,
  },
  {
    id: "edecanes",
    nombre: "Edecanes",
    descripcion: "Apoyan logística y atención.",
    activo: false,
  },
  {
    id: "coord-edecanes",
    nombre: "Coordinadores de edecanes",
    descripcion: "Supervisan a edecanes.",
    activo: false,
  },
];

export const camposBasePersonal: CampoEvento[] = [
  { id: "campo-nombre", nombre: "Nombre", tipo: "texto", immutable: true },
  {
    id: "campo-apellido-paterno",
    nombre: "Apellido paterno",
    tipo: "texto",
    immutable: true,
  },
  {
    id: "campo-apellido-materno",
    nombre: "Apellido materno",
    tipo: "texto",
    immutable: true,
  },
  {
    id: "campo-correo",
    nombre: "Correo",
    tipo: "texto",
    immutable: true,
  },
];

export const camposExtraPersonal: CampoEvento[] = [
  { id: "campo-institucion", nombre: "Institución", tipo: "opciones" },
];

const crearCamposPorRolPersonal = (): Record<string, CampoEvento[]> => {
  const mapa: Record<string, CampoEvento[]> = {};
  rolesPersonalBase.forEach((r) => {
    mapa[r.id] = [...camposBasePersonal, ...camposExtraPersonal];
  });
  return mapa;
};

export const crearPersonalPlantillaPorDefecto = (): PersonalConfig => ({
  roles: rolesPersonalBase.map((r) => ({ ...r })),
  camposPorRol: crearCamposPorRolPersonal(),
});

/** Configuración completa que se guarda en un evento */
export type ConfigEvento = {
  infoEvento: InfoEventoConfig;
  ajuste: AjusteConfig;
  participantes: ParticipantesDraft;
  personal: PersonalConfig;
};

/**
 * PLANTILLAS
 * ==========
 * En las plantillas NO guardamos el nombre/descripción específicos del evento,
 * solo la configuración reutilizable.
 */

export type PlantillaEvento = {
  id: string;
  nombrePlantilla: string;
  tipo: "concurso" | "foro" | "curso" | "robotica" | "otro";
  coverUrl: string;
  config: ConfigEvento;
  createdAt: any;
  createdBy?: {
    uid?: string;
    nombre?: string;
    correo?: string;
  };
};

const coverPorTipo: Record<PlantillaEvento["tipo"], string> = {
  concurso: "/Concurso.png",
  foro: "/Foro.png",
  curso: "/Cursos.png",
  robotica: "/Robotica.png",
  otro: "/EventoBlanco.png",
};

export const obtenerCoverPorTipo = (tipo: PlantillaEvento["tipo"]): string =>
  coverPorTipo[tipo] ?? coverPorTipo.otro;

/**
 * AUDITORÍA
 * =========
 */

export type AuditoriaAdminEventos = {
  tipo:
    | "CREAR_EVENTO"
    | "EDITAR_EVENTO_INFO"
    | "EDITAR_EVENTO_CONFIG"
    | "ELIMINAR_EVENTO";
  eventoId?: string;
  descripcion: string;
  payload?: any;
  actor?: {
    uid?: string;
    nombre?: string;
    correo?: string;
  };
};

export async function registrarAuditoriaAdminEventos(
  entrada: AuditoriaAdminEventos,
) {
  const colRef = collection(db, "auditoriaAdminEventos");
  await addDoc(colRef, {
    ...entrada,
    timestamp: serverTimestamp(),
  });
}

/**
 * CREA UN EVENTO NUEVO A PARTIR DEL WIZARD
 * =======================================
 */
export async function crearEventoDesdeWizard(
  config: ConfigEvento,
  opciones?: {
    plantillaBaseId?: string | null;
    actor?: AuditoriaAdminEventos["actor"];
  },
): Promise<string> {
  const colRef = collection(db, "eventos");

  const docRef = await addDoc(colRef, {
    config: {
      infoEvento: config.infoEvento,
      ajuste: config.ajuste,
      participantes: config.participantes,
      personal: config.personal,
    },
    estado: "activo",
    plantillaBaseId: opciones?.plantillaBaseId ?? null,
    creadoEn: serverTimestamp(),
    creadoPor: opciones?.actor ?? null,
  });

  await registrarAuditoriaAdminEventos({
    tipo: "CREAR_EVENTO",
    eventoId: docRef.id,
    descripcion: `Se creó el evento "${config.infoEvento.nombre}" desde el wizard`,
    payload: {
      plantillaBaseId: opciones?.plantillaBaseId ?? null,
    },
    actor: opciones?.actor,
  });

  return docRef.id;
}

/**
 * GUARDA UNA PLANTILLA DE EVENTO A PARTIR DEL ESTADO ACTUAL DEL WIZARD
 * ====================================================================
 */
export async function guardarPlantillaEvento(
  datos: {
    nombrePlantilla: string;
    tipo: PlantillaEvento["tipo"];
    coverUrl: string;
  },
  configActual: ConfigEvento,
  actor?: AuditoriaAdminEventos["actor"],
): Promise<string> {
  const personalSanitizado: PersonalConfig = {
    roles: (configActual.personal?.roles ?? rolesPersonalBase).map((r) => ({
      ...r,
    })),
    camposPorRol: Object.fromEntries(
      Object.entries(
        configActual.personal?.camposPorRol ?? crearCamposPorRolPersonal(),
      ).map(([rolId, campos]) => [
        rolId,
        campos.map((c) => ({
          ...c,
        })),
      ]),
    ),
  };

  const colRef = collection(db, "plantillasEvento");

  const plantillaDoc = await addDoc(colRef, {
    nombrePlantilla: datos.nombrePlantilla,
    tipo: datos.tipo,
    coverUrl: datos.coverUrl || coverPorTipo[datos.tipo] || "/EventoBlanco.png",
    config: {
      // En la plantilla NO guardamos la info específica del evento
      infoEvento: crearInfoEventoPlantillaVacia(),
      ajuste: configActual.ajuste,
      participantes: configActual.participantes,
      personal: personalSanitizado,
    },
    createdAt: serverTimestamp(),
    createdBy: actor ?? null,
  });

  await registrarAuditoriaAdminEventos({
    tipo: "EDITAR_EVENTO_CONFIG",
    descripcion: `Se guardó una plantilla de evento "${datos.nombrePlantilla}"`,
    payload: { plantillaId: plantillaDoc.id },
    actor,
  });

  return plantillaDoc.id;
}

/**
 * LEE LAS PLANTILLAS PARA LA GALERÍA
 * ==================================
 */
export async function obtenerPlantillasEvento(): Promise<PlantillaEvento[]> {
  const colRef = collection(db, "plantillasEvento");
  const snap = await getDocs(query(colRef));

  const items: PlantillaEvento[] = snap.docs.map((d) => {
    const data = d.data() as any;

    const tipo = (data.tipo ?? "otro") as PlantillaEvento["tipo"];
    const coverUrl =
      data.coverUrl || obtenerCoverPorTipo(tipo) || "/EventoBlanco.png";

    const rawConfig = data.config ?? {};

    const infoEvento: InfoEventoConfig = crearInfoEventoPlantillaVacia();
    const ajuste: AjusteConfig =
      rawConfig.ajuste ?? crearAjustePlantillaPorDefecto();
    const participantes: ParticipantesDraft =
      rawConfig.participantes ?? crearParticipantesPlantillaPorDefecto();
    const personal: PersonalConfig =
      rawConfig.personal ?? crearPersonalPlantillaPorDefecto();

    return {
      id: d.id,
      nombrePlantilla: data.nombrePlantilla ?? "Plantilla sin nombre",
      tipo,
      coverUrl,
      config: {
        infoEvento,
        ajuste,
        participantes,
        personal,
      },
      createdAt: data.createdAt,
      createdBy: data.createdBy,
    };
  });

  return items;
}

export async function eliminarPlantillaEvento(
  plantillaId: string,
): Promise<void> {
  const ref = doc(db, "plantillasEvento", plantillaId);
  await deleteDoc(ref);
}

/**
 * CARGA LA CONFIGURACIÓN COMPLETA DE UN EVENTO
 * ============================================
 */
export async function cargarConfigEvento(
  eventoId: string,
): Promise<ConfigEvento | null> {
  const ref = doc(db, "eventos", eventoId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as any;
  const cfg = data.config ?? {};

  return {
    infoEvento: {
      nombre: cfg.infoEvento?.nombre ?? "Evento sin nombre",
      descripcion: cfg.infoEvento?.descripcion ?? "",
      fechaInicioEvento: cfg.infoEvento?.fechaInicioEvento ?? "",
      fechaFinEvento: cfg.infoEvento?.fechaFinEvento ?? "",
      fechaInicioInscripciones:
        cfg.infoEvento?.fechaInicioInscripciones ?? "",
      fechaFinInscripciones: cfg.infoEvento?.fechaFinInscripciones ?? "",
      imagenPortadaUrl: cfg.infoEvento?.imagenPortadaUrl ?? null,
    },
    ajuste: cfg.ajuste ?? crearAjustePlantillaPorDefecto(),
    participantes:
      cfg.participantes ?? crearParticipantesPlantillaPorDefecto(),
    personal: cfg.personal ?? crearPersonalPlantillaPorDefecto(),
  };
}

/**
 * ACTUALIZA SOLO LA INFORMACIÓN DEL EVENTO (pantalla de Información)
 * ==================================================================
 */
export async function actualizarInfoEvento(
  eventoId: string,
  info: Partial<InfoEventoConfig>,
  actor?: AuditoriaAdminEventos["actor"],
) {
  const ref = doc(db, "eventos", eventoId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as any;
  const actual = data.config?.infoEvento ?? {};

  await updateDoc(ref, {
    "config.infoEvento": {
      ...actual,
      ...info,
    },
  });

  await registrarAuditoriaAdminEventos({
    tipo: "EDITAR_EVENTO_INFO",
    eventoId,
    descripcion: "Se actualizó la información general del evento",
    payload: info,
    actor,
  });
}

/**
 * ELIMINA UN EVENTO COMPLETO
 */
export async function eliminarEvento(
  eventoId: string,
  actor?: AuditoriaAdminEventos["actor"],
) {
  const ref = doc(db, "eventos", eventoId);
  await deleteDoc(ref);

  await registrarAuditoriaAdminEventos({
    tipo: "ELIMINAR_EVENTO",
    eventoId,
    descripcion: "Se eliminó el evento y todos sus datos asociados",
    actor,
  });
}
