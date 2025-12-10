// src/modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiUser, FiUsers } from "react-icons/fi";

type Paso = 1 | 2 | 3 | 4 | 5;
type ModalidadRegistro = "individual" | "equipos";

interface RolPersonal {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface CategoriaEvento {
  id: string;
  nombre: string;
  cupo: number;
}

type TipoCampo = "texto_corto" | "email" | "telefono" | "seleccion_multiple";

interface CampoFormulario {
  id: string;
  nombreCampo: string;
  tipoCampo: TipoCampo;
  ejemplo: string;
  obligatorio: boolean;
  bloqueado?: boolean;
}

type PerfilId = "participante" | "integrante" | "lider_equipo" | "asesor";
type TipoCampoPerfil = "texto" | "numero" | "opciones" | "fecha";
type CampoPerfil = { id: string; nombre: string; tipo: TipoCampoPerfil; immutable?: boolean };

// ---- Defaults reutilizables para cargar plantilla o iniciar en blanco ----
const ROLES_PERSONAL_DEFAULT: RolPersonal[] = [
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
    id: "edecanes",
    nombre: "Edecanes",
    descripcion: "Apoyan logística y atención.",
    activo: false,
  },
  {
    id: "coord_edecanes",
    nombre: "Coordinadores de edecanes",
    descripcion: "Supervisan a edecanes.",
    activo: false,
  },
  {
    id: "invitados",
    nombre: "Invitados",
    descripcion: "Participan de manera especial en el evento.",
    activo: false,
  },
];

const CAMPOS_FORMULARIO_DEFAULT: CampoFormulario[] = [
  {
    id: "correo",
    nombreCampo: "Correo",
    tipoCampo: "email",
    ejemplo: "sección de registro",
    obligatorio: true,
    bloqueado: true,
  },
  {
    id: "telefono",
    nombreCampo: "Teléfono",
    tipoCampo: "telefono",
    ejemplo: "sección de registro",
    obligatorio: true,
    bloqueado: true,
  },
  {
    id: "institucion",
    nombreCampo: "Institución",
    tipoCampo: "seleccion_multiple",
    ejemplo: "sección de registro",
    obligatorio: true,
    bloqueado: true,
  },
];

