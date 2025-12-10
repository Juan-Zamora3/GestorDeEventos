// src/modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos.tsx
import React, { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig"; // Ajusta la ruta si es necesario

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

type TipoCampo =
  | "texto_corto"
  | "email"
  | "telefono"
  | "seleccion_multiple";

interface CampoFormulario {
  id: string;
  nombreCampo: string;
  tipoCampo: TipoCampo;
  ejemplo: string;
  obligatorio: boolean;
  bloqueado?: boolean;
}

export const PaginaCrearEventoAdminEventos: React.FC = () => {
  // ---------------- ESTADO GENERAL DEL WIZARD ----------------
  const [paso, setPaso] = useState<Paso>(1);

  // ----- Paso 1: Información del evento -----
  const [nombreEvento, setNombreEvento] = useState("");
  const [fechaInicioEvento, setFechaInicioEvento] = useState("");
  const [fechaFinEvento, setFechaFinEvento] = useState("");
  const [fechaInicioInscripciones, setFechaInicioInscripciones] =
    useState("");
  const [fechaFinInscripciones, setFechaFinInscripciones] =
    useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fotoNombre, setFotoNombre] = useState<string | null>(null);

  // ----- Paso 2: Personal / Staff -----
  const [rolesPersonal, setRolesPersonal] = useState<RolPersonal[]>([
    {
      id: "coordinadores",
      nombre: "Coordinadores",
      descripcion:
        "Organizan, planifican y supervisan actividades del evento.",
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
      descripcion:
        "Participan de manera especial en el evento.",
      activo: false,
    },
  ]);

  const [rolSeleccionadoId, setRolSeleccionadoId] =
    useState<string>("coordinadores");

  // Modales de personal
  const [modalNuevoRolAbierto, setModalNuevoRolAbierto] =
    useState(false);
  const [nuevoRolNombre, setNuevoRolNombre] = useState("");
  const [nuevoRolDescripcion, setNuevoRolDescripcion] =
    useState("");

  // ----- Paso 3: Integrantes / Participantes -----
  const [modalidadRegistro, setModalidadRegistro] =
    useState<ModalidadRegistro>("individual");
  const [maxParticipantes, setMaxParticipantes] =
    useState<string>("");

  const [categorias, setCategorias] = useState<CategoriaEvento[]>([]);
  const [modalNuevaCategoriaAbierto, setModalNuevaCategoriaAbierto] =
    useState(false);
  const [categoriaNombre, setCategoriaNombre] = useState("");
  const [categoriaCupo, setCategoriaCupo] = useState("");

  // ----- Paso 4: Ajustes del evento -----
  const [tomarAsistenciaQR, setTomarAsistenciaQR] = useState(true);
  const [tomarAsistenciaTiempos, setTomarAsistenciaTiempos] =
    useState(false);
  const [confirmacionPago, setConfirmacionPago] = useState(false);
  const [envioPorCorreo, setEnvioPorCorreo] = useState(true);
  const [medioEnvioQR, setMedioEnvioQR] = useState("Correo");
  const [costoInscripcion, setCostoInscripcion] = useState("0");

  // Podrías extender a una lista de tiempos de entrada/salida
  const [tiempos, setTiempos] = useState<
    { id: string; etiqueta: string }[]
  >([]);

  // ----- Paso 5: Formulario -----
  const [camposFormulario, setCamposFormulario] =
    useState<CampoFormulario[]>([
      {
        id: "nombre",
        nombreCampo: "Nombre",
        tipoCampo: "texto_corto",
        ejemplo: "sección de registro",
        obligatorio: true,
        bloqueado: true,
      },
      {
        id: "ap_paterno",
        nombreCampo: "Apellido paterno",
        tipoCampo: "texto_corto",
        ejemplo: "sección de registro",
        obligatorio: true,
        bloqueado: true,
      },
      {
        id: "ap_materno",
        nombreCampo: "Apellido materno",
        tipoCampo: "texto_corto",
        ejemplo: "sección de registro",
        obligatorio: true,
        bloqueado: true,
      },
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
    ]);

  const [modalCampoAbierto, setModalCampoAbierto] = useState(false);
  const [campoEditandoId, setCampoEditandoId] = useState<
    string | null
  >(null);
  const [campoNombre, setCampoNombre] = useState("");
  const [campoTipo, setCampoTipo] =
    useState<TipoCampo>("texto_corto");
  const [campoEjemplo, setCampoEjemplo] = useState("");
  const [campoObligatorio, setCampoObligatorio] = useState(true);

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

  // ----------------- NAVIGACIÓN -----------------
  const irSiguiente = async () => {
    if (paso < 5) {
      setPaso((p) => (p + 1) as Paso);
      return;
    }
    await guardarEventoEnFirestore();
  };

  const irAnterior = () => {
    if (paso > 1) {
      setPaso((p) => (p - 1) as Paso);
    }
  };

  // ----------------- GUARDAR EN FIRESTORE -----------------
  const guardarEventoEnFirestore = async () => {
    try {
      const payload = {
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
          maxParticipantes: maxParticipantes
            ? Number(maxParticipantes)
            : null,
          categorias,
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
        meta: {
          creadoEn: serverTimestamp(),
        },
      };

      await addDoc(collection(db, "eventos"), payload);
      alert("Evento creado correctamente en Firestore.");
      // Aquí podrías redirigir al listado de eventos
      // navigate("/admin/eventos");
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      alert("Ocurrió un error al guardar el evento.");
    }
  };

  // ----------------- HANDLERS DE MODALES -----------------
  const abrirModalNuevoRol = () => {
    setNuevoRolNombre("");
    setNuevoRolDescripcion("");
    setModalNuevoRolAbierto(true);
  };

  const guardarNuevoRol = () => {
    if (!nuevoRolNombre.trim()) return;
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
    setRolSeleccionadoId(id);
    setModalNuevoRolAbierto(false);
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

  const abrirModalCampoEditar = (campo: CampoFormulario) => {
    if (campo.bloqueado) return; // los bloqueados no se editan
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
      // actualizar
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
      // nuevo
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
    setCamposFormulario((prev) =>
      prev.filter((c) => c.id !== id)
    );
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

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Fecha de inicio de Inscripciones
            <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={fechaInicioInscripciones}
            onChange={(e) =>
              setFechaInicioInscripciones(e.target.value)
            }
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
            onChange={(e) =>
              setFechaFinInscripciones(e.target.value)
            }
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

        {/* Grid de roles */}
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
                        r.id === rol.id
                          ? { ...r, activo: !r.activo }
                          : r
                      )
                    );
                  }}
                  className={`w-10 h-5 rounded-full flex items-center px-0.5 transition ${
                    activo
                      ? "bg-[#5B4AE5]"
                      : "bg-slate-300"
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

        {/* Campos necesarios */}
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-2">
            Campos necesarios
          </p>
          <p className="text-[11px] text-slate-500 mb-2">
            Los campos predeterminados (Nombre, Apellido paterno,
            Apellido materno, Correo, Institución) se usan para el
            staff y no se pueden eliminar.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Nombre", "Apellido paterno", "Apellido materno", "Correo", "Institución"].map(
              (campo) => (
                <span
                  key={campo}
                  className="px-3 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700"
                >
                  {campo}
                </span>
              )
            )}
          </div>
        </div>

        {/* Detalle del rol seleccionado (solo lectura) */}
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

      {/* Modalidad */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-700 mb-2">
          Modalidad
        </p>
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
          <button
            type="button"
            className={`px-4 py-2 rounded-full font-medium ${
              modalidadRegistro === "individual"
                ? "bg-white text-[#5B4AE5] shadow-sm"
                : "text-slate-500"
            }`}
            onClick={() => setModalidadRegistro("individual")}
          >
            Individual
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-full font-medium ${
              modalidadRegistro === "equipos"
                ? "bg-white text-[#5B4AE5] shadow-sm"
                : "text-slate-500"
            }`}
            onClick={() => setModalidadRegistro("equipos")}
          >
            Por equipos
          </button>
        </div>
      </div>

      {/* Cantidad máxima */}
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

      {/* Categorías */}
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
            +
            <span className="ml-1">Agregar categoría</span>
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
                {/* Si quieres, podrías agregar botón para eliminar/editar */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campos necesarios (participante) */}
      <div>
        <p className="text-xs font-semibold text-slate-700 mb-2">
          Campos necesarios para participantes
        </p>
        <p className="text-[11px] text-slate-500 mb-2">
          Estos campos se convierten en variables y parte del
          formulario de inscripción.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Nombre",
            "Apellido paterno",
            "Apellido materno",
            "Correo",
            "Telefono",
            "Institución",
          ].map((campo) => (
            <span
              key={campo}
              className="px-3 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700"
            >
              {campo}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  const renderPaso4 = () => (
    <>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Características del evento
      </h1>

      {/* Selección de características */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {/* Asistencia por QR */}
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
                tomarAsistenciaQR
                  ? "bg-[#5B4AE5]"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`h-3 w-3 bg-white rounded-full shadow transform transition ${
                  tomarAsistenciaQR
                    ? "translate-x-4"
                    : "translate-x-0"
                }`}
              />
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Registrar asistencia con código QR.
          </p>
        </button>

        {/* Confirmación de pago */}
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
                confirmacionPago
                  ? "bg-[#5B4AE5]"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`h-3 w-3 bg-white rounded-full shadow transform transition ${
                  confirmacionPago
                    ? "translate-x-4"
                    : "translate-x-0"
                }`}
              />
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Confirmar pagos de participación/entrada.
          </p>
        </button>

        {/* Envío por correo */}
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
                envioPorCorreo
                  ? "bg-[#5B4AE5]"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`h-3 w-3 bg-white rounded-full shadow transform transition ${
                  envioPorCorreo
                    ? "translate-x-4"
                    : "translate-x-0"
                }`}
              />
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Enviar constancias por correo.
          </p>
        </button>
      </div>

      {/* Envío de QR y costo */}
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

      {/* Tiempos (placeholder simple) */}
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
            +
            <span className="ml-1">Añadir tiempo</span>
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

      <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">
                Nombre del Campo
              </th>
              <th className="text-left px-4 py-2 font-semibold">
                Tipo de Campo
              </th>
              <th className="text-left px-4 py-2 font-semibold">
                Texto de ejemplo
              </th>
              <th className="text-left px-4 py-2 font-semibold">
                Obligatorio
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {camposFormulario.map((campo) => (
              <tr
                key={campo.id}
                className="border-t border-slate-100 hover:bg-slate-50/70"
              >
                <td className="px-4 py-2">
                  {campo.nombreCampo}
                  {campo.bloqueado && (
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      Bloqueado
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {campo.tipoCampo === "texto_corto" && "Texto corto"}
                  {campo.tipoCampo === "email" && "Email"}
                  {campo.tipoCampo === "telefono" && "Teléfono"}
                  {campo.tipoCampo === "seleccion_multiple" &&
                    "Selección múltiple"}
                </td>
                <td className="px-4 py-2">{campo.ejemplo}</td>
                <td className="px-4 py-2">
                  {campo.obligatorio ? "Sí" : "No"}
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  {!campo.bloqueado && (
                    <>
                      <button
                        type="button"
                        onClick={() => abrirModalCampoEditar(campo)}
                        className="text-[#5B4AE5] hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarCampoFormulario(campo.id)}
                        className="text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  // ----------------- RENDER PRINCIPAL -----------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#192D69] to-[#6581D6] flex justify-center items-center py-10">
      <div className="w-[95%] max-w-[1240px] min-h-[560px] bg-white rounded-[32px] shadow-2xl flex overflow-hidden">
        {/* Sidebar de pasos */}
        <aside className="w-80 bg-[#F4F2FF] px-10 py-10 flex flex-col border-r border-[#E0DDFB]">
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
                          completado
                            ? "bg-[#5B4AE5]"
                            : "bg-[#D4D0F7]"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.15em] ${
                        activo
                          ? "text-[#5B4AE5]"
                          : "text-slate-600"
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

          {/* Botón Cancelar */}
          <button
            type="button"
            className="mt-auto w-full rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white font-semibold py-3 text-sm shadow-md"
            onClick={() => {
              // Aquí puedes hacer navigate al listado de eventos o dashboard
              window.history.back();
            }}
          >
            Cancelar
          </button>
        </aside>

        {/* Contenido principal */}
        <section className="flex-1 px-10 py-10 flex flex-col">
          <div className="flex-1">
            {paso === 1 && renderPaso1()}
            {paso === 2 && renderPaso2()}
            {paso === 3 && renderPaso3()}
            {paso === 4 && renderPaso4()}
            {paso === 5 && renderPaso5()}
          </div>

          {/* Footer de pasos */}
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
              {paso > 1 && (
                <button
                  type="button"
                  onClick={irAnterior}
                  className="px-6 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50"
                >
                  Volver
                </button>
              )}
              <button
                type="button"
                onClick={irSiguiente}
                className="px-8 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md"
              >
                {paso === 5 ? "Finalizar" : "Siguiente"}
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
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Agregar personal nuevo
            </h3>
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
                Agregar
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
                    campoObligatorio
                      ? "bg-[#5B4AE5]"
                      : "bg-slate-300"
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
    </div>
  );
};
