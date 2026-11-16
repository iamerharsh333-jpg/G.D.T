import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  Gauge,
  Clock,
  Car,
  ShieldAlert,
} from 'lucide-react';
import { dataService } from '../services/dataService';

export const TrafficSimulationPage: React.FC = () => {
  const simData = dataService.getSimulationData();
  const [selectedPreset, setSelectedPreset] = useState<string>(simData.simulationPresets[0].id);
  const [vehicleVolume, setVehicleVolume] = useState<number>(simData.defaultParameters.vehicleVolume);
  const [roadCapacity, setRoadCapacity] = useState<number>(simData.defaultParameters.roadCapacityUtilization);
  const [transitShare, setTransitShare] = useState<number>(simData.defaultParameters.transitShare);
  const [weatherCondition, setWeatherCondition] = useState<string>('Clear');

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [simResults, setSimResults] = useState<{
    avgSpeedKmph: number;
    delayIndex: string;
    levelOfService: string;
    queueLengthMeters: number;
    emissionsSurgePct: number;
  } | null>(null);

  const handleApplyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const p = simData.simulationPresets.find((x) => x.id === presetId);
    if (p) {
      setVehicleVolume(Math.round(simData.defaultParameters.vehicleVolume * p.vehicleVolumeMultiplier));
      setWeatherCondition(p.weatherCondition.includes('Rain') ? 'Rain' : 'Clear');
      setTransitShare(p.publicTransitLoadPct > 80 ? 42 : 28);
    }
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setProgress(0);
    setSimResults(null);
    setProgressStep('Synthesizing dynamic origin-destination trip matrices...');

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) {
          setProgressStep('Simulating NH-48 and Golf Course bottleneck flow dynamics...');
          return prev + 15;
        } else if (prev < 70) {
          setProgressStep('Analyzing intersection signal queues at IFFCO Chowk & Rajiv Chowk...');
          return prev + 20;
        } else if (prev < 95) {
          setProgressStep('Aggregating macro travel-time index and level of service (LOS)...');
          return prev + 15;
        } else {
          clearInterval(interval);
          setIsRunning(false);
          setProgressStep('Simulation completed successfully.');
          // Generate realistic calculated results based on user inputs
          const speedFactor = Math.max(10, Math.round(55 - (vehicleVolume / 90000) * 28 - (weatherCondition === 'Rain' ? 12 : 0)));
          setSimResults({
            avgSpeedKmph: speedFactor,
            delayIndex: speedFactor < 20 ? '3.4x Delay' : '1.6x Delay',
            levelOfService: speedFactor < 15 ? 'LOS F (Forced Flow)' : speedFactor < 25 ? 'LOS E (Unstable)' : 'LOS C (Stable)',
            queueLengthMeters: Math.round((vehicleVolume / 500) * (weatherCondition === 'Rain' ? 18 : 12)),
            emissionsSurgePct: Math.round(((100 - speedFactor) / 2)),
          });
          return 100;
        }
      });
    }, 400);
  };

  const handleReset = () => {
    setVehicleVolume(simData.defaultParameters.vehicleVolume);
    setRoadCapacity(simData.defaultParameters.roadCapacityUtilization);
    setTransitShare(simData.defaultParameters.transitShare);
    setWeatherCondition('Clear');
    setSimResults(null);
    setProgress(0);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0a0d14] text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold">Urban Traffic & Mobility Simulation Engine</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold">
              ILLUSTRATIVE SIMULATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Parametric macroscopic traffic modeling for arterial corridors, chokepoints and weather events
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Inputs</span>
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold shadow-lg transition ${
              isRunning
                ? 'bg-cyan-800 opacity-60 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950 cursor-pointer'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Synthetic Label Warning */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center space-x-2">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span>
          Simulation outputs are illustrative algorithmic models for demonstration purposes. Real-world traffic management will require live IoT sensor feeds and calibrated microscopic simulators (e.g. SUMO).
        </span>
      </div>

      {/* Preset Scenarios */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase text-slate-400">Select Planning Preset Scenario</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {simData.simulationPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedPreset === preset.id
                  ? 'bg-cyan-950/40 border-cyan-700 shadow-md'
                  : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-cyan-400">{preset.id}</span>
                <h4 className="font-semibold text-slate-200 text-xs mt-1">{preset.name}</h4>
                <div className="text-[11px] text-slate-400 mt-1">Corridor: {preset.targetCorridor}</div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Weather: {preset.weatherCondition}</span>
                <span className="text-amber-400">{preset.delayFactor}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Sliders Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sliders Left */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="text-xs font-semibold text-slate-200 font-mono uppercase pb-2 border-b border-slate-800">
            Simulation Input Parameters
          </div>

          {/* Vehicle Volume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                <span>Peak Vehicle Volume (vehicles/hr)</span>
              </span>
              <span className="text-cyan-400 font-bold">{vehicleVolume.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="30000"
              max="150000"
              step="5000"
              value={vehicleVolume}
              onChange={(e) => setVehicleVolume(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Road Capacity Utilization */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Road Network Saturation</span>
              </span>
              <span className="text-amber-400 font-bold">{roadCapacity}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="130"
              step="5"
              value={roadCapacity}
              onChange={(e) => setRoadCapacity(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Transit Modal Share */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Public Transit Mode Share</span>
              </span>
              <span className="text-indigo-400 font-bold">{transitShare}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="2"
              value={transitShare}
              onChange={(e) => setTransitShare(Number(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer"
            />
          </div>

          {/* Weather Condition */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-mono block">Weather Condition</label>
            <div className="grid grid-cols-3 gap-2">
              {['Clear', 'Rain', 'Dense Fog'].map((w) => (
                <button
                  key={w}
                  onClick={() => setWeatherCondition(w)}
                  className={`py-1.5 rounded-lg text-xs font-mono border transition ${
                    weatherCondition === w
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel Right */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-200 font-mono uppercase pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Simulation Run Telemetry</span>
              {simResults && (
                <span className="text-[10px] text-emerald-400 font-mono">Status: Evaluated</span>
              )}
            </div>

            {/* In-progress bar */}
            {isRunning && (
              <div className="py-8 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400">Simulation In Progress...</span>
                  <span className="text-white font-bold">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-2 animate-pulse">
                  {progressStep}
                </p>
              </div>
            )}

            {/* Results Display */}
            {!isRunning && simResults && (
              <div className="py-3 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">ESTIMATED CORRIDOR SPEED</span>
                    <span className="text-xl font-bold text-cyan-400 mt-1 block">
                      {simResults.avgSpeedKmph} km/h
                    </span>
                    <span className="text-[10px] text-slate-500">Baseline: 48 km/h</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">LEVEL OF SERVICE</span>
                    <span className="text-xl font-bold text-amber-400 mt-1 block">
                      {simResults.levelOfService.split(' ')[1]}
                    </span>
                    <span className="text-[10px] text-amber-300/80">{simResults.levelOfService}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">MAX QUEUE LENGTH</span>
                    <span className="text-xl font-bold text-white mt-1 block">
                      {(simResults.queueLengthMeters / 1000).toFixed(2)} km
                    </span>
                    <span className="text-[10px] text-slate-500">IFFCO Chowk Flyover</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">DELAY FACTOR</span>
                    <span className="text-xl font-bold text-rose-400 mt-1 block">
                      {simResults.delayIndex}
                    </span>
                    <span className="text-[10px] text-rose-400/80">Peak commute lag</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono">
                  Congestion idle emissions surge: <span className="text-rose-400 font-bold">+{simResults.emissionsSurgePct}%</span> vehicular NOx & particulate release.
                </div>
              </div>
            )}

            {/* Initial empty state */}
            {!isRunning && !simResults && (
              <div className="py-12 text-center text-xs font-mono text-slate-400">
                <SlidersHorizontal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                Configure parameters above and click <span className="text-cyan-400 font-semibold">Run Simulation</span> to calculate illustrative travel delays and congestion bottlenecks.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