export const PaginaCrearEventoAdminEventos: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ---------------- ESTADO GENERAL DEL WIZARD ----------------
  const [paso, setPaso] = useState<Paso>(1);

  // ----- Paso 1: Información del evento -----
  const [nombreEvento, setNombreEvento] = useState("");
  const [fechaInicioEvento, setFechaInicioEvento] = useState("");
  const [fechaFinEvento, setFechaFinEvento] = useState("");
  const [fechaInicioInscripciones, setFechaInicioInscripciones] =
    useState("");
  const [fechaFinInscripciones, setFechaFinInscripciones] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fotoNombre, setFotoNombre] = useState<string | null>(null);

  // ----- Paso 2: Personal / Staff -----
  const [rolesPersonal, setRolesPersonal] = useState<RolPersonal[]>(
    ROLES_PERSONAL_DEFAULT
  );
  const [rolSeleccionadoId, setRolSeleccionadoId] =
    useState<string>("coordinadores");

  const [modalNuevoRolAbierto, setModalNuevoRolAbierto] = useState(false);
  const [modoRol, setModoRol] = useState<"crear" | "editar">("crear");
  const [rolEditandoId, setRolEditandoId] = useState<string | null>(null);
  const [nuevoRolNombre, setNuevoRolNombre] = useState("");
  const [nuevoRolDescripcion, setNuevoRolDescripcion] = useState("");

  type TipoCampoRol = "texto" | "numero" | "opciones" | "fecha";
  type CampoRol = { id: string; nombre: string; tipo: TipoCampoRol; immutable?: boolean };
  const baseCamposRol: CampoRol[] = [
    { id: "campo-nombre", nombre: "Nombre", tipo: "texto", immutable: true },
    { id: "campo-apellido-paterno", nombre: "Apellido paterno", tipo: "texto", immutable: true },
    { id: "campo-apellido-materno", nombre: "Apellido materno", tipo: "texto", immutable: true },
    { id: "campo-correo", nombre: "Correo", tipo: "texto", immutable: true },
  ];
  const extraInicialRol: CampoRol = { id: "campo-institucion", nombre: "Institución", tipo: "opciones" };
  const [camposPorRol, setCamposPorRol] = useState<Record<string, CampoRol[]>>(() => {
    const map: Record<string, CampoRol[]> = {};
    ROLES_PERSONAL_DEFAULT.forEach((r) => {
      map[r.id] = [...baseCamposRol, extraInicialRol];
    });
    return map;
  });
  const [modalCampoRolAbierto, setModalCampoRolAbierto] = useState(false);
  const [campoRolEditandoId, setCampoRolEditandoId] = useState<string | null>(null);
  const [campoRolNombre, setCampoRolNombre] = useState("");
  const [campoRolTipo, setCampoRolTipo] = useState<TipoCampoRol>("texto");

  // ----- Paso 3: Integrantes / Participantes -----
  const [modalidadRegistro, setModalidadRegistro] =
    useState<ModalidadRegistro>("individual");
  const [maxParticipantes, setMaxParticipantes] = useState<string>("");
  const [categorias, setCategorias] = useState<CategoriaEvento[]>([]);
  const [modalNuevaCategoriaAbierto, setModalNuevaCategoriaAbierto] =
    useState(false);
  const [categoriaNombre, setCategoriaNombre] = useState("");
  const [categoriaCupo, setCategoriaCupo] = useState("");
  const [maxEquipos, setMaxEquipos] = useState<string>("");
  const [minIntegrantes, setMinIntegrantes] = useState<string>("1");
  const [maxIntegrantes, setMaxIntegrantes] = useState<string>("5");
  const [selAsesor, setSelAsesor] = useState(false);
  const [selLiderEquipo, setSelLiderEquipo] = useState(false);
  const baseInmutablesPerfil: CampoPerfil[] = [
    { id: "campo-nombre", nombre: "Nombre", tipo: "texto", immutable: true },
    { id: "campo-apellido-paterno", nombre: "Apellido paterno", tipo: "texto", immutable: true },
    { id: "campo-apellido-materno", nombre: "Apellido materno", tipo: "texto", immutable: true },
  ];
  const extrasDefaultPerfil: CampoPerfil[] = [
    { id: "campo-correo", nombre: "Correo", tipo: "texto" },
    { id: "campo-telefono", nombre: "Telefono", tipo: "numero" },
    { id: "campo-institucion", nombre: "Institución", tipo: "opciones" },
  ];
  const [camposPorPerfil, setCamposPorPerfil] = useState<Record<PerfilId, CampoPerfil[]>>({
    participante: [...baseInmutablesPerfil, ...extrasDefaultPerfil],
    integrante: [...baseInmutablesPerfil, ...extrasDefaultPerfil],
    lider_equipo: [...baseInmutablesPerfil, { id: "campo-correo-lider", nombre: "Correo", tipo: "texto" }],
    asesor: [...baseInmutablesPerfil, { id: "campo-correo-asesor", nombre: "Correo", tipo: "texto" }],
  });
  const [perfilSeleccionadoId, setPerfilSeleccionadoId] = useState<PerfilId>("participante");
  const [modalCampoPerfilAbierto, setModalCampoPerfilAbierto] = useState(false);
  const [campoPerfilEditandoId, setCampoPerfilEditandoId] = useState<string | null>(null);
  const [campoPerfilNombre, setCampoPerfilNombre] = useState("");
  const [campoPerfilTipo, setCampoPerfilTipo] = useState<TipoCampoPerfil>("texto");

  // ----- Paso 4: Ajustes del evento -----
  const [tomarAsistenciaQR, setTomarAsistenciaQR] = useState(true);
  const [tomarAsistenciaTiempos, setTomarAsistenciaTiempos] =
    useState(false);
  const [confirmacionPago, setConfirmacionPago] = useState(false);
  const [envioPorCorreo, setEnvioPorCorreo] = useState(true);
  const [medioEnvioQR, setMedioEnvioQR] = useState("Correo");
  const [costoInscripcion, setCostoInscripcion] = useState("0");
  const [tiempos, setTiempos] = useState<{ id: string; etiqueta: string }[]>(
    []
  );

  // ----- Paso 5: Formulario -----
  const [camposFormulario, setCamposFormulario] =
    useState<CampoFormulario[]>(CAMPOS_FORMULARIO_DEFAULT);
  const [modalCampoAbierto, setModalCampoAbierto] = useState(false);
  const [campoEditandoId, setCampoEditandoId] = useState<string | null>(
    null
  );
  const [campoNombre, setCampoNombre] = useState("");
  const [campoTipo, setCampoTipo] = useState<TipoCampo>("texto_corto");
  const [campoEjemplo, setCampoEjemplo] = useState("");
  const [campoObligatorio, setCampoObligatorio] = useState(true);

  // ----- Plantillas -----
  const [nombrePlantilla, setNombrePlantilla] = useState("");
  const [cargandoPlantilla, setCargandoPlantilla] = useState(false);
  const [guardandoEvento, setGuardandoEvento] = useState(false);
  const [guardandoPlantilla, setGuardandoPlantilla] = useState(false);

  // ----------------- HELPER: sidebar -----------------
  const pasos = [
    {
      id: 1 as Paso,
      titulo: "Información",
      descripcion: "Danos los datos básicos para comenzar.",
    },
    {
      id: 2 as Paso,
      titulo: "Personal",
      descripcion: "Define el equipo que participa.",
    },
    {
      id: 3 as Paso,
      titulo: "Integrantes",
      descripcion: "Configura integrantes por rol.",
    },
    {
      id: 4 as Paso,
      titulo: "Ajuste del evento",
      descripcion: "Configura fechas y estructura.",
    },
    {
      id: 5 as Paso,
      titulo: "Formulario",
      descripcion: "Define los datos a capturar.",
    },
  ];

  const esPasoActivo = (id: Paso) => id === paso;
  const esPasoCompletado = (id: Paso) => id < paso;
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");

  // ----------------- CARGAR PLANTILLA SI VIENE EN LA URL -----------------
  useEffect(() => {
    const plantillaId = searchParams.get("plantilla");
    if (!plantillaId) return;

    const cargarPlantilla = async () => {
      try {
        setCargandoPlantilla(true);
        const ref = doc(db, "plantillasEvento", plantillaId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const data = snap.data() as any;
        const cfg = data.config ?? {};
        const info = cfg.informacion ?? {};
        const part = cfg.participantes ?? {};
        const per = cfg.personal ?? {};
        const aj = cfg.ajustes ?? {};
        const form = cfg.formulario ?? {};

        setNombrePlantilla(data.nombrePlantilla ?? "");
        setNombreEvento(info.nombreEvento ?? "");
        setFechaInicioEvento(info.fechaInicioEvento ?? "");
        setFechaFinEvento(info.fechaFinEvento ?? "");
        setFechaInicioInscripciones(
          info.fechaInicioInscripciones ?? ""
        );
        setFechaFinInscripciones(info.fechaFinInscripciones ?? "");
        setDescripcion(info.descripcion ?? "");
        setFotoNombre(info.fotoNombre ?? null);

        setRolesPersonal(
          Array.isArray(per.roles) && per.roles.length > 0
            ? (per.roles as RolPersonal[])
            : ROLES_PERSONAL_DEFAULT
        );
        const initMap: Record<string, CampoRol[]> = {};
        const rolesArr: RolPersonal[] = Array.isArray(per.roles) && per.roles.length > 0 ? (per.roles as RolPersonal[]) : ROLES_PERSONAL_DEFAULT;
        rolesArr.forEach((r) => {
          initMap[r.id] = [...baseCamposRol, extraInicialRol];
        });
        setCamposPorRol(initMap);

        setModalidadRegistro(
          (part.modalidadRegistro as ModalidadRegistro) ?? "individual"
        );
        setMaxParticipantes(
          part.maxParticipantes != null
            ? String(part.maxParticipantes)
            : ""
        );
        setCategorias(
          Array.isArray(part.categorias)
            ? (part.categorias as CategoriaEvento[])
            : []
        );
        setMaxEquipos(
          part.maxEquipos != null ? String(part.maxEquipos) : ""
        );
        setMinIntegrantes(
          part.minIntegrantes != null ? String(part.minIntegrantes) : "1"
        );
        setMaxIntegrantes(
          part.maxIntegrantes != null ? String(part.maxIntegrantes) : "5"
        );
        if (part.seleccion) {
          setSelAsesor(Boolean(part.seleccion.asesor));
          setSelLiderEquipo(Boolean(part.seleccion.lider_equipo));
        } else {
          setSelAsesor(false);
          setSelLiderEquipo(false);
        }
        if (part.camposPorPerfil) {
          const map = part.camposPorPerfil as Record<string, any[]>;
          const next: Record<PerfilId, CampoPerfil[]> = { ...camposPorPerfil };
          (Object.keys(map) as string[]).forEach((k) => {
            const kk = k as PerfilId;
            const arr = Array.isArray(map[k]) ? map[k] : [];
            next[kk] = arr.map((c: any) => ({
              id: String(c.id ?? `campo_${Math.random().toString(36).slice(2, 8)}`),
              nombre: String(c.nombre ?? c.nombreCampo ?? ""),
              tipo: (c.tipo as TipoCampoPerfil) ?? "texto",
              immutable: Boolean(c.immutable ?? c.bloqueado ?? false),
            }));
          });
          setCamposPorPerfil(next);
        }

        setTomarAsistenciaQR(
          aj.tomarAsistenciaQR !== undefined ? aj.tomarAsistenciaQR : true
        );
        setTomarAsistenciaTiempos(
          aj.tomarAsistenciaTiempos !== undefined
            ? aj.tomarAsistenciaTiempos
            : false
        );
        setConfirmacionPago(
          aj.confirmacionPago !== undefined ? aj.confirmacionPago : false
        );
        setEnvioPorCorreo(
          aj.envioPorCorreo !== undefined ? aj.envioPorCorreo : true
        );
        setMedioEnvioQR(aj.medioEnvioQR ?? "Correo");
        setCostoInscripcion(
          aj.costoInscripcion != null
            ? String(aj.costoInscripcion)
            : "0"
        );
        setTiempos(Array.isArray(aj.tiempos) ? aj.tiempos : []);

        setCamposFormulario(
          Array.isArray(form.campos) && form.campos.length > 0
            ? (form.campos as CampoFormulario[])
            : CAMPOS_FORMULARIO_DEFAULT
        );
      } finally {
        setCargandoPlantilla(false);
      }
    };

    cargarPlantilla();
  }, [searchParams]);

  // ----------------- VALIDACIONES POR PASO -----------------
  const validarPaso = (p: Paso): boolean => {
    switch (p) {
      case 1: {
        if (!nombreEvento.trim()) {
          alert("Escribe el nombre del evento.");
          return false;
        }
        if (
          !fechaInicioEvento ||
          !fechaFinEvento ||
          !fechaInicioInscripciones ||
          !fechaFinInscripciones
        ) {
          alert("Completa todas las fechas del evento e inscripciones.");
          return false;
        }
        if (!descripcion.trim()) {
          alert("Escribe una descripción del evento.");
          return false;
        }
        const fi = new Date(fechaInicioEvento).getTime();
        const ff = new Date(fechaFinEvento).getTime();
        const fii = new Date(fechaInicioInscripciones).getTime();
        const ffi = new Date(fechaFinInscripciones).getTime();
        if (fi && ff && fi > ff) {
          alert("La fecha de inicio del evento no puede ser mayor a la de fin.");
          return false;
        }
        if (fii && ffi && fii > ffi) {
          alert(
            "La fecha de inicio de inscripciones no puede ser mayor a la de fin."
          );
          return false;
        }
        return true;
      }
      case 2: {
        if (!rolesPersonal.some((r) => r.activo)) {
          alert("Activa al menos un rol de personal para el evento.");
          return false;
        }
        return true;
      }
      case 3: {
        if (modalidadRegistro === "equipos" && categorias.length === 0) {
          alert(
            "El evento está configurado por equipos; agrega al menos una categoría."
          );
          return false;
        }
        if (maxParticipantes && Number(maxParticipantes) <= 0) {
          alert("La cantidad máxima de participantes debe ser mayor a cero.");
          return false;
        }
        return true;
      }
      case 4: {
        if (confirmacionPago && Number(costoInscripcion) <= 0) {
          alert(
            "Si habilitas confirmación de pago, define un costo de inscripción mayor a cero."
          );
          return false;
        }
        return true;
      }
      case 5: {
        if (camposFormulario.length === 0) {
          alert("Agrega al menos un campo en el formulario.");
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  // ----------------- CONSTRUCCIÓN DE LA CONFIGURACIÓN -----------------
  const construirConfigEvento = () => ({
    informacion: {
      nombreEvento,
      fechaInicioEvento,
      fechaFinEvento,
      fechaInicioInscripciones,
      fechaFinInscripciones,
      descripcion,
      fotoNombre: fotoNombre ?? null,
    },
    personal: {
      roles: rolesPersonal,
    },
    participantes: {
      modalidadRegistro,
      maxParticipantes: maxParticipantes ? Number(maxParticipantes) : null,
      categorias,
      seleccion: { asesor: selAsesor, lider_equipo: selLiderEquipo },
      maxEquipos: maxEquipos ? Number(maxEquipos) : null,
      minIntegrantes: minIntegrantes ? Number(minIntegrantes) : null,
      maxIntegrantes: maxIntegrantes ? Number(maxIntegrantes) : null,
      camposPorPerfil: camposPorPerfil,
    },
    ajustes: {
      tomarAsistenciaQR,
      tomarAsistenciaTiempos,
      confirmacionPago,
      envioPorCorreo,
      medioEnvioQR,
      costoInscripcion: Number(costoInscripcion) || 0,
      tiempos,
    },
    formulario: {
      campos: camposFormulario,
    },
  });

  // ----------------- GUARDAR EN FIRESTORE -----------------
  const guardarEventoEnFirestore = async () => {
    try {
      setGuardandoEvento(true);
      const config = construirConfigEvento();

      const docRef = await addDoc(collection(db, "eventos"), {
        ...config,
        meta: {
          creadoEn: serverTimestamp(),
          idPlantillaOrigen: searchParams.get("plantilla") ?? null,
        },
      });

      alert("Evento creado correctamente en Firestore.");
      navigate(`/admin-eventos/evento/${docRef.id}`);
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      alert("Ocurrió un error al guardar el evento.");
    } finally {
      setGuardandoEvento(false);
    }
  };

  const guardarPlantillaEnFirestore = async () => {
    if (!nombrePlantilla.trim()) {
      alert("Escribe un nombre para la plantilla antes de guardarla.");
      return;
    }
    try {
      setGuardandoPlantilla(true);
      const config = construirConfigEvento();

      await addDoc(collection(db, "plantillasEvento"), {
        nombrePlantilla: nombrePlantilla.trim(),
        miniaturaUrl: config.informacion.fotoNombre ?? null,
        config,
        meta: {
          creadoEn: serverTimestamp(),
        },
      });

      alert("Plantilla guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar la plantilla:", error);
      alert("Ocurrió un error al guardar la plantilla.");
    } finally {
      setGuardandoPlantilla(false);
    }
  };

  // ----------------- NAVIGACIÓN -----------------
  const irSiguiente = async () => {
    // Valida el paso actual
    if (!validarPaso(paso)) return;

    if (paso < 5) {
      setSlideDir("next");
      setPaso((p) => (p + 1) as Paso);
      return;
    }
    // En el último paso se guarda el evento
    await guardarEventoEnFirestore();
  };

  const irAnterior = () => {
    if (paso > 1) {
      setSlideDir("prev");
      setPaso((p) => (p - 1) as Paso);
    }
  };

  // ----------------- HANDLERS DE MODALES -----------------
  const abrirModalNuevoRol = () => {
    setModoRol("crear");
    setRolEditandoId(null);
    setNuevoRolNombre("");
    setNuevoRolDescripcion("");
    setModalNuevoRolAbierto(true);
  };

  const abrirModalEditarRol = (rol: RolPersonal) => {
    setModoRol("editar");
    setRolEditandoId(rol.id);
    setNuevoRolNombre(rol.nombre);
    setNuevoRolDescripcion(rol.descripcion);
    setModalNuevoRolAbierto(true);
  };

  const guardarNuevoRol = () => {
    if (!nuevoRolNombre.trim()) return;
    if (modoRol === "crear") {
      const id = `custom_${Date.now()}`;
      setRolesPersonal((prev) => [
        ...prev,
        {
          id,
          nombre: nuevoRolNombre.trim(),
          descripcion: nuevoRolDescripcion.trim(),
          activo: true,
        },
      ]);
      setCamposPorRol((prev) => ({ ...prev, [id]: [...baseCamposRol, extraInicialRol] }));
      setRolSeleccionadoId(id);
    } else if (modoRol === "editar" && rolEditandoId) {
      setRolesPersonal((prev) =>
        prev.map((r) =>
          r.id === rolEditandoId
            ? { ...r, nombre: nuevoRolNombre.trim(), descripcion: nuevoRolDescripcion.trim() }
            : r
        )
      );
    }
    setModalNuevoRolAbierto(false);
  };

  const abrirModalCampoRolNuevo = () => {
    setCampoRolEditandoId(null);
    setCampoRolNombre("");
    setCampoRolTipo("texto");
    setModalCampoRolAbierto(true);
  };

  const abrirModalCampoRolEditar = (campo: CampoRol) => {
    if (campo.immutable) return;
    setCampoRolEditandoId(campo.id);
    setCampoRolNombre(campo.nombre);
    setCampoRolTipo(campo.tipo);
    setModalCampoRolAbierto(true);
  };

  const guardarCampoRol = () => {
    if (!rolSeleccionadoId || !campoRolNombre.trim()) return;
    setCamposPorRol((prev) => {
      const lista = prev[rolSeleccionadoId] ?? [];
      if (campoRolEditandoId) {
        return {
          ...prev,
          [rolSeleccionadoId]: lista.map((c) =>
            c.id === campoRolEditandoId ? { ...c, nombre: campoRolNombre.trim(), tipo: campoRolTipo } : c
          ),
        };
      }
      const nuevo: CampoRol = {
        id: `campo_${Date.now()}`,
        nombre: campoRolNombre.trim(),
        tipo: campoRolTipo,
      };
      return { ...prev, [rolSeleccionadoId]: [...lista, nuevo] };
    });
    setModalCampoRolAbierto(false);
  };

  const eliminarCampoRol = (id: string) => {
    if (!rolSeleccionadoId) return;
    setCamposPorRol((prev) => ({
      ...prev,
      [rolSeleccionadoId]: (prev[rolSeleccionadoId] ?? []).filter((c) => c.id !== id),
    }));
    setModalCampoRolAbierto(false);
  };

  const abrirModalNuevaCategoria = () => {
    setCategoriaNombre("");
    setCategoriaCupo("");
    setModalNuevaCategoriaAbierto(true);
  };

  const guardarNuevaCategoria = () => {
    if (!categoriaNombre.trim()) return;
    const id = `cat_${Date.now()}`;
    setCategorias((prev) => [
      ...prev,
      {
        id,
        nombre: categoriaNombre.trim(),
        cupo: categoriaCupo ? Number(categoriaCupo) : 0,
      },
    ]);
    setModalNuevaCategoriaAbierto(false);
  };

  const abrirModalCampoNuevo = () => {
    setCampoEditandoId(null);
    setCampoNombre("");
    setCampoTipo("texto_corto");
    setCampoEjemplo("");
    setCampoObligatorio(true);
    setModalCampoAbierto(true);
  };

  const abrirModalCampoPerfilNuevo = () => {
    setCampoPerfilEditandoId(null);
    setCampoPerfilNombre("");
    setCampoPerfilTipo("texto");
    setModalCampoPerfilAbierto(true);
  };

  const abrirModalCampoPerfilEditar = (campo: CampoPerfil) => {
    if (campo.immutable) return;
    setCampoPerfilEditandoId(campo.id);
    setCampoPerfilNombre(campo.nombre);
    setCampoPerfilTipo(campo.tipo);
    setModalCampoPerfilAbierto(true);
  };

  const guardarCampoPerfil = () => {
    if (!campoPerfilNombre.trim()) return;
    setCamposPorPerfil((prev) => {
      const lista = prev[perfilSeleccionadoId] ?? [];
      if (campoPerfilEditandoId) {
        return {
          ...prev,
          [perfilSeleccionadoId]: lista.map((c) =>
            c.id === campoPerfilEditandoId ? { ...c, nombre: campoPerfilNombre.trim(), tipo: campoPerfilTipo } : c
          ),
        };
      }
      const nuevo: CampoPerfil = {
        id: `campo_${Date.now()}`,
        nombre: campoPerfilNombre.trim(),
        tipo: campoPerfilTipo,
      };
      return { ...prev, [perfilSeleccionadoId]: [...lista, nuevo] };
    });
    setModalCampoPerfilAbierto(false);
  };

  const eliminarCampoPerfil = (id: string) => {
    setCamposPorPerfil((prev) => ({
      ...prev,
      [perfilSeleccionadoId]: (prev[perfilSeleccionadoId] ?? []).filter((c) => c.id !== id),
    }));
    setModalCampoPerfilAbierto(false);
  };

  const abrirModalCampoEditar = (campo: CampoFormulario) => {
    if (campo.bloqueado) return;
    setCampoEditandoId(campo.id);
    setCampoNombre(campo.nombreCampo);
    setCampoTipo(campo.tipoCampo);
    setCampoEjemplo(campo.ejemplo);
    setCampoObligatorio(campo.obligatorio);
    setModalCampoAbierto(true);
  };

  const guardarCampoFormulario = () => {
    if (!campoNombre.trim()) return;

    if (campoEditandoId) {
      setCamposFormulario((prev) =>
        prev.map((c) =>
          c.id === campoEditandoId
            ? {
                ...c,
                nombreCampo: campoNombre.trim(),
                tipoCampo: campoTipo,
                ejemplo: campoEjemplo.trim(),
                obligatorio: campoObligatorio,
              }
            : c
        )
      );
    } else {
      setCamposFormulario((prev) => [
        ...prev,
        {
          id: `campo_${Date.now()}`,
          nombreCampo: campoNombre.trim(),
          tipoCampo: campoTipo,
          ejemplo: campoEjemplo.trim(),
          obligatorio: campoObligatorio,
        },
      ]);
    }

    setModalCampoAbierto(false);
  };

  const eliminarCampoFormulario = (id: string) => {
    setCamposFormulario((prev) => prev.filter((c) => c.id !== id));
  };

  // ----------------- SUBVISTAS DE CADA PASO -----------------
  const renderPaso1 = () => (
    <>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Información del Evento
      </h1>

      {/* Foto del evento */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-700 mb-2">
          Foto del Evento
        </p>
        <label className="cursor-pointer border border-dashed border-[#D0D5FF] rounded-2xl h-40 flex flex-col items-center justify-center text-center text-xs text-slate-500 bg-[#F7F7FF]">
          <div className="mb-2 text-3xl">🖼️</div>
          <p className="mb-1">
            <span className="text-[#5B4AE5] font-semibold">
              Sube un archivo
            </span>{" "}
            o arrástralo aquí
          </p>
          <p className="text-[11px] text-slate-400">
            PNG, JPG o GIF hasta 10MB
          </p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFotoNombre(file.name);
              } else {
                setFotoNombre(null);
              }
            }}
          />
        </label>
        {fotoNombre && (
          <p className="mt-1 text-[11px] text-slate-500">
            Archivo seleccionado: <strong>{fotoNombre}</strong>
          </p>
        )}
      </div>

      {/* Campos principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Fecha de inicio de Inscripciones
            <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={fechaInicioInscripciones}
            onChange={(e) => setFechaInicioInscripciones(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Fecha de fin de Inscripciones
            <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={fechaFinInscripciones}
            onChange={(e) => setFechaFinInscripciones(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Nombre del evento<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Exp. InnovaTECNM 2026"
            value={nombreEvento}
            onChange={(e) => setNombreEvento(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Fecha de inicio del Evento
            <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={fechaInicioEvento}
            onChange={(e) => setFechaInicioEvento(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Fecha de Finalización del Evento
            <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={fechaFinEvento}
            onChange={(e) => setFechaFinEvento(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
          />
        </div>

        
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-700">
          Descripción<span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Descripción del evento e información general."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] resize-none focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
        />
      </div>
    </>
  );

  const renderPaso2 = () => {
    const rolSeleccionado = rolesPersonal.find(
      (r) => r.id === rolSeleccionadoId
    );

    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Personal
          </h1>
          <button
            type="button"
            onClick={abrirModalNuevoRol}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md"
          >
            Añadir personal
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Haz clic sobre un rol para seleccionarlo. El seleccionado se
          resalta en lila. Usa el interruptor para activar/desactivar
          ese rol.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {rolesPersonal.map((rol) => {
            const activo = rol.activo;
            const seleccionado = rolSeleccionadoId === rol.id;
            return (
              <div
                key={rol.id}
                className={`border rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer transition ${
                  seleccionado
                    ? "border-[#5B4AE5] bg-[#F4F2FF]"
                    : "border-slate-200 bg-white"
                }`}
                onClick={() => setRolSeleccionadoId(rol.id)}
                onDoubleClick={() => abrirModalEditarRol(rol)}
              >
                <div>
                  <h3
                    className={`text-sm font-semibold ${
                      seleccionado
                        ? "text-[#5B4AE5]"
                        : "text-slate-800"
                    }`}
                  >
                    {rol.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {rol.descripcion}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRolesPersonal((prev) =>
                      prev.map((r) =>
                        r.id === rol.id ? { ...r, activo: !r.activo } : r
                      )
                    );
                  }}
                  className={`w-10 h-5 rounded-full flex items-center px-0.5 transition ${
                    activo ? "bg-[#5B4AE5]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`h-4 w-4 bg-white rounded-full shadow transform transition ${
                      activo ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-700">Campos necesarios</p>
            <button
              type="button"
              onClick={abrirModalCampoRolNuevo}
              className="h-9 w-9 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white shadow-md flex items-center justify-center"
            >
              +
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Selecciona un rol. Los campos base aparecen en gris y no pueden editarse ni eliminarse. Haz doble clic en un campo editable para abrir la edición.
          </p>
          {rolSeleccionadoId ? (
            <div className="flex flex-wrap gap-2">
              {(camposPorRol[rolSeleccionadoId] ?? []).map((c) => {
                const noEditable = !!c.immutable;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onDoubleClick={() => abrirModalCampoRolEditar(c)}
                    className={`px-3 py-1 rounded-full text-[11px] border ${
                      noEditable
                        ? "bg-slate-200 text-slate-600 border-slate-300"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-[#EFF0FF] hover:text-[#5B4AE5] hover:border-[#C9C5FF]"
                    }`}
                  >
                    {c.nombre}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Selecciona un rol para configurar sus campos.</p>
          )}
        </div>

      {rolSeleccionado && (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <p className="font-semibold mb-1">
            Rol seleccionado: {rolSeleccionado.nombre}
          </p>
          <p>{rolSeleccionado.descripcion}</p>
        </div>
      )}
      </>
    );
  };

  const renderPaso3 = () => (
    <>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Participantes
      </h1>

      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-700 mb-2">Modalidad</p>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            aria-label="Modo Individual"
            onClick={() => setModalidadRegistro("individual")}
            className={`flex items-center gap-3 rounded-3xl px-4 py-3 border transition w-full sm:w-auto shadow-sm ${
              modalidadRegistro === "individual"
                ? "bg-[#EFF0FF] border-[#C9C5FF] text-[#5B4AE5]"
                : "bg-white border-slate-200 text-slate-700 hover:bg-[#F8F8FF]"
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              modalidadRegistro === "individual" ? "bg-[#E7E6FF] text-[#5B4AE5]" : "bg-slate-100 text-slate-600"
            }`}>
              <FiUser size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold">Individual</p>
              <p className="text-[11px] text-slate-500">Cada participante se registra por separado</p>
            </div>
          </button>
          <button
            type="button"
            aria-label="Modo por equipos"
            onClick={() => setModalidadRegistro("equipos")}
            className={`flex items-center gap-3 rounded-3xl px-4 py-3 border transition w-full sm:w-auto shadow-sm ${
              modalidadRegistro === "equipos"
                ? "bg-[#EFF0FF] border-[#C9C5FF] text-[#5B4AE5]"
                : "bg-white border-slate-200 text-slate-700 hover:bg-[#F8F8FF]"
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              modalidadRegistro === "equipos" ? "bg-[#E7E6FF] text-[#5B4AE5]" : "bg-slate-100 text-slate-600"
            }`}>
              <FiUsers size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold">Por equipos</p>
              <p className="text-[11px] text-slate-500">Los participantes forman equipos</p>
            </div>
          </button>
        </div>
      </div>

      <div className="mb-4 max-w-xs">
        <label className="text-xs font-semibold text-slate-700">
          Definir cantidad máxima de participantes
        </label>
        <input
          type="number"
          min={0}
          placeholder="ej. 500"
          value={maxParticipantes}
          onChange={(e) => setMaxParticipantes(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-700">
            Categorías
          </p>
          <button
            type="button"
            onClick={abrirModalNuevaCategoria}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-[#5B4AE5]/30 text-xs text-[#5B4AE5] font-semibold shadow-sm"
          >
            +<span className="ml-1">Agregar categoría</span>
          </button>
        </div>
        {categorias.length === 0 ? (
          <p className="text-[11px] text-slate-500">
            No se han agregado categorías.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {cat.nombre}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Cupo: {cat.cupo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalidadRegistro === "equipos" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Máx. equipos participantes</label>
            <input type="number" min={1} placeholder="ej. 50" value={maxEquipos} onChange={(e) => setMaxEquipos(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Mín. integrantes por equipo</label>
            <input type="number" min={1} placeholder="ej. 1" value={minIntegrantes} onChange={(e) => setMinIntegrantes(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Máx. integrantes por equipo</label>
            <input type="number" min={1} placeholder="ej. 5" value={maxIntegrantes} onChange={(e) => setMaxIntegrantes(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-slate-700 mb-2">Selección de perfiles</p>
        <div className={`grid grid-cols-1 ${modalidadRegistro === "equipos" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-3 mb-4`}>
          {(modalidadRegistro === "equipos"
            ? [
                { id: "integrante" as PerfilId, titulo: "Integrante", toggle: false },
                { id: "lider_equipo" as PerfilId, titulo: "Líder de equipo", toggle: true },
                { id: "asesor" as PerfilId, titulo: "Asesor", toggle: true },
              ]
            : [
                { id: "participante" as PerfilId, titulo: "Participante", toggle: false },
                { id: "asesor" as PerfilId, titulo: "Asesor", toggle: true },
              ]
          ).map((opt) => {
            const activo = perfilSeleccionadoId === opt.id;
            const switchOn = opt.id === "asesor" ? selAsesor : opt.id === "lider_equipo" ? selLiderEquipo : true;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPerfilSeleccionadoId(opt.id)}
                className={`text-left rounded-3xl border px-5 py-4 transition min-h-[90px] shadow-sm ${activo ? "bg-[#EFF0FF] border-[#A5A0FF]" : switchOn ? "bg-white border-slate-200 hover:bg-[#F8F8FF] hover:border-[#C9C5FF]" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${activo ? "text-[#5B4AE5]" : switchOn ? "text-slate-700" : "text-slate-400"}`}>{opt.titulo}</span>
                  {opt.toggle && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (opt.id === "asesor") setSelAsesor((v) => !v);
                        if (opt.id === "lider_equipo") setSelLiderEquipo((v) => !v);
                      }}
                      className={`h-5 w-10 rounded-full transition ${switchOn ? "bg-[#5B4AE5]" : "bg-slate-300"}`}
                    >
                      <span className={`block h-5 w-5 bg-white rounded-full shadow transform transition ${switchOn ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  )}
                </div>
                <p className={`text-[11px] ${switchOn ? "text-slate-500" : "text-slate-400"}`}>Variables del perfil.</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700">Campos necesarios para {perfilSeleccionadoId}</p>
          <button type="button" onClick={abrirModalCampoPerfilNuevo} className="h-9 w-9 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white shadow-md flex items-center justify-center">+</button>
        </div>
        <div className="mb-1 rounded-xl bg-[#F7F7FF] border border-[#E0DDFB] px-4 py-3">
          <p className="text-[11px] text-slate-600">Los siguientes campos se convierten en variables y parte del formulario de inscripción. Los inmutables aparecen en gris.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {(camposPorPerfil[perfilSeleccionadoId] ?? []).map((campo) => {
            const noEditable = !!campo.immutable;
            const baseClase = `inline-flex items-center rounded-full px-4 py-2 text-sm border transition`;
            const claseEstado = noEditable ? "bg-slate-200 text-slate-600 border-slate-300" : "bg-white text-slate-700 border-slate-300 hover:bg-[#EFF0FF] hover:text-[#5B4AE5] hover:border-[#C9C5FF]";
            return (
              <button
                key={campo.id}
                type="button"
                onClick={() => void 0}
                onDoubleClick={() => abrirModalCampoPerfilEditar(campo)}
                className={`${baseClase} ${claseEstado}`}
              >
                {campo.nombre}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  const renderPaso4 = () => (
    <>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Características del evento
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setTomarAsistenciaQR((v) => !v)}
          className={`border rounded-2xl px-4 py-3 text-left text-xs transition ${
            tomarAsistenciaQR
              ? "border-[#5B4AE5] bg-[#F4F2FF]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-800">
              Tomar asistencia por QR
            </span>
            <span
              className={`w-9 h-4 rounded-full flex items-center px-0.5 ${
                tomarAsistenciaQR ? "bg-[#5B4AE5]" : "bg-slate-300"
              }`}
            >
              <span
                className={`h-3 w-3 bg-white rounded-full shadow transform transition ${
                  tomarAsistenciaQR ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Registrar asistencia con código QR.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setConfirmacionPago((v) => !v)}
          className={`border rounded-2xl px-4 py-3 text-left text-xs transition ${
            confirmacionPago
              ? "border-[#5B4AE5] bg-[#F4F2FF]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-800">
              Confirmación de pago
            </span>
            <span
              className={`w-9 h-4 rounded-full flex items-center px-0.5 ${
                confirmacionPago ? "bg-[#5B4AE5]" : "bg-slate-300"
              }`}
            >
              <span
                className={`h-3 w-3 bg-white rounded-full shadow transform transition ${
                  confirmacionPago ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Confirmar pagos de participación/entrada.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setEnvioPorCorreo((v) => !v)}
          className={`border rounded-2xl px-4 py-3 text-left text-xs transition ${
            envioPorCorreo
              ? "border-[#5B4AE5] bg-[#F4F2FF]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-800">
              Envío por correo
            </span>
            <span
              className={`w-9 h-4 rounded-full flex items-center px-0.5 ${
                envioPorCorreo ? "bg-[#5B4AE5]" : "bg-slate-300"
              }`}
            >
              <span
                className={`h-3 w-3 bg-white rounded-full shadow transform transition ${
                  envioPorCorreo ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Enviar constancias por correo.
          </p>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-semibold text-slate-700">
            Envío de QR
          </label>
          <select
            value={medioEnvioQR}
            onChange={(e) => setMedioEnvioQR(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
          >
            <option value="Correo">Correo</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">
            Costo de Inscripción
          </label>
          <input
            type="number"
            min={0}
            value={costoInscripcion}
            onChange={(e) => setCostoInscripcion(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-700">
            Tiempos de asistencia
          </p>
          <button
            type="button"
            onClick={() =>
              setTiempos((prev) => [
                ...prev,
                {
                  id: `t_${Date.now()}`,
                  etiqueta: `Tiempo ${prev.length + 1}`,
                },
              ])
            }
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-[#5B4AE5]/30 text-xs text-[#5B4AE5] font-semibold shadow-sm"
          >
            +<span className="ml-1">Añadir tiempo</span>
          </button>
        </div>
        {tiempos.length === 0 ? (
          <p className="text-[11px] text-slate-500">
            No se han agregado tiempos.
          </p>
        ) : (
          <ul className="text-xs text-slate-600 space-y-1">
            {tiempos.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#5B4AE5]" />
                {t.etiqueta}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  const renderPaso5 = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Formulario
        </h1>
        <button
          type="button"
          onClick={abrirModalCampoNuevo}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md"
        >
          Agregar pregunta
        </button>
      </div>

      <p className="text-[11px] text-slate-500 mb-3">
        El modo de registro (Individual / Por equipos) y los campos
        obligatorios vienen de la sección Participantes. Aquí puedes
        agregar campos adicionales.
      </p>
      {(() => {
        const baseIdsOcultas = new Set(["nombre", "ap_paterno", "ap_materno"]);
        const baseBloqueados = camposFormulario.filter((c) => c.bloqueado && !baseIdsOcultas.has(c.id));
        const adicionales = camposFormulario.filter((c) => !c.bloqueado);
        const secciones: { nombre: string; tipo: string; ejemplo: string; obligatorio: boolean; key: string }[] = [];
        if (modalidadRegistro === "equipos") {
          secciones.push({ nombre: "Nombre del Equipo", tipo: "Equipo", ejemplo: "ej. Astros", obligatorio: true, key: "equipo_nombre" });
          if (selAsesor) secciones.push({ nombre: "Asesor", tipo: "Asesor", ejemplo: "sección de registro", obligatorio: true, key: "seccion_asesor" });
          if (selLiderEquipo) secciones.push({ nombre: "Líder de Equipo", tipo: "Líder de Equipo", ejemplo: "sección de registro", obligatorio: true, key: "seccion_lider" });
          const maxI = Number(maxIntegrantes) || 0;
          const minI = Number(minIntegrantes) || 0;
          for (let i = 1; i <= maxI; i++) {
            secciones.push({ nombre: `Integrante ${i}`, tipo: "Integrante", ejemplo: "sección de registro", obligatorio: i <= minI, key: `seccion_integrante_${i}` });
          }
        }
        return (
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Nombre del Campo</th>
                  <th className="text-left px-4 py-2 font-semibold">Tipo de Campo</th>
                  <th className="text-left px-4 py-2 font-semibold">texto de ejemplo</th>
                  <th className="text-left px-4 py-2 font-semibold">Obligatorio</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {secciones.map((s) => (
                  <tr key={s.key} className="border-t border-slate-100">
                    <td className="px-4 py-2">{s.nombre}</td>
                    <td className="px-4 py-2">{s.tipo}</td>
                    <td className="px-4 py-2">{s.ejemplo}</td>
                    <td className="px-4 py-2">{s.obligatorio ? "Sí" : "No"}</td>
                    <td className="px-4 py-2" />
                  </tr>
                ))}
                {baseBloqueados.map((campo) => (
                  <tr key={campo.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-2">{campo.nombreCampo}</td>
                    <td className="px-4 py-2">
                      {campo.tipoCampo === "texto_corto" && "Texto corto"}
                      {campo.tipoCampo === "email" && "Email"}
                      {campo.tipoCampo === "telefono" && "Teléfono"}
                      {campo.tipoCampo === "seleccion_multiple" && "Selección múltiple"}
                    </td>
                    <td className="px-4 py-2">{campo.ejemplo}</td>
                    <td className="px-4 py-2">{campo.obligatorio ? "Sí" : "No"}</td>
                    <td className="px-4 py-2" />
                  </tr>
                ))}
                {adicionales.map((campo) => (
                  <tr key={campo.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-2">{campo.nombreCampo}</td>
                    <td className="px-4 py-2">
                      {campo.tipoCampo === "texto_corto" && "Texto corto"}
                      {campo.tipoCampo === "email" && "Email"}
                      {campo.tipoCampo === "telefono" && "Teléfono"}
                      {campo.tipoCampo === "seleccion_multiple" && "Selección múltiple"}
                    </td>
                    <td className="px-4 py-2">{campo.ejemplo}</td>
                    <td className="px-4 py-2">{campo.obligatorio ? "Sí" : "No"}</td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button type="button" onClick={() => abrirModalCampoEditar(campo)} className="text-[#5B4AE5] hover:underline">Editar</button>
                      <button type="button" onClick={() => eliminarCampoFormulario(campo.id)} className="text-red-500 hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </>
  );

  // ----------------- RENDER PRINCIPAL -----------------
  if (cargandoPlantilla) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#192D69] to-[#6581D6]">
        <p className="text-white text-sm opacity-90">
          Cargando plantilla...
        </p>
      </div>
    );
  }

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-[#192D69] to-[#6581D6] flex justify-center items-center py-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="w-[95%] max-w-[1240px] min-h-[560px] bg-white rounded-[32px] shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <motion.aside className="w-80 bg-[#F4F2FF] px-10 py-10 flex flex-col border-r border-[#E0DDFB]" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <h2 className="text-2xl font-semibold text-slate-900 mb-10">
            Crear Evento
          </h2>

          <ol className="space-y-6 text-sm">
            {pasos.map((p, index) => {
              const activo = esPasoActivo(p.id);
              const completado = esPasoCompletado(p.id);
              const ultimo = index === pasos.length - 1;

              return (
                <li key={p.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div
                      className={`h-8 w-8 rounded-2xl flex items-center justify-center text-sm font-semibold shadow-md ${
                        activo
                          ? "bg-[#5B4AE5] text-white"
                          : completado
                          ? "bg-white text-[#5B4AE5] border border-[#5B4AE5]"
                          : "bg-white text-slate-400 border border-[#E0DDFB]"
                      }`}
                    >
                      {p.id}
                    </div>
                    {!ultimo && (
                      <div
                        className={`w-[2px] flex-1 mt-1 ${
                          completado ? "bg-[#5B4AE5]" : "bg-[#D4D0F7]"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.15em] ${
                        activo ? "text-[#5B4AE5]" : "text-slate-600"
                      }`}
                    >
                      {p.titulo}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[170px]">
                      {p.descripcion}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            className="mt-auto w-full rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white font-semibold py-3 text-sm shadow-md"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
        </motion.aside>

        {/* Contenido principal */}
        <section className="flex-1 px-10 py-10 flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={paso} initial={{ x: slideDir === "next" ? 30 : -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: slideDir === "next" ? -30 : 30, opacity: 0 }} transition={{ duration: 0.25 }}>
                {paso === 1 && renderPaso1()}
                {paso === 2 && renderPaso2()}
                {paso === 3 && renderPaso3()}
                {paso === 4 && renderPaso4()}
                {paso === 5 && renderPaso5()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Paso{" "}
              <span className="font-semibold text-slate-600">
                {paso}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-600">
                5
              </span>
            </span>

            <div className="flex items-center gap-3">
              {paso === 5 && (
                <input
                  type="text"
                  placeholder="Nombre de plantilla (opcional)"
                  value={nombrePlantilla}
                  onChange={(e) => setNombrePlantilla(e.target.value)}
                  className="hidden md:block w-56 rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40"
                />
              )}

              {paso > 1 && (
                <button
                  type="button"
                  onClick={irAnterior}
                  className="px-6 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50"
                >
                  Volver
                </button>
              )}

              {paso === 5 && (
                <button
                  type="button"
                  onClick={guardarPlantillaEnFirestore}
                  disabled={guardandoPlantilla}
                  className="px-6 py-2.5 rounded-full border border-[#5B4AE5]/40 text-sm font-semibold text-[#5B4AE5] bg-white hover:bg-slate-50 disabled:opacity-60"
                >
                  {guardandoPlantilla
                    ? "Guardando plantilla..."
                    : "Guardar como plantilla"}
                </button>
              )}

              <button
                type="button"
                onClick={irSiguiente}
                disabled={guardandoEvento}
                className="px-8 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md disabled:opacity-60"
              >
                {paso === 5
                  ? guardandoEvento
                    ? "Guardando evento..."
                    : "Finalizar"
                  : "Siguiente"}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ------------ MODALES ------------ */}

      {/* Modal nuevo rol */}
      {modalNuevoRolAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-3xl w-full max-w-md px-8 py-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{modoRol === "crear" ? "Agregar personal" : "Editar personal"}</h3>
            <div className="space-y-3 mb-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Rol
                </label>
                <input
                  type="text"
                  placeholder="Ej. Coordinación general"
                  value={nuevoRolNombre}
                  onChange={(e) => setNuevoRolNombre(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Descripción
                </label>
                <input
                  type="text"
                  placeholder="Ej. Organiza y supervisa el evento"
                  value={nuevoRolDescripcion}
                  onChange={(e) =>
                    setNuevoRolDescripcion(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalNuevoRolAbierto(false)}
                className="px-5 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarNuevoRol}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md"
              >
                {modoRol === "crear" ? "Agregar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva categoría */}
      {modalNuevaCategoriaAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-3xl w-full max-w-md px-8 py-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Nueva Categoría
            </h3>
            <div className="space-y-3 mb-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sistemas"
                  value={categoriaNombre}
                  onChange={(e) =>
                    setCategoriaNombre(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Cantidad de personas
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="Ej. 300"
                  value={categoriaCupo}
                  onChange={(e) => setCategoriaCupo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setModalNuevaCategoriaAbierto(false)
                }
                className="px-5 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarNuevaCategoria}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar/editar campo de formulario */}
      {modalCampoAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-3xl w-full max-w-md px-8 py-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {campoEditandoId
                ? "Editar pregunta"
                : "Agregar nueva pregunta"}
            </h3>
            <div className="space-y-3 mb-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Texto de la pregunta
                </label>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={campoNombre}
                  onChange={(e) =>
                    setCampoNombre(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Tipo de campo
                </label>
                <select
                  value={campoTipo}
                  onChange={(e) =>
                    setCampoTipo(e.target.value as TipoCampo)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
                >
                  <option value="texto_corto">Texto corto</option>
                  <option value="email">Email</option>
                  <option value="telefono">Teléfono</option>
                  <option value="seleccion_multiple">
                    Selección múltiple
                  </option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Texto de ejemplo
                </label>
                <input
                  type="text"
                  placeholder="Ej. José"
                  value={campoEjemplo}
                  onChange={(e) =>
                    setCampoEjemplo(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Obligatoria
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCampoObligatorio((v) => !v)
                  }
                  className={`w-10 h-5 rounded-full flex items-center px-0.5 ${
                    campoObligatorio ? "bg-[#5B4AE5]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`h-4 w-4 bg-white rounded-full shadow transform transition ${
                      campoObligatorio
                        ? "translate-x-4"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalCampoAbierto(false)}
                className="px-5 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarCampoFormulario}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar/editar campo por rol (Personal) */}
      {modalCampoRolAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-3xl w-full max-w-md px-8 py-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{campoRolEditandoId ? "Editar campo del rol" : "Agregar campo al rol"}</h3>
            <div className="space-y-3 mb-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nombre del campo</label>
                <input type="text" value={campoRolNombre} onChange={(e) => setCampoRolNombre(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tipo</label>
                <select value={campoRolTipo} onChange={(e) => setCampoRolTipo(e.target.value as TipoCampoRol)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]">
                  <option value="texto">Texto</option>
                  <option value="numero">Número</option>
                  <option value="opciones">Opciones</option>
                  <option value="fecha">Fecha</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModalCampoRolAbierto(false)} className="px-5 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50">Cancelar</button>
              <button type="button" onClick={guardarCampoRol} className="px-6 py-2 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md">Guardar</button>
              {campoRolEditandoId && (
                <button type="button" onClick={() => eliminarCampoRol(campoRolEditandoId)} className="px-6 py-2 rounded-full bg-rose-500 text-white text-sm font-semibold shadow-md">Eliminar</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar/editar campo de perfil (Participantes) */}
      {modalCampoPerfilAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-3xl w-full max-w-md px-8 py-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{campoPerfilEditandoId ? "Editar campo" : "Agregar campo"} — {perfilSeleccionadoId}</h3>
            <div className="space-y-3 mb-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nombre del campo</label>
                <input type="text" value={campoPerfilNombre} onChange={(e) => setCampoPerfilNombre(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tipo</label>
                <select value={campoPerfilTipo} onChange={(e) => setCampoPerfilTipo(e.target.value as TipoCampoPerfil)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]">
                  <option value="texto">Texto</option>
                  <option value="numero">Número</option>
                  <option value="opciones">Opciones</option>
                  <option value="fecha">Fecha</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModalCampoPerfilAbierto(false)} className="px-5 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50">Cancelar</button>
              <button type="button" onClick={guardarCampoPerfil} className="px-6 py-2 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md">Guardar</button>
              {campoPerfilEditandoId && (
                <button type="button" onClick={() => eliminarCampoPerfil(campoPerfilEditandoId)} className="px-6 py-2 rounded-full bg-rose-500 text-white text-sm font-semibold shadow-md">Eliminar</button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
