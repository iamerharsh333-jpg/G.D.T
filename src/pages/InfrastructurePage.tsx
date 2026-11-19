import React, { useState } from 'react';
import {
  Activity,
  HeartPulse,
  GraduationCap,
  Trees,
  Train,
  MapPin,
  Eye,
  CheckCircle2,
  Droplets,
  Layers,
} from 'lucide-react';
import { InfrastructureCategory, InfrastructurePoint } from '../types';

interface InfrastructurePageProps {
  infrastructure: InfrastructurePoint[];
  onNavigateTo3D: () => void;
}

export const InfrastructurePage: React.FC<InfrastructurePageProps> = ({
  infrastructure,
  onNavigateTo3D,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'Healthcare Facility',
    'Educational Institution',
    'Public Transport',
    'Parks & Greenery',
    'Water Body & Drainage',
    'Land Use & Zoning',
  ];

  const filteredItems =
    activeCategory === 'ALL'
      ? infrastructure
      : infrastructure.filter((item) => item.category === activeCategory);

  const getCategoryIcon = (category: InfrastructureCategory) => {
    switch (category) {
      case 'Healthcare Facility':
      case 'Hospital':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'Educational Institution':
      case 'School / University':
        return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      case 'Public Transport':
      case 'Rapid Transit / Metro':
        return <Train className="w-4 h-4 text-cyan-400" />;
      case 'Parks & Greenery':
      case 'Park / Green Space':
        return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'Water Body & Drainage':
      case 'Water Body':
        return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'Land Use & Zoning':
      default:
        return <Layers className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0a0d14] text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold">Public & Critical Infrastructure Asset Map</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{infrastructure.length} REAL OSM INFRASTRUCTURE ASSETS</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Hospitals, Rapid Metro Gurgaon stations, schools, urban green reserves, water retention ponds, and zoning sectors
          </p>
        </div>

        <button
          onClick={onNavigateTo3D}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-lg shadow-cyan-950 transition self-start sm:self-auto font-mono"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Markers in 3D</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              activeCategory === cat
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Facility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-slate-800/90">{getCategoryIcon(item.category)}</div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {item.category}
                  </span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex items-center space-x-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{item.operationalStatus}</span>
                </span>
              </div>

              <h3 className="font-semibold text-slate-100 text-sm mt-3">{item.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>Sector:</span>
                </div>
                <span className="font-medium text-slate-200">{item.sector}</span>
              </div>

              {item.capacity && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 text-[11px]">Capacity:</span>
                  <span className="text-cyan-400">{item.capacity}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
                <span>ID: {item.id}</span>
                <span>
                  {item.lat.toFixed(4)}°N, {item.lng.toFixed(4)}°E
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

