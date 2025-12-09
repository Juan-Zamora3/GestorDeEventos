// src/modulos/administradorEventos/componentes/desengloseEvento/constancias/HistorialEnvioCorreos.tsx
import { useEffect, useMemo, useState } from "react";
import type { FC, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiSearch,
  FiEye,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { useParams } from "react-router-dom";

// Firebase
import { db } from "../../../../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

interface RegistroEnvio {
  id: string;
  nombre: string;
  correo: string;
  canal: "Correo";
  asunto?: string;
  fecha: string;
  estado: "Enviado" | "Fallido" | "Pendiente";
}

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  registros?: RegistroEnvio[];
}

const HistorialEnvioCorreos: FC<Props> = ({ abierto, onCerrar, registros }) => {
  const { id: idEvento } = useParams<{ id: string }>();

  const [items, setItems] = useState<RegistroEnvio[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [canal, setCanal] = useState<"Todos" | "Correo">("Todos");
  const [estado, setEstado] = useState<
    "Todos" | "Enviado" | "Fallido" | "Pendiente"
  >("Todos");
  const [det, setDet] = useState<RegistroEnvio | undefined>(undefined);

  // Si el padre NO pasa registros, nos conectamos a Firestore:
  useEffect(() => {
    if (!abierto) return;
    if (!idEvento) return;
    if (registros && registros.length) return; // el padre controla los datos

    setCargando(true);
    setError(null);

    // Ajusta "envios_constancias" al nombre real que uses en tu colección
    const colRef = collection(db, "eventos", idEvento, "envios_constancias");
    const q = query(colRef, orderBy("fechaEnvio", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: RegistroEnvio[] = snap.docs.map((d) => {
          const data = d.data() as any;

          let fechaStr = "";
          const f = data.fechaEnvio ?? data.fecha;
          if (f?.toDate) {
            fechaStr = f.toDate().toLocaleString("es-MX");
          } else if (typeof f === "string") {
            fechaStr = f;
          }

          return {
            id: d.id,
            nombre: data.nombre ?? data.nombreCompleto ?? "",
            correo: data.correo ?? "",
            canal: (data.canal as "Correo") ?? "Correo",
            asunto: data.asunto ?? "",
            fecha: fechaStr,
            estado: (data.estado as RegistroEnvio["estado"]) ?? "Pendiente",
          };
        });
        setItems(rows);
        setCargando(false);
      },
      (err) => {
        console.error("[HistorialEnvioCorreos] Error al cargar:", err);
        setError("No se pudo cargar el historial de envíos.");
        setCargando(false);
      },
    );

    return () => unsub();
  }, [abierto, idEvento, registros]);

  if (!abierto) return null;

  // Fuente final de datos: prioridad a lo que mande el padre
  const data: RegistroEnvio[] = registros && registros.length ? registros : items;

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    return data.filter((r) => {
      if (canal !== "Todos" && r.canal !== canal) return false;
      if (estado !== "Todos" && r.estado !== estado) return false;
      if (!term) return true;

      return (
        r.nombre.toLowerCase().includes(term) ||
        r.correo.toLowerCase().includes(term) ||
        (r.asunto ?? "").toLowerCase().includes(term)
      );
    });
  }, [data, busqueda, canal, estado]);

  const chipEstado = (estado: RegistroEnvio["estado"]) => {
    const map: Record<
      RegistroEnvio["estado"],
      { cls: string; icon: ReactNode }
    > = {
      Enviado: {
        cls: "bg-[#E8FBEA] text-emerald-700 ring-1 ring-emerald-200",
        icon: <FiCheckCircle />,
      },
      Fallido: {
        cls: "bg-[#FDECEC] text-rose-700 ring-1 ring-rose-200",
        icon: <FiAlertCircle />,
      },
      Pendiente: {
        cls: "bg-[#FFF7E6] text-amber-700 ring-1 ring-amber-200",
        icon: <FiClock />,
      },
    };

    const cfg = map[estado];
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[11px] ${cfg.cls}`}
      >
        {cfg.icon}
        {estado}
      </span>
    );
  };

  const Segment = <T extends string>({
    value,
    options,
    onChange,
  }: {
    value: T;
    options: T[];
    onChange: (v: T) => void;
  }) => (
    <div className="inline-flex rounded-full bg-[#F2F3FB] p-1 shadow-inner">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`min-w-[72px] px-3 py-1.5 rounded-full text-[11px] font-semibold transition-transform ${
              active
                ? "bg-white text-slate-900 shadow-sm scale-[1.02]"
                : "text-slate-700 hover:bg-white/60"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 backdrop-blur-sm">
      <motion.div
        className="w-[1200px] max-w-[95vw] h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        {/* HEADER GENERAL */}
        <header className="px-8 py-4 bg-gradient-to-r from-[#192D69] to-[#6581D6] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-white/15 inline-flex items-center justify-center">
              <FiMail />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Historial de envíos</h2>
              <p className="text-xs text-white/80">
                Correos y mensajes enviados de constancias
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="h-9 w-9 rounded-full bg-white/15 text-white inline-flex items-center justify-center hover:bg-white/25"
          >
            <FiX />
          </button>
        </header>

        {/* CONTENIDO PRINCIPAL: LISTA + DETALLE */}
        <div className="flex-1 flex min-h-0">
          {/* LADO IZQUIERDO: LISTA */}
          <section className="flex-1 flex flex-col min-w-0 border-r border-slate-100">
            {/* Búsqueda + filtros */}
            <div className="px-6 py-3 flex flex-wrap items-center gap-3 border-b border-slate-100 bg-white">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, correo o asunto"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/60"
                />
                <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B4AE5]" />
              </div>

              <Segment
                value={canal}
                options={["Todos", "Correo"]}
                onChange={(v) => setCanal(v)}
              />
              <Segment
                value={estado}
                options={["Todos", "Enviado", "Fallido", "Pendiente"]}
                onChange={(v) => setEstado(v)}
              />
            </div>

            {/* Lista de envíos */}
            <div className="flex-1 min-h-0 px-6 pb-5 pt-3">
              <div className="rounded-2xl bg-[#F9FAFF] border border-slate-100 shadow-inner flex flex-col">
                <div className="px-4 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  <span>Envíos</span>
                  <span>
                    {cargando
                      ? "Cargando..."
                      : `${filtrados.length} registro(s)`}
                  </span>
                </div>

                <div
                  className="overflow-y-auto px-1 pb-2"
                  style={{
                    maxHeight: "420px",
                    minHeight: "260px",
                    scrollbarGutter: "stable" as any,
                  }}
                >
                  {error ? (
                    <div className="h-full flex items-center justify-center text-xs text-rose-600 text-center px-3">
                      {error}
                    </div>
                  ) : cargando ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      Cargando historial de envíos...
                    </div>
                  ) : filtrados.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center px-3">
                      No se encontraron envíos con los filtros actuales.
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-200 text-sm">
                      {filtrados.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-start gap-4 px-3 py-3 hover:bg-white transition-colors rounded-xl"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {r.nombre}
                            </p>
                            <p className="text-xs text-slate-600 truncate">
                              {r.correo}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                              <span>
                                <span className="font-semibold">Canal:</span>{" "}
                                {r.canal}
                              </span>
                              {r.asunto && (
                                <span>
                                  <span className="font-semibold">
                                    Asunto:
                                  </span>{" "}
                                  {r.asunto}
                                </span>
                              )}
                              <span>
                                <span className="font-semibold">Fecha:</span>{" "}
                                {r.fecha || "—"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            {chipEstado(r.estado)}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setDet(r)}
                                className="h-8 w-8 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white inline-flex items-center justify-center hover:brightness-110"
                                title="Ver detalle"
                              >
                                <FiEye />
                              </button>
                              {r.estado !== "Enviado" && (
                                <button
                                  type="button"
                                  onClick={() => setDet(r)}
                                  className="h-8 w-8 rounded-full bg-[#EEF0FF] text-[#5B4AE5] inline-flex items-center justify-center hover:bg-[#E6E9FF]"
                                  title="Reintentar / Reenviar"
                                >
                                  <FiRefreshCw />
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* LADO DERECHO: DETALLE */}
          <aside className="w-[360px] flex-none flex flex-col bg-[#F5F6FF]">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">Detalle</h3>
              <p className="text-xs text-slate-500">
                {det
                  ? "Resumen del envío seleccionado."
                  : "Selecciona un envío de la lista para ver más información."}
              </p>
            </div>

            <div
              className="flex-1 min-h-0 px-5 py-4 overflow-y-auto"
              style={{ scrollbarGutter: "stable" as any }}
            >
              {det ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {det.nombre}
                    </p>
                    <p className="text-xs text-slate-600">{det.correo}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {chipEstado(det.estado)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-3 py-2">
                      <p className="text-[11px] text-slate-500">Canal</p>
                      <p className="text-sm text-slate-800">{det.canal}</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-3 py-2">
                      <p className="text-[11px] text-slate-500">Fecha</p>
                      <p className="text-sm text-slate-800">
                        {det.fecha || "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-3 py-2 col-span-2">
                      <p className="text-[11px] text-slate-500">Asunto</p>
                      <p className="text-sm text-slate-800">
                        {det.asunto ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-xs font-semibold text-white hover:brightness-110"
                    >
                      Reenviar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center px-2">
                  Selecciona un envío de la lista para ver su detalle y opciones
                  de reenvío.
                </div>
              )}
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
};

export default HistorialEnvioCorreos;
