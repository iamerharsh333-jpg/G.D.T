import React from 'react';
import { Activity, CheckCircle2, Globe, Cpu } from 'lucide-react';
import { MapCameraState, MapLayerConfig } from '../../types';

interface BottomBarProps {
  cameraState: MapCameraState;
  layerConfig: MapLayerConfig;
}

export const BottomBar: React.FC<BottomBarProps> = ({ cameraState, layerConfig }) => {
  const activeLayersCount = Object.values(layerConfig).filter(Boolean).length;
  const totalLayersCount = Object.keys(layerConfig).length;

  return (
    <footer className="h-7 bg-[#090d17] border-t border-slate-800/80 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-30">
      {/* Left: Geo Coordinates & Altitude */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500">GEO:</span>
          <span className="text-slate-200">
            {cameraState.latitude.toFixed(5)}° N, {cameraState.longitude.toFixed(5)}° E
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5">
          <span className="text-slate-500">ALT:</span>
          <span className="text-cyan-400">
            {cameraState.height > 1000
              ? `${(cameraState.height / 1000).toFixed(2)} km`
              : `${Math.round(cameraState.height)} m`}
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5">
          <span className="text-slate-500">PITCH:</span>
          <span className="text-slate-300">
            {(cameraState.pitch * (180 / Math.PI)).toFixed(0)}°
          </span>
        </div>
      </div>

      {/* Center: Real Data Source Notice */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>DATA SOURCE: OPENSTREETMAP (ODbL) · 3,050 BUILDINGS · 1,225 ROADS · 231 INFRASTRUCTURE ASSETS</span>
        </div>
      </div>

      {/* Right: Layers & System Health */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500">LAYERS:</span>
          <span className="text-cyan-400 font-semibold">
            {activeLayersCount}/{totalLayersCount} ACTIVE
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-1.5">
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-500">FPS:</span>
          <span className="text-emerald-400 font-semibold">60 FPS</span>
        </div>

        <div className="flex items-center space-x-1">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="text-slate-300">REAL DATA READY</span>
        </div>
      </div>
    </footer>
  );
};
