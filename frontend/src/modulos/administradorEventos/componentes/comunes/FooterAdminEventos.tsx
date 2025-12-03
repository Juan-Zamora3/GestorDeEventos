import type { FC, ReactNode } from "react";

type Step = { current: number; total: number };

interface Props {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  step?: Step;
  rightSlot?: ReactNode;
  className?: string;
}

const FooterAdminEventos: FC<Props> = ({ onBack, onNext, backLabel = "Volver", nextLabel = "Siguiente", step, rightSlot, className }) => {
  return (
    <div className={`px-10 flex items-center justify-between pt-4 pb-4 border-t border-slate-100 ${className ?? ""}`}>
      {onBack ? (
        <button type="button" onClick={onBack} className="px-8 py-2.5 rounded-full bg-white text-slate-700 text-sm font-semibold border border-slate-200">{backLabel}</button>
      ) : (
        <span />
      )}
      {step ? (
        <span className="text-xs text-slate-400">Paso <span className="font-semibold text-slate-600">{step.current}</span> de <span className="font-semibold text-slate-600">{step.total}</span></span>
      ) : (
        <span />
      )}
      {rightSlot ?? (
        <button type="button" onClick={onNext} className="px-8 py-2.5 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold">{nextLabel}</button>
      )}
    </div>
  );
};

export default FooterAdminEventos;
