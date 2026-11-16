import React, { useState } from 'react';
import {
  Compass,
  PlusCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export const UrbanPlanningPage: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState('SCENARIO-A');

  const scenarios = [
    {
      id: 'SCENARIO-A',
      name: 'Transit-Oriented Densification (Sector 56 - Golf Course Ext)',
      status: 'Proposed Draft',
      author: 'GMDA Urban Planning Cell (Demo)',
      impacts: {
        commercialFAR: '+25% FAR Enhancement',
        greenSpaceBuffer: '+18 Hectares',
        transitAccessGain: '+42,000 Commuters within 500m',
        estimatedCost: '₹ 1,450 Cr (Demo)',
      },
      proposals: [
        'High-density mixed-use zoning within 800m of Sector 55-56 Metro Station',
        'Pedestrian elevated skywalk connecting residential sectors to rapid transit',
        'Subsurface rainwater harvesting vaults along road reserves',
      ],
    },
    {
      id: 'SCENARIO-B',
      name: 'Southern Peripheral Road (SPR) Ecological Buffer Corridor',
      status: 'Feasibility Review',
      author: 'Haryana Forest & Environment Dept (Demo)',
      impacts: {
        commercialFAR: 'Neutral / Standard FAR',
        greenSpaceBuffer: '+65 Hectares Urban Forest',
        transitAccessGain: 'Dedicated Non-Motorized Transport (NMT)',
        estimatedCost: '₹ 380 Cr (Demo)',
      },
      proposals: [
        '50-meter dense afforestation buffer along Southern Peripheral Road',
        'Continuous bicycle superhighway connecting Aravalli trail to Manesar',
        'Bio-retention swales to mitigate monsoon flash-flooding at junctions',
      ],
    },
    {
      id: 'SCENARIO-C',
      name: 'Old Gurugram Redevelopment & Smart Grid Pilot',
      status: 'Initial Concept',
      author: 'Smart City Mission Gurugram (Demo)',
      impacts: {
        commercialFAR: '+15% Structured Renewal',
        greenSpaceBuffer: '+8 Hectares Pocket Parks',
        transitAccessGain: 'EV Feeder Shuttle Network',
        estimatedCost: '₹ 820 Cr (Demo)',
      },
      proposals: [
        'Underground cabling of 11kV electrical distribution wires in Sector 14/15',
        'Automated multi-level car parking near Sadar Bazar',
        'Rejuvenation of historical water stepwells and urban ponds',
      ],
    },
  ];

  const current = scenarios.find((s) => s.id === activeScenario) || scenarios[0];

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0a0d14] text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold">Urban Planning & What-If Scenario Modeling</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-semibold">
              SCENARIO WORKBENCH
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Parametric simulation for proposed master plans, zoning revisions, and green buffer corridors
          </p>
        </div>

        <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-lg shadow-cyan-950 transition self-start sm:self-auto">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Proposal Draft</span>
        </button>
      </div>

      {/* Synthetic Banner */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center space-x-2">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span>
          What-if scenarios represent illustrative architectural design proposals for digital twin evaluation. These do not represent approved governmental statutory notifications.
        </span>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveScenario(s.id)}
            className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
              activeScenario === s.id
                ? 'bg-[#0f172a] border-cyan-500 shadow-xl shadow-cyan-950/20 ring-1 ring-cyan-500/50'
                : 'bg-[#0f172a]/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400">{s.id}</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {s.status}
                </span>
              </div>
              <h3 className="font-semibold text-slate-100 text-xs mt-2 leading-snug">
                {s.name}
              </h3>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
              {s.author}
            </div>
          </button>
        ))}
      </div>

      {/* Active Scenario Detail Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-cyan-400">{current.id}</span>
            <h2 className="text-base font-bold text-white mt-0.5">{current.name}</h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Scenario Loaded</span>
          </span>
        </div>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">ZONING DENSITY EFFECT</span>
            <span className="text-sm font-bold text-cyan-400 mt-1 block">
              {current.impacts.commercialFAR}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">GREEN SPACE GAIN</span>
            <span className="text-sm font-bold text-emerald-400 mt-1 block">
              {current.impacts.greenSpaceBuffer}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">TRANSIT PROXIMITY</span>
            <span className="text-sm font-bold text-indigo-300 mt-1 block">
              {current.impacts.transitAccessGain}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">CAPITAL OUTLAY (DEMO)</span>
            <span className="text-sm font-bold text-amber-400 mt-1 block">
              {current.impacts.estimatedCost}
            </span>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-200 font-mono uppercase">
            Masterplan Interventions in This Scenario:
          </h4>
          <div className="space-y-2">
            {current.proposals.map((prop, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-[10px] flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{prop}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
