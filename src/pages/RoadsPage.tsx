import React, { useState } from 'react';
import {
  Navigation,
  Eye,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { RoadData } from '../types';

interface RoadsPageProps {
  roads: RoadData[];
  onNavigateTo3D: () => void;
}

export const RoadsPage: React.FC<RoadsPageProps> = ({ roads, onNavigateTo3D }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'Motorway / Expressway',
    'Primary / Secondary Arterial',
    'Tertiary / Sector Road',
    'Residential Street',
    'Service / Pedestrian Path',
  ];

  const filteredRoads =
    selectedCategory === 'ALL'
      ? roads
      : roads.filter((r) => r.category === selectedCategory);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0a0d14] text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-bold">Road Network & Highway Infrastructure</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>1,225 REAL OSM CORRIDORS</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Actual Delhi-Gurugram Expressway (NH-48), Cyber City arterials, sector links, and residential street vectors
          </p>
        </div>

        <button
          onClick={onNavigateTo3D}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-lg shadow-cyan-950 transition self-start sm:self-auto"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View 3D Corridors</span>
        </button>
      </div>

      {/* Mobility Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">OSM Road Features</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">1,225 Lines</div>
          <div className="text-[11px] text-cyan-400 mt-1 font-mono">Real vector geometries</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Expressway Spine</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">NH-48 Expressway</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">12 Motorway links mapped</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Arterial Roads</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">53 Segments</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Primary & secondary connectors</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Internal Grid</div>
          <div className="text-2xl font-bold font-mono text-slate-200 mt-1">944 Streets</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Residential & service networks</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              selectedCategory === cat
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Roads List Cards */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
          <span>Catalogued OSM Road Corridors ({filteredRoads.length})</span>
          <span className="text-emerald-400 text-[10px]">OpenStreetMap Contributors (ODbL)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoads.slice(0, 30).map((road) => (
            <div
              key={road.id}
              className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {road.osm_id || road.id}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                      road.visualPriority === 1
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : road.visualPriority === 2
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {road.highwayType || 'road'}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-100 text-sm mt-2">{road.name}</h3>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Category: {road.category}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">LANES</span>
                  <span className="text-slate-200 font-bold">{road.lanes} lanes</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">SPEED</span>
                  <span className="text-cyan-400 font-bold">{road.speedLimitKmph} km/h</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">SURFACE</span>
                  <span className="text-slate-300 font-medium truncate">{road.surfaceType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
