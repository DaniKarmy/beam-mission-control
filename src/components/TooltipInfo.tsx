import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { TECHNICAL_TOOLTIPS } from '../data/missionData';

interface TooltipInfoProps {
  term: keyof typeof TECHNICAL_TOOLTIPS;
  label?: string;
  className?: string;
}

export const TooltipInfo: React.FC<TooltipInfoProps> = ({ term, label, className = '' }) => {
  const [open, setOpen] = useState(false);
  const info = TECHNICAL_TOOLTIPS[term];

  if (!info) return <span>{label || term}</span>;

  return (
    <span
      className={`relative inline-flex items-center gap-1 group ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center gap-1 text-left border-b border-dotted border-slate-500/70 hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 transition-colors cursor-help"
        aria-label={`Technical definition: ${info.title}`}
      >
        <span>{label || term}</span>
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-[#0D131F] border border-slate-700 shadow-2xl rounded text-left pointer-events-none"
        >
          <div className="text-xs font-mono font-semibold text-cyan-300 mb-1 tracking-wide">
            {info.title}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-normal normal-case">
            {info.definition}
          </p>
        </div>
      )}
    </span>
  );
};
