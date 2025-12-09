// src/modulos/administradorEventos/componentes/creacionEvento/SeccionAjusteEvento.tsx
import type { FC } from "react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FiClock } from "react-icons/fi";

import FooterAdminEventos from "../../comunes/FooterAdminEventos";
import ModalTiempoEvento from "./ModalTiempoEvento";
import type {
  AjusteDraft,
  Tiempo,
  CrearEventoOutletContext,
} from "../../../paginas/PaginaCrearEventoAdminEventos";

const SeccionAjusteEvento: FC = () => {
  const navigate = useNavigate();

  const { ajuste, setAjuste, setSlideDir } =
    useOutletContext<CrearEventoOutletContext>();

  const caracteristicas = ajuste.caracteristicas;

  // 🔄 Toggle de características, con lógica extra para asistencia_tiempos
  const toggleCar = (id: keyof AjusteDraft["caracteristicas"]) =>
    setAjuste((prev) => {
      const nuevoValor = !prev.caracteristicas[id];
      const nuevasCar = {
        ...prev.caracteristicas,
        [id]: nuevoValor,
      };

      // Si desactivas asistencia_tiempos, limpiamos la lista de tiempos
      if (id === "asistencia_tiempos" && !nuevoValor) {
        return {
          ...prev,
          caracteristicas: nuevasCar,
          tiempos: [],
        };
      }

      return {
        ...prev,
        caracteristicas: nuevasCar,
      };
    });

  const [modalTiempoAbierto, setModalTiempoAbierto] = useState(false);
  const [modalTiempoModo, setModalTiempoModo] =
    useState<"crear" | "editar">("crear");
  const [tiempoEditando, setTiempoEditando] = useState<Tiempo | undefined>(
    undefined,
  );

  const genId = () => `tiempo-${Math.random().toString(36).slice(2, 8)}`;

  const abrirCrearTiempo = () => {
    setModalTiempoModo("crear");
    setTiempoEditando(undefined);
    setModalTiempoAbierto(true);
  };

  const abrirEditarTiempo = (t: Tiempo) => {
    setModalTiempoModo("editar");
    setTiempoEditando(t);
    setModalTiempoAbierto(true);
  };

  const cerrarModalTiempo = () => setModalTiempoAbierto(false);

  const manejarGuardarTiempo = (data: {
    id?: string;
    nombre: string;
    inicio: string;
    fin: string;
  }) => {
    setAjuste((prev) => {
      const lista = prev.tiempos;

      if (modalTiempoModo === "crear") {
        return {
          ...prev,
          tiempos: [
            ...lista,
            {
              id: genId(),
              nombre: data.nombre,
              inicio: data.inicio,
              fin: data.fin,
            },
          ],
        };
      }

      if (modalTiempoModo === "editar" && tiempoEditando) {
        return {
          ...prev,
          tiempos: lista.map((t) =>
            t.id === tiempoEditando.id
              ? {
                  ...t,
                  nombre: data.nombre,
                  inicio: data.inicio,
                  fin: data.fin,
                }
              : t,
          ),
        };
      }

      return prev;
    });

    setModalTiempoAbierto(false);
  };

  const manejarEliminarTiempo = (id: string) => {
    setAjuste((prev) => ({
      ...prev,
      tiempos: prev.tiempos.filter((t) => t.id !== id),
    }));
    setModalTiempoAbierto(false);
    setTiempoEditando(undefined);
  };

  return (
    <section className="flex-1 h-full min-h-0 flex flex-col">
      <div className="px-10 pt-10">
        <h1 className="text-2xl font-semibold text-slate-900">
          Características del evento
        </h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-10 pb-6">
        {/* Características */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-700 mb-2">
            Selección
          </p>
          <div className="mb-3 rounded-xl bg-[#F7F7FF] border border-[#E0DDFB] px-4 py-3">
            <p className="text-[11px] text-slate-600">
              Activa las características que aplican a tu evento.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E0DDFB] bg-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "asistencia_qr",
                  titulo: "Tomar asistencia por QR",
                  desc: "Registrar asistencia con código QR.",
                },
                {
                  id: "confirmacion_pago",
                  titulo: "Confirmación de pago",
                  desc: "Confirmar pagos de participación/entrada.",
                },
                {
                  id: "envio_correo",
                  titulo: "Envio por correo",
                  desc: "Enviar constancias por correo.",
                },
                {
                  id: "asistencia_tiempos",
                  titulo: "Tomar asistencia en tiempos",
                  desc: "Gestionar tiempos de entrada/salida.",
                },
              ].map((opt) => {
                const key =
                  opt.id as keyof AjusteDraft["caracteristicas"];
                const activo = !!caracteristicas[key];

                return (
                  <div
                    key={opt.id}
                    className={`rounded-2xl border px-4 py-3 ${
                      activo
                        ? "bg-[#EFF0FF] border-[#C9C5FF]"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-semibold ${
                          activo ? "text-[#5B4AE5]" : "text-slate-700"
                        }`}
                      >
                        {opt.titulo}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCar(key)}
                        className={`h-5 w-10 rounded-full transition ${
                          activo ? "bg-[#5B4AE5]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`block h-5 w-5 bg-white rounded-full shadow transform transition ${
                            activo ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {opt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Envío QR y costo */}
        <div className="mb-6 rounded-2xl border border-[#E0DDFB] bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Envio de QR
              </label>
              <select
                value={ajuste.envioQR}
                onChange={(e) =>
                  setAjuste((prev) => ({
                    ...prev,
                    envioQR: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
              >
                <option value="correo">Correo</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Costo de Inscripción
              </label>
              <input
                type="number"
                min={0}
                placeholder="500"
                value={ajuste.costoInscripcion}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitimos vacío o número >= 0
                  if (value === "") {
                    setAjuste((prev) => ({
                      ...prev,
                      costoInscripcion: "",
                    }));
                    return;
                  }
                  const num = Number(value);
                  if (Number.isNaN(num) || num < 0) return;
                  setAjuste((prev) => ({
                    ...prev,
                    costoInscripcion: value,
                  }));
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
              />
            </div>
          </div>
        </div>

        {/* Tiempos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-700">
              Añadir Tiempo
            </p>

            <button
              type="button"
              onClick={() => {
                if (!caracteristicas.asistencia_tiempos) {
                  setAjuste((prev) => ({
                    ...prev,
                    caracteristicas: {
                      ...prev.caracteristicas,
                      asistencia_tiempos: true,
                    },
                  }));
                }
                abrirCrearTiempo();
              }}
              className={`h-9 w-9 rounded-full text-white shadow-md flex items-center justify-center ${
                caracteristicas.asistencia_tiempos
                  ? "bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF]"
                  : "bg-slate-300"
              }`}
            >
              +
            </button>
          </div>

          <div className="rounded-2xl border border-[#E0DDFB] bg-white p-4">
            {ajuste.tiempos.length === 0 ? (
              <p className="text-xs text-slate-500">
                No se han agregado tiempos.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {ajuste.tiempos.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => abrirEditarTiempo(t)}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border bg-white text-slate-700 border-slate-300 hover:bg-[#EFF0FF] hover:text-[#5B4AE5] hover:border-[#C9C5FF]"
                  >
                    <FiClock />
                    <span>{t.nombre}</span>
                    <span className="text-slate-400">
                      {t.inicio}–{t.fin}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <FooterAdminEventos
        onBack={() => {
          setSlideDir("prev");
          navigate("../integrantes");
        }}
        onNext={() => {
          setSlideDir("next");
          navigate("../formulario");
        }}
        step={{ current: 4, total: 5 }}
      />

      <ModalTiempoEvento
        abierto={modalTiempoAbierto}
        modo={modalTiempoModo}
        tiempo={tiempoEditando}
        onGuardar={manejarGuardarTiempo}
        onEliminar={manejarEliminarTiempo}
        onCerrar={cerrarModalTiempo}
      />
    </section>
  );
};

export default SeccionAjusteEvento;
