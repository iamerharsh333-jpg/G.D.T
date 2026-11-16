import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
  demoTag?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  demoTag = true,
}) => {
  return (
    <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition shadow-lg group relative overflow-hidden select-none">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 group-hover:bg-cyan-950/60 transition">
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {value}
          </span>
          {trend && (
            <span
              className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                trend.isPositive
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                  : 'bg-rose-950 text-rose-400 border border-rose-800/50'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">
          <span className="text-[11px] text-slate-400 truncate">{subtitle}</span>
          {demoTag && (
            <span className="text-[9px] font-mono text-amber-400/90 bg-amber-500/10 px-1 rounded border border-amber-500/20">
              SYNTHETIC
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

