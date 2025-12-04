import React from "react";
import { FiLock, FiCalendar } from "react-icons/fi";
import type { FormTheme } from "./types";
import { MOCK_PREGUNTAS } from "./constants";
import IconoTipo from "./IconoTipo";

interface Props {
  theme: FormTheme;
  interactive?: boolean;
}

const FormularioPreview: React.FC<Props> = ({ theme, interactive }) => {
  
  // Construir URL de Google Fonts (Simple load of all potential fonts)
  const fontUrl = "https://fonts.googleapis.com/css2?family=Lobster&family=Merriweather:wght@300;400;700&family=Open+Sans:wght@400;600&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;500;700&display=swap";

  // Background style logic
  const backgroundStyle: React.CSSProperties = theme.backgroundImage 
    ? { backgroundImage: `url(${theme.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
    : { backgroundColor: theme.backgroundColor };

  return (
    <div 
        className="flex-1 h-full overflow-y-auto transition-all duration-500 ease-in-out relative"
        style={backgroundStyle}
    >
        {/* Inject fonts */}
        <link href={fontUrl} rel="stylesheet" />

        <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">
            
            {/* HEADER CARD */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 border-t-0 relative group">
                 {/* Banner Image or Color Strip */}
                 {theme.headerImage ? (
                     <div className="h-36 w-full relative bg-slate-100">
                        <img src={theme.headerImage} alt="Header" className="w-full h-full object-cover" />
                     </div>
                 ) : (
                     <div className="h-3 w-full transition-colors duration-300" style={{ backgroundColor: theme.accentColor }} />
                 )}

                 <div className="px-6 py-6">
                    <h1 
                      className="font-bold mb-2 transition-colors leading-tight" 
                      style={{ 
                        color: theme.textStyles.header.color,
                        fontFamily: theme.textStyles.header.font,
                        fontSize: `${theme.textStyles.header.size}px`
                      }}
                    >
                        Concurso de Robótica 2025
                    </h1>
                    <p 
                      className="text-slate-600"
                      style={{
                        fontFamily: theme.textStyles.text.font,
                        fontSize: `${theme.textStyles.text.size}px`
                      }}
                    >
                        Formulario de inscripción para equipos participantes. Por favor complete todos los campos obligatorios.
                    </p>
                 </div>
                 
                 <div className="px-6 py-2 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <span 
                      className="text-slate-500 font-medium"
                      style={{ fontSize: '11px', fontFamily: theme.textStyles.text.font }}
                    >
                        correo@usuario.com <span className="text-slate-400">(no compartido)</span>
                    </span>
                    <span 
                      className="font-medium cursor-pointer transition-colors" 
                      style={{ color: theme.accentColor, fontSize: '11px', fontFamily: theme.textStyles.text.font }}
                    >
                        Cambiar cuenta
                    </span>
                 </div>
            </div>

            {/* QUESTIONS */}
            {MOCK_PREGUNTAS.map((p) => (
                <div 
                    key={p.id} 
                    className={`bg-white rounded-xl shadow-sm border border-transparent px-6 py-6 transition-all hover:shadow-md relative`}
                >
                    {/* Side accent for selected/active question simulation */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-colors duration-300" style={{ backgroundColor: p.source === 'participantes' ? '#cbd5e1' : 'transparent' }} />

                    <div className="mb-4">
                        <div className="flex justify-between items-start gap-4">
                            <label 
                              className="font-medium block"
                              style={{
                                color: theme.textStyles.question.color,
                                fontFamily: theme.textStyles.question.font,
                                fontSize: `${theme.textStyles.question.size}px`
                              }}
                            >
                                {p.nombre}
                                {p.obligatorio && <span className="text-rose-500 ml-1">*</span>}
                            </label>
                            {p.source === "participantes" && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500">
                                    <FiLock size={10} />
                                    <span>{p.tipoLabel ?? "Auto"}</span>
                                </div>
                            )}
                        </div>
                        {p.placeholder && (
                          <p 
                            className="mt-1"
                            style={{
                              color: theme.textStyles.text.color,
                              fontFamily: theme.textStyles.text.font,
                              fontSize: `${Math.max(10, theme.textStyles.text.size - 2)}px`
                            }}
                          >
                            {p.placeholder}
                          </p>
                        )}
                    </div>

                    <div className="mt-2">
                        {(p.tipo === "texto_corto" || p.tipo === "email" || p.tipo === "telefono" || p.tipo === "numero") && (
                            <div 
                                className="border-b border-slate-200 py-2 w-full md:w-1/2 flex items-center gap-2 transition-colors duration-300"
                                style={{ borderColor: 'var(--tw-border-opacity)' }}
                            >
                                <IconoTipo tipo={p.tipo} />
                                <input 
                                  disabled={!interactive} 
                                  className="bg-transparent w-full outline-none placeholder:text-slate-300" 
                                  placeholder="Tu respuesta" 
                                  style={{
                                    color: theme.textStyles.text.color,
                                    fontFamily: theme.textStyles.text.font,
                                    fontSize: `${theme.textStyles.text.size}px`
                                  }}
                                />
                            </div>
                        )}

                        {p.tipo === "texto_largo" && (
                            <div className="border-b border-slate-200 py-2 w-full flex items-start gap-2">
                                <IconoTipo tipo={p.tipo} />
                                <textarea 
                                  disabled={!interactive} 
                                  className="bg-transparent w-full outline-none resize-none placeholder:text-slate-300" 
                                  rows={1} 
                                  placeholder="Tu respuesta"
                                  style={{
                                    color: theme.textStyles.text.color,
                                    fontFamily: theme.textStyles.text.font,
                                    fontSize: `${theme.textStyles.text.size}px`
                                  }}
                                />
                            </div>
                        )}

                        {p.tipo === "fecha" && (
                            <div className="inline-flex items-center gap-3 border-b border-slate-200 py-2">
                                <input 
                                  type="date" 
                                  disabled={!interactive} 
                                  className="bg-transparent outline-none"
                                  style={{
                                    color: theme.textStyles.text.color,
                                    fontFamily: theme.textStyles.text.font,
                                    fontSize: `${theme.textStyles.text.size}px`
                                  }} 
                                />
                                <FiCalendar className="text-slate-400" />
                            </div>
                        )}

                        {(p.tipo === "seleccion_simple" || p.tipo === "seleccion_multiple") && (
                            <div className="space-y-3 mt-3">
                                {p.config?.opciones?.map((op, idx) => (
                                    <div key={idx} className="flex items-center gap-3 opacity-70">
                                        {p.tipo === "seleccion_simple" ? (
                                          <input type="radio" disabled={!interactive} className="h-4 w-4" />
                                        ) : (
                                          <input type="checkbox" disabled={!interactive} className="h-4 w-4" />
                                        )}
                                        <span 
                                          style={{
                                            color: theme.textStyles.text.color,
                                            fontFamily: theme.textStyles.text.font,
                                            fontSize: `${theme.textStyles.text.size}px`
                                          }}
                                        >
                                          {op}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* FOOTER */}
            <div className="flex justify-between items-center pt-6 pb-12 px-2">
                <button 
                    disabled={!interactive} 
                    className="px-8 py-2.5 rounded shadow-sm text-white font-semibold opacity-90 cursor-not-allowed transition-colors duration-300"
                    style={{ 
                      backgroundColor: theme.accentColor,
                      fontSize: `${theme.textStyles.text.size}px`
                    }}
                >
                    Enviar
                </button>

                <button 
                  className="font-medium hover:opacity-80 transition-opacity"
                  style={{ 
                    color: theme.accentColor,
                    fontSize: `${theme.textStyles.text.size}px` 
                  }}
                >
                  Borrar formulario
                </button>
            </div>

        </div>
    </div>
  );
};

export default FormularioPreview;
