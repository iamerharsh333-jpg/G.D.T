import React from 'react';
import { Users, TrendingUp, UserCheck, Briefcase, Home, ShieldAlert } from 'lucide-react';

export const PopulationPage: React.FC = () => {
  const sectorDensity = [
    { sector: 'Cyber City & DLF Phase II (Commercial Core)', density: '14,200 / km²', dayNightRatio: '3.8x Daytime', category: 'High Commercial' },
    { sector: 'Old Gurugram / Sector 14 & 15', density: '19,500 / km²', dayNightRatio: '1.1x Steady', category: 'High Residential' },
    { sector: 'Golf Course Road (Sec 42, 53, 54)', density: '9,800 / km²', dayNightRatio: '1.6x Balanced', category: 'Mixed High-Rise' },
    { sector: 'Sohna Road Corridor (Sec 47-49)', density: '12,400 / km²', dayNightRatio: '1.3x Residential', category: 'Residential Growth' },
    { sector: 'New Gurugram (Sec 81-95)', density: '6,200 / km²', dayNightRatio: '0.8x Nighttime', category: 'Emerging Suburban' },
    { sector: 'Manesar Industrial Precinct', density: '4,100 / km²', dayNightRatio: '2.9x Daytime', category: 'Industrial Workforce' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0a0d14] text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold">Demographics & Population Dynamics</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-semibold">
              SYNTHETIC CENSUS MODEL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Spatial distribution of resident population, daytime commuter workforce, and ward density
          </p>
        </div>
      </div>

      {/* Synthetic Notice */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center space-x-2">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span>
          Illustrative demographic indices derived from regional census estimates. These values serve as placeholder models for municipal capacity planning.
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>RESIDENT POPULATION</span>
            <Home className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">2,840,000</div>
          <div className="text-[11px] text-slate-400 mt-1">Nighttime census baseline</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PEAK DAYTIME WORKFORCE</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">3,420,000</div>
          <div className="text-[11px] text-indigo-400 mt-1">+580k daily NCR commuters</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>MEDIAN AGE</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">29.4 Yrs</div>
          <div className="text-[11px] text-emerald-400 mt-1">High working-age demographic</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ANNUAL GROWTH RATE</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">+4.2%</div>
          <div className="text-[11px] text-amber-400 mt-1">Urban migration & expansion</div>
        </div>
      </div>

      {/* Sector-wise Density Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Spatial Density & Day-Night Population Shifts by Sector</span>
          <span className="text-cyan-400">Illustrative Estimates</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Planning Sector Zone</th>
                <th className="py-2.5 px-4">Estimated Density</th>
                <th className="py-2.5 px-4">Day/Night Influx Ratio</th>
                <th className="py-2.5 px-4">Zoning Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sectorDensity.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">{s.sector}</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">{s.density}</td>
                  <td className="py-3 px-4 text-indigo-300">{s.dayNightRatio}</td>
                  <td className="py-3 px-4 text-slate-400">{s.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

