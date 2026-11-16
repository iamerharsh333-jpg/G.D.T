import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Eye,
  Ruler,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { BuildingData, LandUseCategory } from '../types';

interface BuildingsPageProps {
  buildings: BuildingData[];
  onSelectBuilding: (building: BuildingData) => void;
  onNavigateTo3D: () => void;
}

export const BuildingsPage: React.FC<BuildingsPageProps> = ({
  buildings,
  onSelectBuilding,
  onNavigateTo3D,
}) => {
  const [search, setSearch] = useState('');
  const [selectedLandUse, setSelectedLandUse] = useState<string>('ALL');
  const [minHeight, setMinHeight] = useState<number>(0);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const landUseOptions: ('ALL' | LandUseCategory)[] = [
    'ALL',
    'Commercial',
    'Residential',
    'Mixed Use',
    'Industrial',
    'Institutional',
  ];

  const filteredBuildings = buildings.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.sector && b.sector.toLowerCase().includes(search.toLowerCase())) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      (b.osm_id && b.osm_id.toLowerCase().includes(search.toLowerCase()));
    const matchesLandUse = selectedLandUse === 'ALL' || b.landUse === selectedLandUse;
    const matchesHeight = b.height >= minHeight;
    return matchesSearch && matchesLandUse && matchesHeight;
  });

  const totalPages = Math.ceil(filteredBuildings.length / pageSize);
  const paginatedBuildings = filteredBuildings.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0a0d14] text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold">Building & Spatial Asset Inventory</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{buildings.length.toLocaleString()} REAL OSM FOOTPRINTS</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Actual OpenStreetMap building polygon geometries in Gurugram (Cyber City, Udyog Vihar, DLF Phases)
          </p>
        </div>

        <button
          onClick={onNavigateTo3D}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-lg shadow-cyan-950 transition self-start sm:self-auto"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View All in 3D City Map</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by building name, OSM ID (e.g. way/123456) or sector..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-mono placeholder-slate-500 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Land-use category filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedLandUse}
            onChange={(e) => {
              setSelectedLandUse(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {landUseOptions.map((opt) => (
              <option key={opt} value={opt}>
                Land Use: {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Min height filter slider */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-mono">
          <span className="text-slate-400 text-[11px]">Min Height: {minHeight}m</span>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={minHeight}
            onChange={(e) => {
              setMinHeight(Number(e.target.value));
              setPage(1);
            }}
            className="w-24 accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Building Table Grid */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>
            Showing {filteredBuildings.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(page * pageSize, filteredBuildings.length)} of {filteredBuildings.length} Features
          </span>
          <span className="text-emerald-400 text-[10px] flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>OpenStreetMap Contributors (ODbL)</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">OSM ID</th>
                <th className="py-2.5 px-4">Name / Location</th>
                <th className="py-2.5 px-4">Building Type</th>
                <th className="py-2.5 px-4">Height & Source</th>
                <th className="py-2.5 px-4">Floors</th>
                <th className="py-2.5 px-4">Land Use</th>
                <th className="py-2.5 px-4">Footprint Area</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedBuildings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-cyan-400">
                    {b.osm_id || b.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-sans font-medium text-slate-200">{b.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{b.sector}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 capitalize">{b.type}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-200 font-bold">
                      <Ruler className="w-3 h-3 text-cyan-400" />
                      <span>{b.height}m</span>
                      {b.height_source === 'estimated' ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                          Est.
                        </span>
                      ) : (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Measured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1 text-slate-200">
                      <Layers className="w-3 h-3 text-indigo-400" />
                      <span>{b.floors ? `${b.floors} fl` : '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border capitalize ${
                        b.landUse === 'Commercial'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : b.landUse === 'Residential'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {b.landUse}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {b.footprintAreaSqm ? `${Math.round(b.footprintAreaSqm).toLocaleString()} m²` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        onSelectBuilding(b);
                        onNavigateTo3D();
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-[11px] transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Focus 3D</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
