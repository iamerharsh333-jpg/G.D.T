import React, { useState } from 'react';
import {
  Building2,
  X,
  MapPin,
  Ruler,
  Layers,
  Users,
  Compass,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { BuildingData } from '../../types';

interface BuildingDetailPanelProps {
  building: BuildingData | null;
  onClose: () => void;
  onFocusBuilding?: (building: BuildingData) => void;
}

export const BuildingDetailPanel: React.FC<BuildingDetailPanelProps> = ({
  building,
  onClose,
  onFocusBuilding,
}) => {
  const [showRawTags, setShowRawTags] = useState(false);

  if (!building) return null;

  const isReal = building.status === 'REAL OSM DATA';
  const isEstimated = building.height_source === 'estimated';
  const isLevelsDerived = building.height_source === 'levels-derived';
  const isSourceProvided = building.height_source === 'source-provided';

  const osmUrl = building.osm_id
    ? `https://www.openstreetmap.org/${building.osm_id.replace('way/', 'way/').replace('node/', 'node/').replace('relation/', 'relation/')}`
    : null;

  return (
    <div className="w-80 sm:w-92 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-4 flex flex-col space-y-3.5 select-none z-30 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 flex-wrap gap-1">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700/50">
                {building.osm_id || building.id}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                  isReal
                    ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60'
                    : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                }`}
              >
                {building.status}
              </span>
            </div>
            <h3 className="font-semibold text-slate-100 text-sm mt-1 leading-tight">
              {building.name}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Height with Measured / Estimated Source Badge */}
      <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center space-x-1">
            <Ruler className="w-3 h-3 text-cyan-400" />
            <span>EXTRUDED HEIGHT</span>
          </span>
          {/* Height Source Badge */}
          {isEstimated && (
            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[9px] flex items-center space-x-1 font-semibold">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>ESTIMATED HEIGHT</span>
            </span>
          )}
          {isLevelsDerived && (
            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[9px] flex items-center space-x-1 font-semibold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>LEVELS DERIVED</span>
            </span>
          )}
          {isSourceProvided && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] flex items-center space-x-1 font-semibold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>SOURCE MEASURED</span>
            </span>
          )}
        </div>

        <div className="flex items-baseline space-x-2">
          <div className="text-xl font-bold font-mono text-slate-100">
            {building.height} <span className="text-xs font-normal text-slate-400">meters</span>
          </div>
          {building.floors && (
            <span className="text-xs text-slate-400 font-mono">
              ({building.floors} {building.floors === 1 ? 'floor' : 'floors'})
            </span>
          )}
        </div>

        {isEstimated && (
          <p className="text-[10px] text-amber-400/80 leading-tight">
            *Height estimated algorithmically from footprint area ({building.footprintAreaSqm || 'approx'} m²) and building classification.
          </p>
        )}
      </div>

      {/* Spec Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <div className="text-slate-400 text-[10px] font-mono">BUILDING TYPE</div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5 capitalize truncate">
            {building.type || 'Building'}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <div className="text-slate-400 text-[10px] font-mono">LAND-USE INFO</div>
          <div className="text-xs font-semibold text-cyan-300 mt-0.5 capitalize truncate">
            {building.landUse || 'Commercial'}
          </div>
        </div>

        {building.floors !== null && building.floors !== undefined && (
          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <div className="text-slate-400 text-[10px] font-mono">FLOOR LEVELS</div>
            <div className="text-xs font-semibold text-indigo-300 mt-0.5">
              {building.floors} Storeys
            </div>
          </div>
        )}

        {building.footprintAreaSqm && (
          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <div className="text-slate-400 text-[10px] font-mono">FOOTPRINT AREA</div>
            <div className="text-xs font-semibold text-slate-200 mt-0.5">
              {Math.round(building.footprintAreaSqm).toLocaleString()} m²
            </div>
          </div>
        )}
      </div>

      {/* Location & Coordinates */}
      <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>LOCATION</span>
          </div>
          <span className="text-[11px] text-slate-200">{building.sector}</span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          <span>COORDINATES (EPSG:4326)</span>
          <span className="text-slate-300">
            {building.coordinates.lat.toFixed(5)}°N, {building.coordinates.lng.toFixed(5)}°E
          </span>
        </div>
      </div>

      {/* Attribute Provenance & Missing Attribute Indicators */}
      <div className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-800 space-y-2 text-[11px]">
        <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
          <span>Attribute Status & Integrity</span>
          <span className="text-[9px] text-cyan-400 font-mono">OSM Audit</span>
        </div>

        <div className="space-y-1 text-[10px] font-mono">
          {/* Height Indicator */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Height Attribute:</span>
            {isSourceProvided ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Surveyed Tag Present</span>
              </span>
            ) : isLevelsDerived ? (
              <span className="text-cyan-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Derived from Levels Tag</span>
              </span>
            ) : (
              <span className="text-amber-400 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Missing in OSM (Estimated)</span>
              </span>
            )}
          </div>

          {/* Floor count indicator */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Storeys / Levels:</span>
            {building.hasSourceLevels ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Surveyed ({building.floors} fl)</span>
              </span>
            ) : (
              <span className="text-slate-400 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-amber-500/70" />
                <span>Not Recorded in OSM</span>
              </span>
            )}
          </div>

          {/* Name indicator */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Feature Name:</span>
            {building.hasSourceName ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Surveyed Title</span>
              </span>
            ) : (
              <span className="text-slate-400 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-amber-500/70" />
                <span>Unnamed Structure</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Source Attribution */}
      <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Source: {building.dataSource}</span>
        {osmUrl && (
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono"
          >
            <span>View on OSM</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Raw OSM Tags Accordion */}
      {building.rawTags && Object.keys(building.rawTags).length > 0 && (
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowRawTags(!showRawTags)}
            className="w-full px-3 py-2 bg-slate-800/70 hover:bg-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono"
          >
            <div className="flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Raw OSM Tags ({Object.keys(building.rawTags).length})</span>
            </div>
            {showRawTags ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showRawTags && (
            <div className="p-2 bg-slate-950/80 text-[10px] font-mono space-y-1 max-h-36 overflow-y-auto">
              {Object.entries(building.rawTags).map(([k, v]) => (
                <div key={k} className="flex items-start justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">{k}:</span>
                  <span className="text-cyan-300 text-right ml-2 break-all">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-1 flex space-x-2">
        {onFocusBuilding && (
          <button
            onClick={() => onFocusBuilding(building)}
            className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition shadow-lg shadow-cyan-950"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Focus 3D View</span>
          </button>
        )}
        <button
          onClick={onClose}
          className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700"
        >
          Deselect
        </button>
      </div>
    </div>
  );
};
