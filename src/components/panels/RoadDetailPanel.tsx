import React, { useState } from 'react';
import {
  Navigation,
  X,
  Gauge,
  Layers,
  MapPin,
  ExternalLink,
  Tag,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { RoadData } from '../../types';

interface RoadDetailPanelProps {
  road: RoadData | null;
  onClose: () => void;
}

export const RoadDetailPanel: React.FC<RoadDetailPanelProps> = ({ road, onClose }) => {
  const [showRawTags, setShowRawTags] = useState(false);

  if (!road) return null;

  const osmUrl = road.osm_id
    ? `https://www.openstreetmap.org/${road.osm_id.replace('way/', 'way/').replace('node/', 'node/').replace('relation/', 'relation/')}`
    : null;

  return (
    <div className="w-80 sm:w-92 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-4 flex flex-col space-y-3.5 select-none z-30 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 flex-wrap gap-1">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                {road.osm_id || road.id}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>REAL OSM ROAD</span>
              </span>
            </div>
            <h3 className="font-semibold text-slate-100 text-sm mt-1 leading-tight">
              {road.name}
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

      {/* Highway Classification Banner */}
      <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1">
        <div className="text-[10px] font-mono text-slate-400 uppercase">HIGHWAY CLASSIFICATION</div>
        <div className="text-sm font-bold font-mono text-cyan-400">{road.category}</div>
        <div className="text-[11px] text-slate-400 font-mono">
          OSM Highway Tag: <span className="text-slate-200 font-semibold">{road.highwayType || 'road'}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <div className="text-slate-400 text-[10px] flex items-center space-x-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>LANES</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">
            {road.lanes} {road.lanes === 1 ? 'lane' : 'lanes'}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <div className="text-slate-400 text-[10px] flex items-center space-x-1">
            <Gauge className="w-3 h-3 text-amber-400" />
            <span>MAX SPEED</span>
          </div>
          <div className="text-sm font-bold text-amber-400 mt-0.5">
            {road.speedLimitKmph} km/h
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <div className="text-slate-400 text-[10px]">SURFACE TYPE</div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {road.surfaceType || 'Asphalt'}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <div className="text-slate-400 text-[10px]">COORDINATE VERTICES</div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5">
            {road.coordinates?.length || 2} Points
          </div>
        </div>
      </div>

      {/* Source Attribution */}
      <div className="p-2.5 rounded bg-slate-800/50 border border-slate-700/50 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified OpenStreetMap LineString</span>
        </div>
        {osmUrl && (
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>OSM Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Raw OSM Tags Accordion */}
      {road.rawTags && Object.keys(road.rawTags).length > 0 && (
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowRawTags(!showRawTags)}
            className="w-full px-3 py-2 bg-slate-800/70 hover:bg-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono"
          >
            <div className="flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Raw OSM Tags ({Object.keys(road.rawTags).length})</span>
            </div>
            {showRawTags ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showRawTags && (
            <div className="p-2 bg-slate-950/80 text-[10px] font-mono space-y-1 max-h-36 overflow-y-auto">
              {Object.entries(road.rawTags).map(([k, v]) => (
                <div key={k} className="flex items-start justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">{k}:</span>
                  <span className="text-cyan-300 text-right ml-2 break-all">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Close button */}
      <div className="pt-1">
        <button
          onClick={onClose}
          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700 font-mono"
        >
          Deselect Road
        </button>
      </div>
    </div>
  );
};

