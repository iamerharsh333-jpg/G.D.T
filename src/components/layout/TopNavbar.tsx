import React, { useState } from 'react';
import {
  Layers,
  Search,
  Bell,
  Sun,
  Moon,
  Compass,
  CheckCircle2,
  ChevronDown,
  Building2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { BuildingData, InfrastructurePoint } from '../../types';

interface TopNavbarProps {
  onSearchSelect?: (item: { type: 'building' | 'infrastructure'; data: BuildingData | InfrastructurePoint }) => void;
  onResetView?: () => void;
  onOpenAuditModal?: () => void;
  buildings: BuildingData[];
  infrastructure: InfrastructurePoint[];
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onSearchSelect,
  onResetView,
  onOpenAuditModal,
  buildings,
  infrastructure,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isNightMode, setIsNightMode] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const filteredBuildings = searchQuery.trim()
    ? buildings
        .filter(
          (b) =>
            b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.sector && b.sector.toLowerCase().includes(searchQuery.toLowerCase())) ||
            b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.osm_id && b.osm_id.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 8)
    : [];

  const filteredInfra = searchQuery.trim()
    ? infrastructure
        .filter(
          (i) =>
            i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (i.sector && i.sector.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  return (
    <header className="h-14 bg-[#0d1527] border-b border-slate-800 flex items-center justify-between px-4 z-40 select-none">
      {/* Brand & City Selector */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-wider text-white uppercase">
                Gurugram Digital Twin
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>OSM GEOSPATIAL DATA</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1.5">
              <span>NCR URBAN INTELLIGENCE · DLF CYBER CITY & UDYOG VIHAR</span>
            </div>
          </div>
        </div>

        {/* City Selector */}
        <div className="hidden lg:flex items-center space-x-1 bg-slate-900/90 border border-slate-700/60 rounded-md px-2.5 py-1 text-xs">
          <span className="text-slate-400 text-[11px]">Region:</span>
          <span className="text-cyan-400 font-medium font-mono">Gurugram (NCR)</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative flex-1 max-w-md mx-6">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search 3,050 actual buildings, OSM IDs, roads, parks..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              className="absolute right-2.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Autocomplete dropdown */}
        {showSearchResults && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
            <div className="p-2 border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400 flex justify-between">
              <span>Matching OSM Features</span>
              <span>{filteredBuildings.length + filteredInfra.length} Results</span>
            </div>

            {filteredBuildings.map((bld) => (
              <button
                key={bld.id}
                onClick={() => {
                  onSearchSelect?.({ type: 'building', data: bld });
                  setShowSearchResults(false);
                  setSearchQuery(bld.name);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800/80 flex items-center justify-between border-b border-slate-800/40 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <div className="text-slate-200 font-medium">{bld.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {bld.type} · {bld.height}m ({bld.height_source})
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                  {bld.osm_id || bld.id}
                </span>
              </button>
            ))}

            {filteredInfra.map((inf) => (
              <button
                key={inf.id}
                onClick={() => {
                  onSearchSelect?.({ type: 'infrastructure', data: inf });
                  setShowSearchResults(false);
                  setSearchQuery(inf.name);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800/80 flex items-center justify-between border-b border-slate-800/40 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <div>
                    <div className="text-slate-200 font-medium">{inf.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {inf.category} · {inf.sector}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                  {inf.category}
                </span>
              </button>
            ))}

            {filteredBuildings.length === 0 && filteredInfra.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400 font-mono">
                No features found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Indicators & Controls */}
      <div className="flex items-center space-x-3">
        {/* Reset View Button */}
        {onResetView && (
          <button
            onClick={onResetView}
            title="Reset 3D camera to Gurugram default view"
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline font-mono text-[11px]">Reset View</span>
          </button>
        )}

        {/* Validation & Audit Button */}
        {onOpenAuditModal && (
          <button
            onClick={onOpenAuditModal}
            title="Inspect Geospatial Validation, Heights & Source Provenance"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-mono transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-[11px] tracking-wide">Data Audit</span>
          </button>
        )}

        {/* Real Data Status Tag */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-[11px] tracking-wide">REAL DATASET</span>
        </div>

        {/* Day / Night Toggle */}
        <button
          onClick={() => setIsNightMode(!isNightMode)}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title={isNightMode ? 'Night view active' : 'Daylight view active'}
        >
          {isNightMode ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition relative"
            title="System Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white font-mono uppercase">OSM Data Ingestion Status</span>
                <span className="text-[10px] text-emerald-400 font-mono">Live</span>
              </div>
              <div className="space-y-2 mt-2 text-xs">
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50">
                  <div className="text-emerald-400 text-[11px] font-medium flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Real OSM Geometries Active</span>
                  </div>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    3,050 real building polygons, 1,225 highway segments, parks & water bodies loaded from `public/data/`.
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50">
                  <div className="text-cyan-400 text-[11px] font-medium">Height Source Tracking</div>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Measured heights preserved; missing heights estimated algorithmically based on building footprint area.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-semibold text-cyan-400 font-mono">
            OP
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-[11px] font-medium text-slate-200 leading-tight">Admin Operator</div>
            <div className="text-[9px] text-slate-400 font-mono">GMDA Control Hub</div>
          </div>
        </div>
      </div>
    </header>
  );
};
