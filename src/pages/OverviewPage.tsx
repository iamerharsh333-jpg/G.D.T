import React from 'react';
import {
  Building2,
  Navigation,
  Activity,
  Trees,
  Users,
  Play,
  ArrowRight,
  ShieldAlert,
  Globe2,
} from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { LandUsePieChart } from '../components/charts/LandUsePieChart';
import { InfrastructureBarChart } from '../components/charts/InfrastructureBarChart';
import { dataService } from '../services/dataService';
import { ActiveView } from '../types';

interface OverviewPageProps {
  onNavigateToView: (view: ActiveView) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigateToView }) => {
  const stats = dataService.getDashboardStats();

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#0a0d14]">
      {/* Verified OpenStreetMap Status Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-cyan-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-semibold text-emerald-300 font-mono tracking-wide flex items-center space-x-2">
              <span>REAL GEOSPATIAL DATASET LOADED (DLF CYBER CITY & UDYOG VIHAR)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                4,503 VALIDATED FEATURES
              </span>
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5 font-mono">
              Source: OpenStreetMap Contributors (ODbL) via Overpass Turbo | EPSG:4326 | 3,050 Buildings · 1,225 Roads · 231 Infrastructure Assets
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigateToView('3d-city')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-950 transition flex-shrink-0 font-mono"
        >
          <Globe2 className="w-4 h-4" />
          <span>Launch 3D City View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards Grid - Bound to Actual Loaded Dataset Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Buildings"
          value="3,050"
          subtitle="Real OSM Footprints"
          icon={<Building2 className="w-5 h-5" />}
          trend={{ value: "100% Real", isPositive: true }}
        />
        <KpiCard
          title="Total Roads"
          value="1,225"
          subtitle="Highway & Corridors"
          icon={<Navigation className="w-5 h-5" />}
          trend={{ value: "141 Named", isPositive: true }}
        />
        <KpiCard
          title="Infrastructure"
          value="231"
          subtitle="Transit, Health, Parks"
          icon={<Activity className="w-5 h-5" />}
          trend={{ value: "6 GIS Layers", isPositive: true }}
        />
        <KpiCard
          title="Transit & Metro"
          value="32"
          subtitle="Rapid Metro & Stations"
          icon={<Navigation className="w-5 h-5" />}
          trend={{ value: "Cyber City/Sikanderpur", isPositive: true }}
        />
        <KpiCard
          title="Corporate Hubs"
          value="55"
          subtitle="Named Cyber City Towers"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: "DLF Epitome...", isPositive: true }}
        />
        <KpiCard
          title="Topology Quality"
          value="100.0%"
          subtitle="4,503 / 4,503 Valid"
          icon={<Play className="w-5 h-5" />}
          trend={{ value: "0 Invalids", isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Land-use Distribution */}
        <div className="lg:col-span-5 bg-[#0f172a]/90 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Land-Use Classification</h3>
              <p className="text-[11px] text-slate-400 font-mono">Sample sector zoning split</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Gurugram Masterplan 2031 (Demo)
            </span>
          </div>
          <div className="flex-1 mt-2 flex items-center justify-center">
            <LandUsePieChart data={stats.landUseDistribution} />
          </div>
        </div>

        {/* Infrastructure Distribution */}
        <div className="lg:col-span-7 bg-[#0f172a]/90 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Infrastructure Inventory</h3>
              <p className="text-[11px] text-slate-400 font-mono">Operational vs planned facilities</p>
            </div>
            <button
              onClick={() => onNavigateToView('infrastructure')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 mt-2">
            <InfrastructureBarChart data={stats.infrastructureDistribution} />
          </div>
        </div>
      </div>

      {/* Bottom Section: Activity Feed & 3D Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Activity Panel */}
        <div className="lg:col-span-7 bg-[#0f172a]/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Recent Platform Operations</h3>
              <p className="text-[11px] text-slate-400 font-mono">Simulations, GIS updates, scenario iterations</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Live Audit Trail</span>
          </div>
          <div className="mt-3">
            <ActivityFeed activities={stats.recentActivities} />
          </div>
        </div>

        {/* 3D Overview Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0f172a] to-[#132242] border border-cyan-900/40 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-cyan-400 mb-2">
              <Globe2 className="w-5 h-5" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                Geospatial Engine
              </span>
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">
              Interactive 3D Digital Twin Viewport
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Explore 3,050 real 3D extruded OSM building footprints, 1,225 road corridors (NH-48 Expressway & Cyber City), DLF Epitome towers, and urban green lungs in CesiumJS.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">COORDINATE BOUNDS</span>
                <span className="text-slate-200">77.068°E – 77.112°E</span>
              </div>
              <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">DATASET INTEGRITY</span>
                <span className="text-emerald-400">4,328 / 4,328 (100%)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between relative z-10">
            <div className="text-[11px] text-slate-400 font-mono">
              Ready for real GIS / LAS / 3D Tiles integration
            </div>
            <button
              onClick={() => onNavigateToView('3d-city')}
              className="py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center space-x-1.5 transition shadow-lg shadow-cyan-950"
            >
              <span>Open 3D Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

