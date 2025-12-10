import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useParams } from "react-router-dom";

// Firebase
import { db } from "../../../../../firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query as fsQuery,
  where,
} from "firebase/firestore";
import type { ParticipantesDraft } from "../../../../../api/eventosAdminEventosApi";

interface EquipoItem {
  id: string;
  nombre: string;
  institucion: string;
  creadoEn?: string;
}

const SeccionEquiposDesenglose: FC = () => {
  const { id } = useParams();
  const idEvento = id ?? null;

  const [query, setQuery] = useState("");
  const [equipos, setEquipos] = useState<EquipoItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 config.modo = "individual" | "equipos"
  const [modoRegistro, setModoRegistro] = useState<"individual" | "equipos">(
    "individual",
  );
  const [participantesConfig, setParticipantesConfig] =
    useState<ParticipantesDraft | null>(null);

  // Carga config del evento + equipos
  useEffect(() => {
    if (!idEvento) {
      setCargando(false);
      setError("No se encontró el identificador del evento.");
      return;
    }

    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);

        // 1) leer config del evento
        const eventoRef = doc(db, "eventos", idEvento);
        const eventoSnap = await getDoc(eventoRef);
        const data = eventoSnap.data() as any | undefined;

        const participantesCfg: ParticipantesDraft | undefined =
          data?.config?.participantes ?? data?.config?.participantesConfig;

        const modo =
          participantesCfg?.modo === "equipos" ? "equipos" : "individual";
        setModoRegistro(modo);
        setParticipantesConfig(participantesCfg ?? null);

        // 2) leer equipos solo si el modo permite equipos
        if (modo === "equipos") {
          const colRef = collection(db, "eventos", idEvento, "equipos");
          const q = fsQuery(colRef, where("estado", "!=", "eliminado"));
          const snap = await getDocs(q);

          const lista: EquipoItem[] = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data() as any;
            lista.push({
              id: docSnap.id,
              nombre: d.nombre ?? "Equipo sin nombre",
              institucion: d.institucion ?? "—",
              creadoEn: d.creadoEn?.toDate
                ? d.creadoEn.toDate().toLocaleDateString("es-MX")
                : undefined,
            });
          });
          setEquipos(lista);
        } else {
          setEquipos([]);
        }
      } catch (err) {
        console.error("[SeccionEquiposDesenglose] Error:", err);
        setError("Ocurrió un error al cargar los equipos.");
      } finally {
        setCargando(false);
      }
    };

    void cargar();
  }, [idEvento]);

  const filtrados = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return equipos;
    return equipos.filter(
      (e) =>
        e.nombre.toLowerCase().includes(t) ||
        e.institucion.toLowerCase().includes(t),
    );
  }, [equipos, query]);

  const maxEquiposPermitidos = useMemo(() => {
    if (participantesConfig?.modo !== "equipos") return undefined;
    const valor = parseInt(participantesConfig.maxEquipos || "", 10);
    return Number.isFinite(valor) && valor > 0 ? valor : undefined;
  }, [participantesConfig]);

  const limiteEquiposAlcanzado = useMemo(() => {
    if (maxEquiposPermitidos === undefined) return false;
    return equipos.length >= maxEquiposPermitidos;
  }, [equipos.length, maxEquiposPermitidos]);

  if (cargando) {
    return (
      <section className="px-6 sm:px-10 py-6">
        <p className="text-sm text-slate-500">
          Cargando equipos registrados del evento...
        </p>
      </section>
    );
  }

  const modoEsIndividual = modoRegistro === "individual";

  return (
    <section className="px-6 sm:px-10 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Equipos</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={modoEsIndividual || limiteEquiposAlcanzado}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold ${
              modoEsIndividual
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : limiteEquiposAlcanzado
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-[#5B4AE5] text-white shadow hover:bg-[#4A3FD0]"
            }`}
          >
            {limiteEquiposAlcanzado ? "Límite alcanzado" : "Nuevo equipo"}
          </button>
        </div>
      </div>

      {participantesConfig && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-800 mb-1">Configuración desde el wizard</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span>
              • Modo: <strong>{participantesConfig.modo}</strong>
            </span>
            {participantesConfig.modo === "equipos" && (
              <>
                <span>
                  • Máx. equipos: <strong>{maxEquiposPermitidos ?? "Sin límite"}</strong>
                </span>
                <span>
                  • Integrantes por equipo: <strong>{participantesConfig.minIntegrantes}</strong> a {" "}
                  <strong>{participantesConfig.maxIntegrantes}</strong>
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {modoEsIndividual && (
        <p className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Este evento está configurado como <strong>individual</strong> en el
          wizard de creación, por lo que <strong>no se permite el registro</strong>{" "}
          de equipos. Si necesitas equipos, edita la configuración del evento.
        </p>
      )}

      {limiteEquiposAlcanzado && (
        <p className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Se alcanzó el máximo de equipos permitido por la configuración del wizard.
          Para habilitar más registros, ajusta el tope de equipos en la configuración del evento.
        </p>
      )}

      <div className="flex items-center mb-4">
        <div className="flex-1 bg-[#F5F6FB] rounded-full flex items-center px-4 py-2 text-sm text-slate-700">
          <FiSearch className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar equipo o institución"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            disabled={modoEsIndividual}
          />
        </div>
      </div>

      {modoEsIndividual ? (
        <p className="text-xs text-slate-500">
          No se muestran equipos porque el evento está configurado como
          individual.
        </p>
      ) : filtrados.length === 0 ? (
        <p className="text-xs text-slate-500">
          No se encontraron equipos con los filtros actuales.
        </p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 bg-slate-50">
                <th className="px-4 py-2">Nombre del equipo</th>
                <th className="px-4 py-2">Instituto</th>
                <th className="px-4 py-2">Día de registro</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-800">{e.nombre}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {e.institucion}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {e.creadoEn ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default SeccionEquiposDesenglose;
