// src/modulos/administradorEventos/paginas/PaginaCrearEventoAdminEventos.tsx
import React from "react";

export const PaginaCrearEventoAdminEventos: React.FC = () => {
  return (
    // 🔵 FONDO AZUL – ocupa toda la pantalla
    <div className="min-h-screen bg-gradient-to-b from-[#192D69] to-[#6581D6] flex justify-center items-center py-10">
      {/* 🟦 CONTENEDOR BLANCO – mucho más ancho, casi pantalla completa */}
      <div className="w-[95%] max-w-[1240px] min-h-[560px] bg-white rounded-[32px] shadow-2xl flex overflow-hidden">
        {/* LADO IZQUIERDO: pasos */}
        <aside className="w-80 bg-[#F4F2FF] px-10 py-10 flex flex-col border-r border-[#E0DDFB]">
          <h2 className="text-2xl font-semibold text-slate-900 mb-10">
            Crear Evento
          </h2>

          <ol className="space-y-6 text-sm">
            {/* Paso activo */}
            <li className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="h-8 w-8 rounded-2xl bg-[#5B4AE5] text-white flex items-center justify-center text-sm font-semibold shadow-md">
                  1
                </div>
                <div className="w-[2px] flex-1 bg-[#D4D0F7] mt-1" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#5B4AE5] uppercase tracking-[0.15em]">
                  Información
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-[170px]">
                  Danos los datos básicos para comenzar con tu evento.
                </p>
              </div>
            </li>

            {/* Paso 2 */}
            <li className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="h-8 w-8 rounded-2xl bg-white text-slate-400 border border-[#E0DDFB] flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div className="w-[2px] flex-1 bg-[#E5E4FA] mt-1" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.15em]">
                  Personal
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[170px]">
                  Define quién coordina y apoya el evento.
                </p>
              </div>
            </li>

            {/* Paso 3 */}
            <li className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="h-8 w-8 rounded-2xl bg-white text-slate-400 border border-[#E0DDFB] flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div className="w-[2px] flex-1 bg-[#E5E4FA] mt-1" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.15em]">
                  Ajuste del evento
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[170px]">
                  Configura fechas, cupos y estructura.
                </p>
              </div>
            </li>

            {/* Paso 4 */}
            <li className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="h-8 w-8 rounded-2xl bg-white text-slate-400 border border-[#E0DDFB] flex items-center justify-center text-sm font-semibold">
                  4
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.15em]">
                  Formulario
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[170px]">
                  Define qué datos se capturan en inscripciones y asistencia.
                </p>
              </div>
            </li>
          </ol>

          {/* Botón Cancelar abajo */}
          <button
            type="button"
            className="mt-auto w-full rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white font-semibold py-3 text-sm shadow-md"
          >
            Cancelar
          </button>
        </aside>

        {/* LADO DERECHO: formulario de información */}
        <section className="flex-1 px-10 py-10 flex flex-col">
          <h1 className="text-2xl font-semibold text-slate-900 mb-6">
            Información del Evento
          </h1>

          {/* Foto del evento (dropzone) */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Foto del Evento
            </p>
            <div className="border border-dashed border-[#D0D5FF] rounded-2xl h-40 flex flex-col items-center justify-center text-center text-xs text-slate-500 bg-[#F7F7FF]">
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
            </div>
          </div>

          {/* Dos columnas de campos de texto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Nombre del evento<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Exp. InnovaTECNM 2026"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Fecha de Finalización del Evento
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Fecha de inicio de Inscripciones
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Fecha de fin de Inscripciones
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
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
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-[#F9FAFF] resize-none focus:outline-none focus:ring-2 focus:ring-[#5B4AE5]/40 focus:border-[#5B4AE5]"
            />
          </div>

          {/* Footer de pasos y botón Siguiente */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Paso <span className="font-semibold text-slate-600">1</span> de{" "}
              <span className="font-semibold text-slate-600">6</span>
            </span>

            <button
              type="button"
              className="px-8 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold shadow-md"
            >
              Siguiente
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
