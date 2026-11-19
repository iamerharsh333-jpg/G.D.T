import React, { useState } from 'react';
import {
  Layers,
  Building,
  Navigation,
  MapPin,
  Trees,
  Droplets,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Sliders,
  Train,
  GraduationCap,
  HeartPulse,
  Globe,
} from 'lucide-react';
import { MapLayerConfig } from '../../types';

interface MapLayerControlsProps {
  layerConfig: MapLayerConfig;
  onToggleLayer: (key: keyof MapLayerConfig) => void;
  onFlyToPreset: (presetKey: 'cybercity' | 'golfcourse' | 'nh48' | 'overview' | 'udyogvihar') => void;
  onSelectBasemap?: (style: 'dark' | 'satellite' | 'osm') => void;
}

export const MapLayerControls: React.FC<MapLayerControlsProps> = ({
  layerConfig,
  onToggleLayer,
  onFlyToPreset,
  onSelectBasemap,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showRoadSubFilters, setShowRoadSubFilters] = useState(false);

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden select-none text-xs w-68 z-30 transition-all max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2.5 bg-slate-800/80 hover:bg-slate-800 flex items-center justify-between cursor-pointer border-b border-slate-700/60"
      >
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200 tracking-wide font-mono uppercase text-[11px]">
            Geospatial Layers (Real OSM)
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-200">
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-3 space-y-3">
          {/* Layer Checkboxes */}
          <div className="space-y-1.5">
            {/* Buildings */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <div className="flex items-center space-x-2 text-slate-300">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                <span>3D Buildings (3,050 OSM)</span>
              </div>
              <input
                type="checkbox"
                checked={layerConfig.buildings}
                onChange={() => onToggleLayer('buildings')}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950 cursor-pointer"
              />
            </label>

            {/* Roads Master & Hierarchy Accordion */}
            <div className="p-1.5 rounded bg-slate-800/30 border border-slate-800/60 space-y-1">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>Road Network (1,225)</span>
                </label>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setShowRoadSubFilters(!showRoadSubFilters)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-0.5"
                    title="Toggle Road Hierarchies"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                  <input
                    type="checkbox"
                    checked={layerConfig.roads}
                    onChange={() => onToggleLayer('roads')}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950 cursor-pointer"
                  />
                </div>
              </div>

              {/* Subcategories */}
              {showRoadSubFilters && (
                <div className="pl-5 pt-1 space-y-1 text-[11px] font-mono border-t border-slate-800/60 mt-1">
                  <label className="flex items-center justify-between text-slate-400 hover:text-slate-200 cursor-pointer">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-0.5 bg-amber-400 inline-block"></span>
                      <span>Motorways (NH-48)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={layerConfig.motorways}
                      onChange={() => onToggleLayer('motorways')}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950 cursor-pointer scale-90"
                    />
                  </label>

                  <label className="flex items-center justify-between text-slate-400 hover:text-slate-200 cursor-pointer">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-0.5 bg-cyan-400 inline-block"></span>
                      <span>Arterial Roads</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={layerConfig.arterials}
                      onChange={() => onToggleLayer('arterials')}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950 cursor-pointer scale-90"
                    />
                  </label>

                  <label className="flex items-center justify-between text-slate-400 hover:text-slate-200 cursor-pointer">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-0.5 bg-slate-300 inline-block"></span>
                      <span>Residential Streets</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={layerConfig.residentialRoads}
                      onChange={() => onToggleLayer('residentialRoads')}
                      className="rounded border-slate-700 text-slate-300 focus:ring-0 bg-slate-950 cursor-pointer scale-90"
                    />
                  </label>

                  <label className="flex items-center justify-between text-slate-400 hover:text-slate-200 cursor-pointer">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-0.5 bg-slate-500 inline-block"></span>
                      <span>Service / Paths</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={layerConfig.serviceRoads}
                      onChange={() => onToggleLayer('serviceRoads')}
                      className="rounded border-slate-700 text-slate-500 focus:ring-0 bg-slate-950 cursor-pointer scale-90"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Land Use & Zoning */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <div className="flex items-center space-x-2 text-slate-300">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Land Use & Zoning (85)</span>
              </div>
              <input
                type="checkbox"
                checked={layerConfig.landuse}
                onChange={() => onToggleLayer('landuse')}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950 cursor-pointer"
              />
            </label>

            {/* Parks / Green Spaces */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <div className="flex items-center space-x-2 text-slate-300">
                <Trees className="w-3.5 h-3.5 text-emerald-400" />
                <span>Parks & Greenery (64)</span>
              </div>
              <input
                type="checkbox"
                checked={layerConfig.parks}
                onChange={() => onToggleLayer('parks')}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950 cursor-pointer"
              />
            </label>

            {/* Healthcare Facilities */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <div className="flex items-center space-x-2 text-slate-300">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                <span>Healthcare Facilities (19)</span>
              </div>
              <input
                type="checkbox"
                checked={layerConfig.healthcare}
                onChange={() => onToggleLayer('healthcare')}
                className="rounded border-slate-700 text-rose-500 focus:ring-0 bg-slate-950 cursor-pointer"
              />
            </label>

            {/* Educational Institutions */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <div className="flex items-center space-x-2 text-slate-300">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Educational Institutes (16)</span>
              </div>
              <input
                type="checkbox"
                checked={layerConfig.education}
                onChange={() => onToggleLayer('education')}
                className="rounded border-slate-700 text-indigo-500 focus:ring-0 bg-slate-950 cursor-pointer"
              />
            </label>

            {/* Public Transport & Metro */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <div className="flex items-center space-x-2 text-slate-300">
                <Train className="w-3.5 h-3.5 text-cyan-400" />
                <span>Public Transport (32)</span>
              </div>
              <input
                type="checkbox"
                checked={layerConfig.transport}
                onChange={() => onToggleLayer('transport')}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950 cursor-pointer"
              />
            </label>

            {/* Water Bodies & Drainage */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <div className="flex items-center space-x-2 text-slate-300">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Water & Drainage (15)</span>
              </div>
              <input
                type="checkbox"
                checked={layerConfig.water}
                onChange={() => onToggleLayer('water')}
                className="rounded border-slate-700 text-blue-500 focus:ring-0 bg-slate-950 cursor-pointer"
              />
            </label>

            {/* Boundary */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>GMDA Planning Extent</span>
              </div>
              <input
                type="checkbox"
                checked={layerConfig.boundaries}
                onChange={() => onToggleLayer('boundaries')}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950 cursor-pointer"
              />
            </label>
          </div>

          {/* Basemap Surface Provider Selector (Zero API Key Architecture) */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>Basemap (Zero Paid Keys)</span>
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">Free</span>
            </div>
            <div className="grid grid-cols-3 gap-1 font-mono text-[9px]">
              <button
                onClick={() => onSelectBasemap?.('dark')}
                className={`p-1.5 rounded border text-center transition ${
                  layerConfig.basemapStyle === 'dark' || !layerConfig.basemapStyle
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-semibold'
                    : 'bg-slate-800/70 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Esri World Dark Gray Canvas (High-contrast GIS)"
              >
                Dark Canvas
              </button>
              <button
                onClick={() => onSelectBasemap?.('satellite')}
                className={`p-1.5 rounded border text-center transition ${
                  layerConfig.basemapStyle === 'satellite'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-semibold'
                    : 'bg-slate-800/70 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Esri World Imagery (High-res Aerial Satellite Photography)"
              >
                Satellite
              </button>
              <button
                onClick={() => onSelectBasemap?.('osm')}
                className={`p-1.5 rounded border text-center transition ${
                  layerConfig.basemapStyle === 'osm'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-semibold'
                    : 'bg-slate-800/70 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="OpenStreetMap Standard Vector-derived Cartography"
              >
                Street Map
              </button>
            </div>
          </div>

          {/* Quick Camera Bookmarks */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1.5 flex items-center space-x-1">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              <span>Camera Bookmarks (Gurugram)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
              <button
                onClick={() => onFlyToPreset('cybercity')}
                className="p-1.5 rounded bg-slate-800/70 hover:bg-cyan-950 hover:text-cyan-300 text-slate-200 border border-slate-700 text-center truncate transition"
              >
                Cyber City Core
              </button>
              <button
                onClick={() => onFlyToPreset('udyogvihar')}
                className="p-1.5 rounded bg-slate-800/70 hover:bg-cyan-950 hover:text-cyan-300 text-slate-200 border border-slate-700 text-center truncate transition"
              >
                Udyog Vihar
              </button>
              <button
                onClick={() => onFlyToPreset('nh48')}
                className="p-1.5 rounded bg-slate-800/70 hover:bg-cyan-950 hover:text-cyan-300 text-slate-200 border border-slate-700 text-center truncate transition"
              >
                NH-48 Expressway
              </button>
              <button
                onClick={() => onFlyToPreset('overview')}
                className="p-1.5 rounded bg-slate-800/70 hover:bg-cyan-950 hover:text-cyan-300 text-slate-200 border border-slate-700 text-center truncate transition"
              >
                Gurugram Wide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
