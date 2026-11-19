import React, { useState } from 'react';
import {
  Activity,
  X,
  MapPin,
  ExternalLink,
  Tag,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Compass,
  Train,
  GraduationCap,
  HeartPulse,
  Trees,
  Droplets,
  Layers,
} from 'lucide-react';
import { InfrastructurePoint } from '../../types';

interface InfrastructureDetailPanelProps {
  infrastructure: InfrastructurePoint | null;
  onClose: () => void;
  onFocus?: (item: InfrastructurePoint) => void;
}

export const InfrastructureDetailPanel: React.FC<InfrastructureDetailPanelProps> = ({
  infrastructure,
  onClose,
  onFocus,
}) => {
  const [showRawTags, setShowRawTags] = useState(false);

  if (!infrastructure) return null;

  const osmUrl = infrastructure.osm_id
    ? `https://www.openstreetmap.org/${infrastructure.osm_id.replace('way/', 'way/').replace('node/', 'node/').replace('relation/', 'relation/')}`
    : null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Healthcare Facility':
      case 'Hospital':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'Educational Institution':
      case 'School / University':
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case 'Public Transport':
      case 'Rapid Transit / Metro':
        return <Train className="w-5 h-5 text-cyan-400" />;
      case 'Parks & Greenery':
      case 'Park / Green Space':
        return <Trees className="w-5 h-5 text-emerald-400" />;
      case 'Water Body & Drainage':
      case 'Water Body':
        return <Droplets className="w-5 h-5 text-blue-400" />;
      default:
        return <Layers className="w-5 h-5 text-amber-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Healthcare Facility':
      case 'Hospital':
        return 'bg-rose-950/80 border-rose-800/60 text-rose-300';
      case 'Educational Institution':
      case 'School / University':
        return 'bg-indigo-950/80 border-indigo-800/60 text-indigo-300';
      case 'Public Transport':
      case 'Rapid Transit / Metro':
        return 'bg-cyan-950/80 border-cyan-800/60 text-cyan-300';
      case 'Parks & Greenery':
      case 'Park / Green Space':
        return 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300';
      case 'Water Body & Drainage':
      case 'Water Body':
        return 'bg-blue-950/80 border-blue-800/60 text-blue-300';
      default:
        return 'bg-amber-950/80 border-amber-800/60 text-amber-300';
    }
  };

  return (
    <div className="w-80 sm:w-92 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-4 flex flex-col space-y-3.5 select-none z-30 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700/60">
            {getCategoryIcon(infrastructure.category)}
          </div>
          <div>
            <div className="flex items-center space-x-1.5 flex-wrap gap-1">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {infrastructure.osm_id || infrastructure.id}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>REAL OSM DATA</span>
              </span>
            </div>
            <h3 className="font-semibold text-slate-100 text-sm mt-1 leading-tight">
              {infrastructure.name}
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

      {/* Category Banner */}
      <div className={`p-3 rounded-lg border ${getCategoryColor(infrastructure.category)} space-y-1`}>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          GIS INFRASTRUCTURE CLASSIFICATION
        </div>
        <div className="text-sm font-bold font-mono text-white">
          {infrastructure.category}
        </div>
        {infrastructure.subType && (
          <div className="text-[11px] font-mono text-slate-300">
            OSM Tag: <span className="font-semibold text-white capitalize">{infrastructure.subType}</span>
          </div>
        )}
      </div>

      {/* Operator / Network Info if available */}
      {(infrastructure.operator || infrastructure.network) && (
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-1 text-xs font-mono">
          {infrastructure.operator && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">OPERATOR:</span>
              <span className="text-slate-200 font-semibold text-right truncate ml-2">
                {infrastructure.operator}
              </span>
            </div>
          )}
          {infrastructure.network && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">TRANSIT NETWORK:</span>
              <span className="text-cyan-300 font-semibold text-right truncate ml-2">
                {infrastructure.network}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Geometry & Coordinates */}
      <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>LOCATION</span>
          </div>
          <span className="text-[11px] text-slate-200">{infrastructure.sector || 'DLF Cyber City / Sector 14-25'}</span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          <span>COORDINATES (EPSG:4326)</span>
          <span className="text-slate-300">
            {infrastructure.lat.toFixed(5)}°N, {infrastructure.lng.toFixed(5)}°E
          </span>
        </div>
      </div>

      {/* Attribute Status & Integrity Audit */}
      <div className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-800 space-y-2 text-[11px]">
        <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
          <span>Attribute Status & Integrity</span>
          <span className="text-[9px] text-cyan-400 font-mono">OSM Audit</span>
        </div>

        <div className="space-y-1 text-[10px] font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Feature Name:</span>
            {infrastructure.hasSourceName ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Surveyed Title</span>
              </span>
            ) : (
              <span className="text-slate-400 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-amber-500/70" />
                <span>Generic Identifier</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Source Dataset:</span>
            <span className="text-cyan-400 font-semibold truncate ml-2">Overpass Turbo (ODbL)</span>
          </div>
        </div>
      </div>

      {/* Source Attribution & Link */}
      <div className="p-2.5 rounded bg-slate-800/50 border border-slate-700/50 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span className="truncate mr-2">Verified OpenStreetMap Feature</span>
        {osmUrl && (
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 flex-shrink-0"
          >
            <span>OSM Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Raw OSM Tags Accordion */}
      {infrastructure.rawTags && Object.keys(infrastructure.rawTags).length > 0 && (
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowRawTags(!showRawTags)}
            className="w-full px-3 py-2 bg-slate-800/70 hover:bg-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono"
          >
            <div className="flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Raw OSM Tags ({Object.keys(infrastructure.rawTags).length})</span>
            </div>
            {showRawTags ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showRawTags && (
            <div className="p-2 bg-slate-950/80 text-[10px] font-mono space-y-1 max-h-36 overflow-y-auto">
              {Object.entries(infrastructure.rawTags).map(([k, v]) => (
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
        {onFocus && (
          <button
            onClick={() => onFocus(infrastructure)}
            className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition shadow-lg shadow-cyan-950 font-mono"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Focus 3D View</span>
          </button>
        )}
        <button
          onClick={onClose}
          className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700 font-mono"
        >
          Deselect
        </button>
      </div>
    </div>
  );
};

