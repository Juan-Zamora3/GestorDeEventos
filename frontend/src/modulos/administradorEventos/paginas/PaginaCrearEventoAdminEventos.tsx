// src/modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos.tsx

import React, { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import type {
  CampoEvento,
  ParticipantesDraft,
} from "../componentes/tiposAdminEventos";
import AsidePasosCrearEvento from "../componentes/creacionEvento/AsidePasosCrearEvento";

// 🔹 Tipos exportados para reutilizar en otras partes (API, secciones)
export type Tiempo = {
  id: string;
  nombre: string;
  inicio: string;
  fin: string;
};

export type AjusteDraft = {
  caracteristicas: Record<string, boolean>;
  envioQR: string;
  costoInscripcion: string;
  tiempos: Tiempo[];
};

export type InfoEventoDraft = {
  nombre: string;
  fechaInicioEvento: string;
  fechaFinEvento: string;
  fechaInicioInscripciones: string;
  fechaFinInscripciones: string;
  descripcion: string;
  // 👇 ESTO FALTABA
  imagenPortadaUrl?: string | null;
};

export type CrearEventoOutletContext = {
  infoEvento: InfoEventoDraft;
  setInfoEvento: Dispatch<SetStateAction<InfoEventoDraft>>;
  ajuste: AjusteDraft;
  setAjuste: Dispatch<SetStateAction<AjusteDraft>>;
  participantes: ParticipantesDraft;
  setParticipantes: Dispatch<SetStateAction<ParticipantesDraft>>;
  onCancel: () => void;
  setSlideDir: (d: "next" | "prev") => void;
};

type NavState = { slideIn?: boolean; plantillaId?: string } | null;

export const PaginaCrearEventoAdminEventos: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const slideIn = Boolean((location.state as NavState)?.slideIn);
  const [exiting, setExiting] = useState(false);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");

  // reservado por si queremos debouncing o cancelar animaciones futuras
  const exitTimer = useRef<number | undefined>(undefined);
  void exitTimer;

  // Determina el paso activo leyendo la URL actual del wizard
  const pasoActual = path.endsWith("/informacion")
    ? 1
    : path.endsWith("/personal")
    ? 2
    : path.endsWith("/integrantes")
    ? 3
    : path.endsWith("/ajuste")
    ? 4
    : 5;

  // 🔹 Estado local de información general del evento
  const [infoEvento, setInfoEvento] = useState<InfoEventoDraft>({
    nombre: "",
    fechaInicioEvento: "",
    fechaFinEvento: "",
    fechaInicioInscripciones: "",
    fechaFinInscripciones: "",
    descripcion: "",
    imagenPortadaUrl: null, // 👈 INICIALIZADO
  });

  // 🔹 Estado local del "ajuste" del evento (características, costos, tiempos)
  const [ajuste, setAjuste] = useState<AjusteDraft>({
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
  const baseInmutables: CampoEvento[] = [
    {
      id: "campo-nombre",
      nombre: "Nombre",
      tipo: "texto",
      immutable: true,
    },
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
        { id: "campo-correo", nombre: "Correo", tipo: "texto" },
        { id: "campo-telefono", nombre: "Telefono", tipo: "texto" },
        {
          id: "campo-institucion",
          nombre: "Institución",
          tipo: "opciones",
        },
      ],
      asesor: [
        ...baseInmutables,
        { id: "campo-correo-asesor", nombre: "Correo", tipo: "texto" },
      ],
      integrante: [
        ...baseInmutables,
        {
          id: "campo-correo-integrante",
          nombre: "Correo",
          tipo: "texto",
        },
        {
          id: "campo-telefono-integrante",
          nombre: "Telefono",
          tipo: "texto",
        },
        {
          id: "campo-institucion-integrante",
          nombre: "Institución",
          tipo: "opciones",
        },
      ],
      lider_equipo: [
        ...baseInmutables,
        { id: "campo-correo-lider", nombre: "Correo", tipo: "texto" },
      ],
    },
  });

  const handleCancel = () => {
    if (exiting) return;
    setExiting(true);
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
        className="h-[99%]  w-[99%] mx-auto bg-white rounded-[32px] shadow-2xl flex overflow-hidden"
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
