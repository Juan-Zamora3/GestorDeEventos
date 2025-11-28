// Sección Ajuste del evento (Paso 4)
// Configura características del evento: asistencia, confirmación, envío por WhatsApp/Correo,
// opciones de QR, costo de inscripción y tiempos de asistencia.
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiClock } from "react-icons/fi";
import ModalTiempoEvento from "./ModalTiempoEvento";

const SeccionAjusteEvento: FC = () => {
  const navigate = useNavigate();
  // Estado de toggles de características
  const [caracteristicas, setCaracteristicas] = useState<Record<string, boolean>>({
    asistencia_qr: true,
    confirmacion_pago: false,
    envio_whatsapp: false,
    envio_correo: true,
    asistencia_tiempos: false,
  });
  const toggleCar = (id: keyof typeof caracteristicas) =>
    setCaracteristicas((prev) => ({ ...prev, [id]: !prev[id] }));

  // Opción de envío de QR (WhatsApp o Correo)
  const [envioQR, setEnvioQR] = useState<string>("whatsapp");
  const [costoInscripcion, setCostoInscripcion] = useState<string>("");

  // Tiempos de asistencia
  type Tiempo = { id: string; nombre: string; inicio: string; fin: string };
  const [tiempos, setTiempos] = useState<Tiempo[]>([]);
  const [modalTiempoAbierto, setModalTiempoAbierto] = useState<boolean>(false);
  const [modalTiempoModo, setModalTiempoModo] = useState<"crear" | "editar">("crear");
  const [tiempoEditando, setTiempoEditando] = useState<Tiempo | undefined>(undefined);
  const genId = () => `tiempo-${Math.random().toString(36).slice(2, 8)}`;
  const abrirCrearTiempo = () => { setModalTiempoModo("crear"); setTiempoEditando(undefined); setModalTiempoAbierto(true); };
  const abrirEditarTiempo = (t: Tiempo) => { setModalTiempoModo("editar"); setTiempoEditando(t); setModalTiempoAbierto(true); };
  const cerrarModalTiempo = () => setModalTiempoAbierto(false);
  const manejarGuardarTiempo = (data: Omit<Tiempo, "id"> & { id?: string }) => {
    setTiempos((prev) => {
      if (modalTiempoModo === "crear") return [...prev, { id: genId(), nombre: data.nombre, inicio: data.inicio, fin: data.fin }];
      if (modalTiempoModo === "editar" && tiempoEditando)
        return prev.map((t) => (t.id === tiempoEditando.id ? { ...t, nombre: data.nombre, inicio: data.inicio, fin: data.fin } : t));
      return prev;
    });
    setModalTiempoAbierto(false);
  };
  const manejarEliminarTiempo = (id: string) => {
    setTiempos((prev) => prev.filter((t) => t.id !== id));
    setModalTiempoAbierto(false);
    setTiempoEditando(undefined);
  };
  return (
    // Contenedor principal con header fijo, contenido con scroll y footer fijo
    <section className="flex-1 h-full min-h-0 flex flex-col">
      <div className="px-10 pt-10">
        <h1 className="text-2xl font-semibold text-slate-900">Características del evento</h1>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-10 pb-6">
        {/* Selección de características */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-700 mb-2">Selección</p>
          <div className="mb-3 rounded-xl bg-[#F7F7FF] border border-[#E0DDFB] px-4 py-3">
            <p className="text-[11px] text-slate-600">Activa las características que aplican a tu evento. WhatsApp ya está disponible como opción de envío.</p>
          </div>
          <div className="rounded-2xl border border-[#E0DDFB] bg-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "asistencia_qr", titulo: "Tomar asistencia por QR", desc: "Registrar asistencia con código QR." },
                { id: "confirmacion_pago", titulo: "Confirmación de pago", desc: "Confirmar pagos de participación/entrada." },
                { id: "envio_whatsapp", titulo: "Envio por WhatsApp", desc: "Enviar constancias por WhatsApp." },
                { id: "envio_correo", titulo: "Envio por correo", desc: "Enviar constancias por correo." },
                { id: "asistencia_tiempos", titulo: "Tomar asistencia en tiempos", desc: "Gestionar tiempos de entrada/salida." },
              ].map((opt) => {
                const activo = !!caracteristicas[opt.id as keyof typeof caracteristicas];
                return (
                  <div key={opt.id} className={`rounded-2xl border px-4 py-3 ${activo ? "bg-[#EFF0FF] border-[#C9C5FF]" : "bg-white border-slate-200"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${activo ? "text-[#5B4AE5]" : "text-slate-700"}`}>{opt.titulo}</span>
                      <button type="button" onClick={() => toggleCar(opt.id as keyof typeof caracteristicas)} className={`h-5 w-10 rounded-full transition ${activo ? "bg-[#5B4AE5]" : "bg-slate-300"}`}>
                        <span className={`block h-5 w-5 bg-white rounded-full shadow transform transition ${activo ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Envío de QR y costos */}
        <div className="mb-6 rounded-2xl border border-[#E0DDFB] bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Envio de QR</label>
              <select value={envioQR} onChange={(e) => setEnvioQR(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]">
                <option value="whatsapp">WhatsApp</option>
                <option value="correo">Correo</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Costo de Inscripción</label>
              <input type="number" min={0} placeholder="500" value={costoInscripcion} onChange={(e) => setCostoInscripcion(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]" />
            </div>
          </div>
        </div>

        {/* Añadir tiempos cuando la característica está activa */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-700">Añadir Tiempo</p>
            <button type="button" onClick={abrirCrearTiempo} disabled={!caracteristicas.asistencia_tiempos} className={`h-9 w-9 rounded-full text-white shadow-md flex items-center justify-center ${caracteristicas.asistencia_tiempos ? "bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF]" : "bg-slate-300"}`}>
              +
            </button>
          </div>
          <div className="rounded-2xl border border-[#E0DDFB] bg-white p-4">
            {tiempos.length === 0 ? (
              <p className="text-xs text-slate-500">No se han agregado tiempos.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {tiempos.map((t) => (
                  <button key={t.id} type="button" onDoubleClick={() => abrirEditarTiempo(t)} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border bg-white text-slate-700 border-slate-300 hover:bg-[#EFF0FF] hover:text-[#5B4AE5] hover:border-[#C9C5FF]">
                    <FiClock />
                    <span>{t.nombre}</span>
                    <span className="text-slate-400">{t.inicio}–{t.fin}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Footer con navegación del wizard */}
      <div className="px-10 flex items-center justify-between pt-4 border-t border-slate-100">
        <button type="button" onClick={() => navigate("../integrantes")} className="px-8 py-2.5 rounded-full bg-white text-slate-700 text-sm font-semibold shadow-sm border border-slate-200">Volver</button>
        <span className="text-xs text-slate-400">Paso <span className="font-semibold text-slate-600">4</span> de <span className="font-semibold text-slate-600">5</span></span>
        <button type="button" onClick={() => navigate("../formulario")} className="px-8 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md">Siguiente</button>
      </div>

      {/* Modal de tiempos */}
      <ModalTiempoEvento
        abierto={modalTiempoAbierto}
        modo={modalTiempoModo}
        tiempo={tiempoEditando}
        onGuardar={(data) => manejarGuardarTiempo(data)}
        onEliminar={(id) => manejarEliminarTiempo(id)}
        onCerrar={cerrarModalTiempo}
      />
    </section>
  );
};

export default SeccionAjusteEvento;
