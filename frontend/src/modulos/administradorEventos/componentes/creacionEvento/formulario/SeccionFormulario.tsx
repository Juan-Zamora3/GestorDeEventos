import type { FC } from "react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FiMoreVertical, FiPlus } from "react-icons/fi";

import FooterAdminEventos from "../../comunes/FooterAdminEventos";
import ModalPreguntaFormulario from "./ModalPreguntaFormulario";
import type { CampoEvento } from "../../tiposAdminEventos";
import type { CrearEventoOutletContext } from "../../../paginas/PaginaCrearEventoAdminEventos";
import { crearEventoConConfiguracion } from "../../../../../api/adminEventosApi";

import type {
  TipoCampo,
  PreguntaForm,
} from "./ModalPreguntaFormulario";

const genId = () => `preg-${Math.random().toString(36).slice(2, 8)}`;

const BASE_PREGUNTAS: PreguntaForm[] = [
  {
    id: "preg-nombre",
    nombre: "Nombre Completo",
    tipo: "texto_corto",
    placeholder: "ej. Jose",
    obligatorio: true,
  },
  {
    id: "preg-ap-paterno",
    nombre: "Apellido Paterno",
    tipo: "texto_corto",
    placeholder: "ej. Rodríguez",
    obligatorio: true,
  },
  {
    id: "preg-ap-materno",
    nombre: "Apellido Materno",
    tipo: "texto_corto",
    placeholder: "ej. Martínez",
    obligatorio: false,
  },
  {
    id: "preg-correo",
    nombre: "Correo",
    tipo: "email",
    placeholder: "ej. correo@email.com",
    obligatorio: true,
  },
  {
    id: "preg-celular",
    nombre: "Celular",
    tipo: "telefono",
    placeholder: "ej. 6371004000",
    obligatorio: false,
  },
  {
    id: "preg-institucion",
    nombre: "Institución",
    tipo: "seleccion_multiple",
    placeholder: "Selecciona tu instituto",
    obligatorio: false,
    config: { opciones: ["TecNM", "UANL", "UNAM"] },
  },
  {
    id: "preg-escolaridad",
    nombre: "Escolaridad",
    tipo: "seleccion_multiple",
    placeholder: "Selecciona tu escolaridad",
    obligatorio: false,
    config: { opciones: ["TSU", "Licenciatura", "Maestría"] },
  },
];

const labelTipo = (t: TipoCampo) => {
  switch (t) {
    case "texto_corto":
      return "Texto corto";
    case "texto_largo":
      return "Texto largo";
    case "email":
      return "Email";
    case "telefono":
      return "Teléfono";
    case "seleccion_simple":
      return "Selección simple";
    case "seleccion_multiple":
      return "Selección múltiple";
    case "numero":
      return "Número";
    case "fecha":
      return "Fecha";
  }
};

