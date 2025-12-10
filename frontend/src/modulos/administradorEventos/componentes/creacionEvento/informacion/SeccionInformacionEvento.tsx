// src/modulos/administradorEventos/componentes/creacionEvento/SeccionInformacionEvento.tsx

import type { FC, DragEvent, ChangeEvent } from "react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../../firebase/firebaseConfig";
import FooterAdminEventos from "../../comunes/FooterAdminEventos";
import type { CrearEventoOutletContext } from "../../../paginas/PaginaCrearEventoAdminEventos";

const SeccionInformacionEvento: FC = () => {
  const navigate = useNavigate();
  const { infoEvento, setInfoEvento, setSlideDir } =
    useOutletContext<CrearEventoOutletContext>();

  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [errorUpload, setErrorUpload] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const previewUrl = infoEvento.imagenPortadaUrl ?? null;

  const handleFile = (file: File | null) => {
    if (!file) return;

    setErrorUpload(null);

    if (!file.type.startsWith("image/")) {
      setErrorUpload("Solo se permiten imágenes PNG, JPG o GIF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorUpload("El archivo no debe superar los 10 MB.");
      return;
    }

    const storageRef = ref(
      storage,
      `eventos/portadas/${Date.now()}-${file.name}`,
    );

    const uploadTask = uploadBytesResumable(storageRef, file);

    setSubiendo(true);
    setProgreso(0);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgreso(Math.round(pct));
      },
      (error) => {
        console.error("[SeccionInformacionEvento] Error de subida", error);
        setErrorUpload(
          "Ocurrió un error al subir la imagen. Intenta de nuevo.",
        );
        setSubiendo(false);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setInfoEvento((prev) => ({
            ...prev,
            imagenPortadaUrl: url,
          }));
        } catch (err) {
          console.error(
            "[SeccionInformacionEvento] Error al obtener URL",
            err,
          );
          setErrorUpload(
            "No se pudo obtener la URL de la imagen. Intenta de nuevo.",
          );
        } finally {
          setSubiendo(false);
        }
      },
    );
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
  };

  const parseDate = (value?: string | null) => {
    if (!value) return null;
    return new Date(`${value}T00:00:00`);
  };

  const handleNext = () => {
    setErrorInfo(null);

    const nombre = infoEvento.nombre?.trim() ?? "";
    const fiEvento = parseDate(infoEvento.fechaInicioEvento);
    const ffEvento = parseDate(infoEvento.fechaFinEvento);
    const fiIns = parseDate(infoEvento.fechaInicioInscripciones);
    const ffIns = parseDate(infoEvento.fechaFinInscripciones);
    const descripcion = infoEvento.descripcion?.trim() ?? "";

    if (!nombre) {
      setErrorInfo("Debes escribir un nombre para el evento.");
      return;
    }

    if (!fiEvento || !ffEvento) {
      setErrorInfo(
        "Debes definir la fecha de inicio y fin del evento.",
      );
      return;
    }

    if (fiEvento > ffEvento) {
      setErrorInfo(
        "La fecha de inicio del evento no puede ser posterior a la fecha de fin.",
      );
      return;
    }

    if (!fiIns || !ffIns) {
      setErrorInfo(
        "Debes definir el rango de fechas de inscripciones.",
      );
      return;
    }

    if (fiIns > ffIns) {
      setErrorInfo(
        "La fecha de inicio de inscripciones no puede ser posterior a la fecha de fin.",
      );
      return;
    }

    if (ffIns > fiEvento) {
      setErrorInfo(
        "La fecha de fin de inscripciones no puede ser posterior al inicio del evento.",
      );
      return;
    }

    if (!descripcion) {
      setErrorInfo("Debes escribir una descripción del evento.");
      return;
    }

    // ✅ Todo bien → siguiente sección
    setSlideDir("next");
    navigate("../personal");
  };

  return (
    <section className="flex-1 h-full min-h-0 flex flex-col">
      <div className="px-10 pt-10">
        <h1 className="text-2xl font-semibold text-slate-900">
          Información del Evento
        </h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-10 pb-6">
        {errorInfo && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-xs text-rose-700">
            {errorInfo}
          </div>
        )}

        {/* Imagen del evento */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-700 mb-2">
            Foto del Evento
          </p>

          <label
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`border border-dashed rounded-2xl h-40 flex flex-col items-center justify-center text-center text-xs cursor-pointer transition ${
              isDragging
                ? "border-[#5B4AE5] bg-[#E4E5FF]"
                : "border-[#D0D5FF] bg-[#F7F7FF]"
            }`}
          >
            {previewUrl ? (
              <div className="flex items-center gap-4 px-4">
                <div className="h-24 w-32 rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <img
                    src={previewUrl}
                    alt="Portada del evento"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-left space-y-1">
                  <p className="text-[11px] text-slate-500">
                    Esta imagen se usará como portada del evento en los
                    listados del Administrador de Eventos.
                  </p>
                  <p className="text-xs font-semibold text-[#5B4AE5]">
                    Haz clic para cambiar la imagen
                  </p>
                  {subiendo && (
                    <p className="text-[11px] text-slate-500">
                      Subiendo... {progreso}%
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
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
                {subiendo && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Subiendo imagen... {progreso}%
                  </p>
                )}
              </>
            )}

            <input
              id="portada-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              className="hidden"
              onChange={onChangeFile}
            />
          </label>

          {errorUpload && (
            <p className="mt-1 text-[11px] text-rose-600">
              {errorUpload}
            </p>
          )}
        </div>

        {/* Fechas y nombre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Nombre del evento<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Exp. InnovaTECNM 2026"
              value={infoEvento.nombre}
              onChange={(e) =>
                setInfoEvento((prev) => ({
                  ...prev,
                  nombre: e.target.value,
                }))
              }
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
              value={infoEvento.fechaInicioEvento}
              onChange={(e) =>
                setInfoEvento((prev) => ({
                  ...prev,
                  fechaInicioEvento: e.target.value,
                }))
              }
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
              value={infoEvento.fechaFinEvento}
              onChange={(e) =>
                setInfoEvento((prev) => ({
                  ...prev,
                  fechaFinEvento: e.target.value,
                }))
              }
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
              value={infoEvento.fechaInicioInscripciones}
              onChange={(e) =>
                setInfoEvento((prev) => ({
                  ...prev,
                  fechaInicioInscripciones: e.target.value,
                }))
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
              value={infoEvento.fechaFinInscripciones}
              onChange={(e) =>
                setInfoEvento((prev) => ({
                  ...prev,
                  fechaFinInscripciones: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-700">
            Descripción<span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Descripción del evento e información general."
            value={infoEvento.descripcion}
            onChange={(e) =>
              setInfoEvento((prev) => ({
                ...prev,
                descripcion: e.target.value,
              }))
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] resize-none focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
          />
        </div>
      </div>

      <FooterAdminEventos
        onNext={handleNext}
        step={{ current: 1, total: 5 }}
      />
    </section>
  );
};

export default SeccionInformacionEvento;
