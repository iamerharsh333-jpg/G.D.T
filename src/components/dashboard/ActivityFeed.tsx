import React from 'react';
import { Clock, Cpu, Play, Compass, FileCheck } from 'lucide-react';

interface ActivityItem {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  detail: string;
  status: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'simulation':
        return <Play className="w-3.5 h-3.5 text-cyan-400" />;
      case 'infrastructure':
        return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      case 'urban planning':
        return <Compass className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <FileCheck className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-2.5">
      {activities.map((act) => (
        <div
          key={act.id}
          className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition flex items-start space-x-3 select-none text-xs"
        >
          <div className="p-2 rounded-md bg-slate-800/80 mt-0.5">{getIcon(act.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 truncate">{act.title}</span>
              <span className="text-[10px] font-mono text-slate-500 flex items-center space-x-1 flex-shrink-0">
                <Clock className="w-3 h-3" />
                <span>{act.timestamp}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {act.detail}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {act.type}
              </span>
              <span className="text-[9px] font-mono text-emerald-400">● {act.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