const SeccionFormulario: FC = () => {
  const navigate = useNavigate();

  const { participantes, ajuste, infoEvento, setSlideDir } =
    useOutletContext<CrearEventoOutletContext>();

  const modo = participantes.modo;

  const [preguntas, setPreguntas] = useState<PreguntaForm[]>(() => [
    ...BASE_PREGUNTAS,
  ]);
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | undefined>(
    undefined,
  );
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modalModo, setModalModo] = useState<"crear" | "editar">(
    "crear",
  );
  const [preguntaEditando, setPreguntaEditando] = useState<
    PreguntaForm | undefined
  >(undefined);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abrirCrear = () => {
    setModalModo("crear");
    setPreguntaEditando(undefined);
    setModalAbierto(true);
  };

  const abrirEditar = (p: PreguntaForm) => {
    setModalModo("editar");
    setPreguntaEditando(p);
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const manejarGuardar = (data: PreguntaForm) => {
    setPreguntas((prev) => {
      if (modalModo === "crear") {
        return [...prev, { ...data, id: genId() }];
      }
      if (modalModo === "editar" && preguntaEditando) {
        return prev.map((p) =>
          p.id === preguntaEditando.id
            ? { ...p, ...data, id: preguntaEditando.id }
            : p,
        );
      }
      return prev;
    });
    setModalAbierto(false);
  };

  const manejarEliminar = (id: string) => {
    setPreguntas((prev) => prev.filter((p) => p.id !== id));
    setModalAbierto(false);
  };

  const mapCampoToPregunta = (c: CampoEvento): PreguntaForm => {
    const nombre = c.nombre;
    const tipo: TipoCampo =
      c.tipo === "numero"
        ? "numero"
        : c.tipo === "fecha"
        ? "fecha"
        : c.tipo === "opciones"
        ? "seleccion_multiple"
        : nombre.toLowerCase().includes("correo")
        ? "email"
        : nombre.toLowerCase().includes("telefono")
        ? "telefono"
        : "texto_corto";

    return {
      id: `auto-${c.id}`,
      nombre,
      tipo,
      placeholder: "sección de registro",
      obligatorio: true,
      config: undefined,
    };
  };

  const preguntasConReglas = () => {
    const auto: (PreguntaForm & {
      source?: "manual" | "participantes";
      locked?: boolean;
      tipoLabel?: string;
    })[] = [];
    const autoNames = new Set<string>();

    if (modo === "individual") {
      (participantes.camposPorPerfil["participante"] ?? []).forEach(
        (c) => {
          const p = mapCampoToPregunta(c);
          auto.push({
            ...p,
            source: "participantes",
            locked: true,
          });
          autoNames.add(p.nombre);
        },
      );

      if (participantes.seleccion.asesor) {
        auto.push({
          id: "auto-asesor",
          nombre: "Asesor",
          tipo: "texto_corto",
          tipoLabel: "Asesor",
          placeholder: "sección de registro",
          obligatorio: true,
          source: "participantes",
          locked: true,
        });
        autoNames.add("Asesor");
      }
    } else {
      auto.push({
        id: "auto-equipo-nombre",
        nombre: "Nombre del Equipo",
        tipo: "texto_corto",
        tipoLabel: "Equipo",
        placeholder: "ej. Astros",
        obligatorio: true,
        source: "participantes",
        locked: true,
      });

      if (participantes.seleccion.lider_equipo) {
        auto.push({
          id: "auto-lider",
          nombre: "Líder de Equipo",
          tipo: "texto_corto",
          tipoLabel: "Líder de Equipo",
          placeholder: "sección de registro",
          obligatorio: true,
          source: "participantes",
          locked: true,
        });
        autoNames.add("Líder de Equipo");
      }

      if (participantes.seleccion.asesor) {
        auto.push({
          id: "auto-asesor",
          nombre: "Asesor",
          tipo: "texto_corto",
          tipoLabel: "Asesor",
          placeholder: "sección de registro",
          obligatorio: true,
          source: "participantes",
          locked: true,
        });
        autoNames.add("Asesor");
      }

      const max = parseInt(participantes.maxIntegrantes || "0", 10);
      const min = parseInt(participantes.minIntegrantes || "0", 10);

      for (let i = 1; i <= max; i++) {
        auto.push({
          id: `auto-int-${i}`,
          nombre: `Integrante ${i}`,
          tipo: "texto_corto",
          tipoLabel: "Integrante",
          placeholder: "sección de registro",
          obligatorio: i <= min,
          source: "participantes",
          locked: true,
        });
      }
    }

    const manual = preguntas.filter((p) => !autoNames.has(p.nombre));

    return [...auto, ...manual];
  };

  const handleFinalizar = async () => {
    if (guardando) return;

    try {
      setGuardando(true);
      setError(null);

      // Validaciones básicas antes de pegarle al API
      if (!infoEvento.nombre.trim()) {
        setError("El nombre del evento es obligatorio.");
        setGuardando(false);
        return;
      }

      if (
        !infoEvento.fechaInicioEvento ||
        !infoEvento.fechaFinEvento
      ) {
        setError("Debes definir las fechas de inicio y fin del evento.");
        setGuardando(false);
        return;
      }

      if (
        !infoEvento.fechaInicioInscripciones ||
        !infoEvento.fechaFinInscripciones
      ) {
        setError("Debes definir el rango de inscripciones.");
        setGuardando(false);
        return;
      }

      const todasPreguntas = preguntasConReglas();

      if (todasPreguntas.length === 0) {
        setError("El formulario debe tener al menos una pregunta.");
        setGuardando(false);
        return;
      }

      const preguntasPayload = todasPreguntas.map((p) => ({
        nombre: p.nombre,
        tipo: p.tipo,
        placeholder: p.placeholder ?? "",
        obligatorio: p.obligatorio ?? false,
        opciones: p.config?.opciones ?? [],
        source:
          (p as any).source ??
          ((p as any).locked ? "participantes" : "manual"),
      }));

      await crearEventoConConfiguracion({
        infoEvento,
        ajuste,
        participantes,
        preguntas: preguntasPayload,
      });

      setSlideDir("next");
      navigate("/admin-eventos/lista", {
        replace: true,
        state: { animateUp: true, created: true },
      });
    } catch (err: unknown) {
      console.error("[SeccionFormulario] Error al crear evento", err);
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError(
          "Ocurrió un error al guardar el evento. Revisa los datos o intenta de nuevo.",
        );
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="flex-1 h-full min-h-0 flex flex-col">
      <div className="px-10 pt-10 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Formulario
        </h1>
        <button
          type="button"
          onClick={abrirCrear}
          className="h-9 w-9 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white shadow-md flex items-center justify-center"
        >
          <FiPlus />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-10 pb-6">
        {error && (
          <div className="mb-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="mb-3 rounded-xl bg-[#F7F7FF] border border-[#E0DDFB] px-4 py-3">
          <p className="text-[11px] text-slate-600">
            El modo de registro (
            <span className="font-semibold">
              {modo === "individual" ? "Individual" : "Equipos"}
            </span>
            ) y los campos obligatorios vienen de la sección
            Participantes. No es editable aquí.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E0DDFB] bg-white p-0 overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="text-xs font-semibold text-slate-700">
              Nuevo Campo
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="px-4 py-2">Nombre del Campo</th>
                  <th className="px-4 py-2">Tipo de Campo</th>
                  <th className="px-4 py-2">Texto de ejemplo</th>
                  <th className="px-4 py-2">Obligatorio</th>
                  <th className="px-4 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {preguntasConReglas().map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-2 text-slate-800">
                      {p.nombre}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {(p as any).tipoLabel ?? labelTipo(p.tipo)}
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {p.placeholder ?? ""}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {p.obligatorio ? "Sí" : "No"}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {(p as any).locked ? (
                        <span className="inline-block px-2 py-1 rounded-full text-[10px] bg-[#F2F3FB] text-slate-500">
                          Bloqueado
                        </span>
                      ) : (
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setMenuAbiertoId(
                                menuAbiertoId === p.id
                                  ? undefined
                                  : p.id,
                              )
                            }
                            className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
                          >
                            <FiMoreVertical />
                          </button>
                          {menuAbiertoId === p.id && (
                            <div className="absolute right-0 mt-2 w-28 bg-white border border-slate-200 rounded-xl shadow-md text-xs z-10">
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuAbiertoId(undefined);
                                  abrirEditar(p);
                                }}
                                className="block w-full text-left px-3 py-2 hover:bg-slate-50"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuAbiertoId(undefined);
                                  manejarEliminar(p.id);
                                }}
                                className="block w-full text-left px-3 py-2 hover:bg-slate-50"
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <FooterAdminEventos
        onBack={() => {
          setSlideDir("prev");
          navigate("../ajuste");
        }}
        onNext={handleFinalizar}
        step={{ current: 5, total: 5 }}
        nextLabel={guardando ? "Guardando..." : "Finalizar"}
      />

      <ModalPreguntaFormulario
        abierto={modalAbierto}
        modo={modalModo}
        pregunta={preguntaEditando}
        onGuardar={manejarGuardar}
        onEliminar={manejarEliminar}
        onCerrar={cerrarModal}
      />
    </section>
  );
};

export default SeccionFormulario;
