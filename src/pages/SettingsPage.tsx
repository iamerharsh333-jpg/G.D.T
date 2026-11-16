import React, { useState } from 'react';
import {
  Settings,
  Server,
  Globe,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Save,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [fastApiUrl, setFastApiUrl] = useState('http://localhost:8000/api/v1');
  const [antiAliasing, setAntiAliasing] = useState(true);
  const [shadows, setShadows] = useState(false);
  const [highDpi, setHighDpi] = useState(true);
  const [saveSaved, setSaveSaved] = useState(false);

  const handleSave = () => {
    setSaveSaved(true);
    setTimeout(() => setSaveSaved(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0a0d14] text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-slate-400" />
            <h1 className="text-lg font-bold">Platform Configuration & Geospatial Engine Settings</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              SYSTEM SETTINGS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Datum projections, rendering optimization, and backend service connectors
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950 transition self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveSaved && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center space-x-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings saved locally.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Backend & API Configuration */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-200 uppercase pb-2 border-b border-slate-800">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>FastAPI Backend Connector (Step 2 Prep)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 block font-mono">
              FastAPI Endpoint URL (Placeholder)
            </label>
            <input
              type="text"
              value={fastApiUrl}
              onChange={(e) => setFastApiUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-slate-500 font-mono">
              Ready to connect to Python FastAPI microservices in Step 2.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-mono text-[11px]">Backend Health:</span>
              <span className="text-amber-400 font-mono text-[11px]">Disconnected (Local Mock Active)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-mono text-[11px]">Data Ingestion Mode:</span>
              <span className="text-cyan-400 font-mono text-[11px]">Local JSON Service</span>
            </div>
          </div>
        </div>

        {/* Geospatial Datum & Coordinate Systems */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-200 uppercase pb-2 border-b border-slate-800">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Geospatial Datum & Projections</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-300 font-semibold">Standard Ellipsoid</div>
                <div className="text-[10px] text-slate-500">World Geodetic System 1984</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px]">
                WGS 84 (EPSG:4326)
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-300 font-semibold">Projected Grid (India Zone)</div>
                <div className="text-[10px] text-slate-500">UTM Zone 43N (Gurugram)</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                EPSG:32643
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-300 font-semibold">Elevation Baseline</div>
                <div className="text-[10px] text-slate-500">Mean Sea Level (MSL) Survey of India</div>
              </div>
              <span className="text-slate-300 text-[11px]">~220m to 280m AMSL</span>
            </div>
          </div>
        </div>

        {/* 3D Graphics Engine & Performance (8GB RAM Apple Silicon Optimizations) */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-200 uppercase pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>WebGL / Apple Silicon Performance Tuning</span>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs font-medium text-slate-200">FXAA Anti-Aliasing</div>
                <div className="text-[10px] text-slate-500 font-mono">Smoothens 3D polygon edges</div>
              </div>
              <input
                type="checkbox"
                checked={antiAliasing}
                onChange={() => setAntiAliasing(!antiAliasing)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs font-medium text-slate-200">Dynamic Shadows (GPU Heavy)</div>
                <div className="text-[10px] text-slate-500 font-mono">Kept OFF for optimal 8GB RAM performance</div>
              </div>
              <input
                type="checkbox"
                checked={shadows}
                onChange={() => setShadows(!shadows)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs font-medium text-slate-200">Retina High-DPI Canvas</div>
                <div className="text-[10px] text-slate-500 font-mono">Crisp vector line rendering on Mac displays</div>
              </div>
              <input
                type="checkbox"
                checked={highDpi}
                onChange={() => setHighDpi(!highDpi)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950"
              />
            </label>
          </div>
        </div>

        {/* Open Cartographic & Local Architecture */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-200 uppercase pb-2 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Open Cartographic & Geospatial Engine</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-400 font-mono text-[11px] flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>STANDALONE LOCAL GEOSPATIAL ENGINE</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Platform operates with CartoDB Dark Neutral Basemap and OpenStreetMap raster tiles. Standalone execution with zero external token blockers.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-semibold text-cyan-400 font-mono text-[11px]">
                LOCAL PROCESSED DATA PIPELINE
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All spatial geometries, road networks, and infrastructure layers reside in structured GeoJSON services inside `public/data/` and `src/data/`.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
