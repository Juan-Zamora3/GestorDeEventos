// src/modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos.tsx
import React, { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import AsidePasosCrearEvento from "../componentes/creacionEvento/AsidePasosCrearEvento";

// 🔹 API central
import {
  type Tiempo,
  type AjusteConfig,
  type ParticipantesDraft,
  type ConfigEvento,
  crearEventoDesdeWizard,
  guardarPlantillaEvento,
  obtenerCoverPorTipo,
} from "../../../api/eventosAdminEventosApi";

// 🔹 Tipos exportados para otros componentes del wizard
export type InfoEventoDraft = {
  nombre: string;
  fechaInicioEvento: string;
  fechaFinEvento: string;
  fechaInicioInscripciones: string;
  fechaFinInscripciones: string;
  descripcion: string;
  imagenPortadaUrl?: string | null;
};

export type CrearEventoOutletContext = {
  infoEvento: InfoEventoDraft;
  setInfoEvento: Dispatch<SetStateAction<InfoEventoDraft>>;
  ajuste: AjusteConfig;
  setAjuste: Dispatch<SetStateAction<AjusteConfig>>;
  participantes: ParticipantesDraft;
  setParticipantes: Dispatch<SetStateAction<ParticipantesDraft>>;

  onCancel: () => void;
  setSlideDir: (d: "next" | "prev") => void;

  onFinalizar: () => Promise<void>;
  onGuardarPlantilla: () => Promise<void>;
};

type NavState = {
  slideIn?: boolean;
  plantillaId?: string;
  plantillaConfig?: Partial<ConfigEvento> | null;
} | null;

export const PaginaCrearEventoAdminEventos: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const slideIn = Boolean((location.state as NavState)?.slideIn);
  const [exiting, setExiting] = useState(false);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");
  const [procesando, setProcesando] = useState(false);
  const plantillaAplicadaRef = useRef(false);

  const exitTimer = useRef<number | undefined>(undefined);
  void exitTimer;

  const pasoActual = path.endsWith("/informacion")
    ? 1
    : path.endsWith("/personal")
    ? 2
    : path.endsWith("/integrantes")
    ? 3
    : path.endsWith("/ajuste")
    ? 4
    : 5;

  // 🔹 Estado de información general del evento
  const [infoEvento, setInfoEvento] = useState<InfoEventoDraft>({
    nombre: "",
    fechaInicioEvento: "",
    fechaFinEvento: "",
    fechaInicioInscripciones: "",
    fechaFinInscripciones: "",
    descripcion: "",
    imagenPortadaUrl: null,
  });

  // 🔹 Estado del "ajuste" del evento (características, costos, tiempos)
  const [ajuste, setAjuste] = useState<AjusteConfig>({
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

  // 🔹 Estado del diseño de participantes / equipos
  const baseInmutables = [
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
  ];

  const [participantes, setParticipantes] = useState<ParticipantesDraft>({
    modo: "individual",
    maxParticipantes: "",
    maxEquipos: "",
    minIntegrantes: "1",
    maxIntegrantes: "5",
    seleccion: { asesor: false, lider_equipo: false },
    camposPorPerfil: {
      participante: [
        ...baseInmutables,
        { id: "campo-correo", nombre: "Correo", tipo: "email" },
        { id: "campo-telefono", nombre: "Telefono", tipo: "telefono" },
        {
          id: "campo-institucion",
          nombre: "Institución",
          tipo: "opciones",
        },
      ],
      asesor: [
        ...baseInmutables,
        { id: "campo-correo-asesor", nombre: "Correo", tipo: "email" },
      ],
      integrante: [
        ...baseInmutables,
        {
          id: "campo-correo-integrante",
          nombre: "Correo",
          tipo: "email",
        },
        {
          id: "campo-telefono-integrante",
          nombre: "Telefono",
          tipo: "telefono",
        },
        {
          id: "campo-institucion-integrante",
          nombre: "Institución",
          tipo: "opciones",
        },
      ],
      lider_equipo: [
        ...baseInmutables,
        { id: "campo-correo-lider", nombre: "Correo", tipo: "email" },
      ],
    },
  });

  const handleCancel = () => {
    if (exiting) return;
    setExiting(true);
  };

  /**
   * Si venimos desde la galería de plantillas aplicamos la config al wizard
   * (solo una vez en el primer render para no sobrescribir cambios del usuario).
   */
  useEffect(() => {
    if (plantillaAplicadaRef.current) return;

    const state = location.state as NavState;
    const plantillaConfig = state?.plantillaConfig;

    if (plantillaConfig?.infoEvento) setInfoEvento((prev) => ({
      ...prev,
      ...plantillaConfig.infoEvento,
    }));
    if (plantillaConfig?.ajuste) setAjuste(plantillaConfig.ajuste);
    if (plantillaConfig?.participantes)
      setParticipantes(plantillaConfig.participantes);

    if (plantillaConfig) plantillaAplicadaRef.current = true;
  }, [location.state]);

  /** Obtiene la config completa actual del wizard */
  const obtenerConfigActual = (): ConfigEvento => ({
    infoEvento: {
      ...infoEvento,
    },
    ajuste,
    participantes,
  });

  /**
   * FINALIZAR WIZARD: CREA EL EVENTO EN FIRESTORE + AUDITORÍA
   */
  const handleFinalizar = async () => {
    if (procesando) return;
    try {
      setProcesando(true);
      const cfg = obtenerConfigActual();

      // Validación sencilla
      if (!cfg.infoEvento.nombre.trim()) {
        alert("El nombre del evento es obligatorio.");
        setProcesando(false);
        return;
      }

      const eventoId = await crearEventoDesdeWizard(cfg, {
        plantillaBaseId: (location.state as NavState)?.plantillaId ?? null,
        actor: {
          // TODO: reemplazar por tu usuario logueado real
          uid: "demo-admin-eventos",
          nombre: "Admin de eventos",
          correo: "admin@ejemplo.com",
        },
      });

      // Redirige al desglose del evento recién creado
      navigate(`/admin-eventos/evento/${eventoId}`, {
        replace: true,
      });
    } catch (err) {
      console.error("[Wizard] Error al finalizar evento:", err);
      alert("Ocurrió un error al crear el evento. Revisa la consola.");
    } finally {
      setProcesando(false);
    }
  };

  /**
   * GUARDAR COMO PLANTILLA
   * Solo guarda config, no nombre ni descripción del evento.
   */
  const handleGuardarPlantilla = async () => {
    if (procesando) return;
    try {
      const cfg = obtenerConfigActual();

      const nombrePlantilla = window.prompt(
        "Nombre para la plantilla de evento:",
        cfg.infoEvento.nombre || "Plantilla sin nombre",
      );
      if (!nombrePlantilla) return;

      const tipo = (window.prompt(
        'Tipo de plantilla (concurso, foro, curso, robotica, otro):',
        "concurso",
      ) || "otro") as any;

      const coverSugerido = obtenerCoverPorTipo(tipo as any);
      const coverPersonalizado = window.prompt(
        "URL de imagen de portada para la plantilla (opcional):",
        coverSugerido,
      );

      const coverElegido = coverPersonalizado?.trim()
        ? coverPersonalizado.trim()
        : coverSugerido;

      await guardarPlantillaEvento(
        {
          nombrePlantilla,
          tipo: (tipo as any) || "otro",
          coverUrl: coverElegido,
        },
        cfg,
        {
          uid: "demo-admin-eventos",
          nombre: "Admin de eventos",
          correo: "admin@ejemplo.com",
        },
      );

      alert("Plantilla guardada correctamente.");
    } catch (err) {
      console.error("[Wizard] Error al guardar plantilla:", err);
      alert("Ocurrió un error al guardar la plantilla.");
    }
  };

  return (
    <motion.div
      className="h-full bg-gradient-to-b from-[#192D69] to-[#6581D6] px-1 md:px-1 py-1 md:py-1 overflow-hidden"
      initial={slideIn ? { x: -60, opacity: 0, scale: 0.98 } : {}}
      animate={
        exiting
          ? { x: 80, opacity: 0, scale: 0.98 }
          : { x: 0, opacity: 1, scale: 1 }
      }
      transition={{ duration: 0.6, ease: [0.22, 1, 0.28, 1] }}
      onAnimationComplete={() => {
        if (exiting) {
          navigate("/admin-eventos/lista", {
            state: { animateUp: true },
          });
        }
      }}
    >
      <motion.div
        className="h-[99%] w-[99%] mx-auto bg-white rounded-[32px] shadow-2xl flex overflow-hidden"
        initial={slideIn ? { x: -30, opacity: 0 } : {}}
        animate={exiting ? { x: 40, opacity: 0.02 } : { x: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 190,
          damping: 20,
          mass: 0.6,
        }}
      >
        <AsidePasosCrearEvento
          pasoActual={pasoActual}
          onCancel={handleCancel}
        />

        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={pasoActual}
              initial={{
                x: slideDir === "next" ? -40 : 40,
                opacity: 0,
              }}
              animate={{ x: 0, opacity: 1 }}
              exit={{
                x: slideDir === "next" ? 40 : -40,
                opacity: 0,
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.28, 1],
              }}
              className="h-full"
            >
              <Outlet
                context={
                  {
                    infoEvento,
                    setInfoEvento,
                    ajuste,
                    setAjuste,
                    participantes,
                    setParticipantes,
                    onCancel: handleCancel,
                    setSlideDir,
                    onFinalizar: handleFinalizar,
                    onGuardarPlantilla: handleGuardarPlantilla,
                  } as CrearEventoOutletContext
                }
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaginaCrearEventoAdminEventos;
