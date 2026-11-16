import React from 'react';
import {
  Leaf,
  Wind,
  Droplets,
  Trees,
  AlertTriangle,
} from 'lucide-react';
import { EnvironmentalAreaChart } from '../components/charts/EnvironmentalAreaChart';
import { dataService } from '../services/dataService';

export const EnvironmentPage: React.FC = () => {
  const envData = dataService.getEnvironmentalIndicators();

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0a0d14] text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold">Environmental Indicators & Microclimate</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
              SIMULATED TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Air quality indexes, Aravalli green lung preservation, and urban heat island tracking
          </p>
        </div>
      </div>

      {/* Environmental KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>CITY AVERAGE AQI</span>
            <Wind className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {envData.aqiMetrics.cityAverageAQI}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{envData.aqiMetrics.classification}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PM 2.5 CONCENTRATION</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {envData.aqiMetrics.pm25} <span className="text-xs text-slate-400 font-normal">µg/m³</span>
          </div>
          <div className="text-[11px] text-rose-400 mt-1">Elevated particulate load</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ARAVALLI GREEN COVER</span>
            <Trees className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">14.8%</div>
          <div className="text-[11px] text-slate-400 mt-1">Protected ecological corridor</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>STORMWATER ABSORPTION</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">42%</div>
          <div className="text-[11px] text-slate-400 mt-1">Natural infiltration rate</div>
        </div>
      </div>

      {/* Temporal Chart */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Diurnal Air Quality & Particulate Curve</h3>
            <p className="text-[11px] text-slate-400 font-mono">Synthesized 24-hour cycle showing morning/evening traffic spikes</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
            Temporal Simulation
          </span>
        </div>
        <div className="mt-3">
          <EnvironmentalAreaChart data={envData.temporalAQI} />
        </div>
      </div>

      {/* Sector Environmental Breakdown */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Sector-wise Green Cover and Urban Heat Island (UHI) Vulnerability</span>
          <span className="text-amber-400">Demo Spatial Analysis</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Sector Region</th>
                <th className="py-2.5 px-4">Green Canopy %</th>
                <th className="py-2.5 px-4">Heat Island Index</th>
                <th className="py-2.5 px-4">Simulated AQI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {envData.sectorsEnvironmental.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">{s.sector}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{s.greenCoverPct}%</td>
                  <td className="py-3 px-4 text-slate-300">{s.heatIslandIndex}</td>
                  <td className="py-3 px-4 text-amber-400">{s.aqi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
