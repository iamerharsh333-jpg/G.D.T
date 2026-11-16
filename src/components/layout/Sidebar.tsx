import React from 'react';
import {
  LayoutDashboard,
  Globe2,
  Building,
  Navigation,
  Activity,
  Users,
  Leaf,
  SlidersHorizontal,
  Compass,
  FileBarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ActiveView } from '../../types';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
}) => {
  const menuItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: '3d-city', label: '3D City View', icon: <Globe2 className="w-4 h-4 text-cyan-400" />, badge: '3D' },
    { id: 'buildings', label: 'Buildings', icon: <Building className="w-4 h-4" /> },
    { id: 'roads', label: 'Roads & Mobility', icon: <Navigation className="w-4 h-4" /> },
    { id: 'infrastructure', label: 'Infrastructure', icon: <Activity className="w-4 h-4" /> },
    { id: 'population', label: 'Population', icon: <Users className="w-4 h-4" /> },
    { id: 'environment', label: 'Environment', icon: <Leaf className="w-4 h-4" /> },
    { id: 'traffic', label: 'Traffic Simulation', icon: <SlidersHorizontal className="w-4 h-4" />, badge: 'Sim' },
    { id: 'urban-planning', label: 'Urban Planning', icon: <Compass className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <FileBarChart2 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`relative bg-[#0d1527] border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
        <div className={`px-2 pb-2 text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider ${
          isCollapsed ? 'text-center' : ''
        }`}>
          {isCollapsed ? 'NAV' : 'MODULES & VIEWS'}
        </div>

        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center rounded-lg transition-all text-xs font-medium group relative ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-300 border border-cyan-800/60 shadow-md shadow-cyan-950/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={`${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {item.icon}
              </span>

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Active Indicator Bar on Left */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-cyan-400"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-slate-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="px-2">
            <div className="text-[10px] text-slate-400 font-mono">GURUGRAM TWIN</div>
            <div className="text-[9px] text-slate-500 font-mono">Status: Local Standalone</div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

