import React from 'react';
import { CesiumMap } from '../components/map/CesiumMap';
import { MapLayerControls } from '../components/map/MapLayerControls';
import { BuildingDetailPanel } from '../components/panels/BuildingDetailPanel';
import { RoadDetailPanel } from '../components/panels/RoadDetailPanel';
import {
  BuildingData,
  InfrastructurePoint,
  MapCameraState,
  MapLayerConfig,
  RoadData,
} from '../types';

interface CityViewPageProps {
  buildings: BuildingData[];
  roads: RoadData[];
  infrastructure: InfrastructurePoint[];
  layerConfig: MapLayerConfig;
  onToggleLayer: (key: keyof MapLayerConfig) => void;
  selectedBuilding: BuildingData | null;
  selectedRoad?: RoadData | null;
  onSelectBuilding: (building: BuildingData | null) => void;
  onSelectRoad?: (road: RoadData | null) => void;
  cameraState: MapCameraState;
  onCameraChange: (cameraState: MapCameraState) => void;
  flyToPresetKey: 'cybercity' | 'golfcourse' | 'nh48' | 'overview' | 'udyogvihar' | null;
  onFlyToPreset: (presetKey: 'cybercity' | 'golfcourse' | 'nh48' | 'overview' | 'udyogvihar') => void;
  focusedBuilding: BuildingData | null;
  onFocusBuilding: (building: BuildingData) => void;
}

export const CityViewPage: React.FC<CityViewPageProps> = ({
  buildings,
  roads,
  infrastructure,
  layerConfig,
  onToggleLayer,
  selectedBuilding,
  selectedRoad,
  onSelectBuilding,
  onSelectRoad,
  onCameraChange,
  flyToPresetKey,
  onFlyToPreset,
  focusedBuilding,
  onFocusBuilding,
}) => {
  return (
    <div className="relative w-full h-full flex-1 overflow-hidden bg-[#0a0d14]">
      {/* 3D Cesium Viewport */}
      <CesiumMap
        buildings={buildings}
        roads={roads}
        infrastructure={infrastructure}
        layerConfig={layerConfig}
        selectedBuilding={selectedBuilding}
        selectedRoad={selectedRoad}
        onSelectBuilding={onSelectBuilding}
        onSelectRoad={onSelectRoad}
        onCameraChange={onCameraChange}
        flyToPresetKey={flyToPresetKey}
        focusedBuilding={focusedBuilding}
      />

      {/* Floating Layer Controls on Top-Right */}
      <div className="absolute top-4 right-4 z-20">
        <MapLayerControls
          layerConfig={layerConfig}
          onToggleLayer={onToggleLayer}
          onFlyToPreset={onFlyToPreset}
        />
      </div>

      {/* Floating Building Detail Drawer when selected */}
      {selectedBuilding && (
        <div className="absolute bottom-6 right-4 z-20 max-w-sm">
          <BuildingDetailPanel
            building={selectedBuilding}
            onClose={() => onSelectBuilding(null)}
            onFocusBuilding={onFocusBuilding}
          />
        </div>
      )}

      {/* Floating Road Detail Drawer when selected */}
      {selectedRoad && (
        <div className="absolute bottom-6 right-4 z-20 max-w-sm">
          <RoadDetailPanel
            road={selectedRoad}
            onClose={() => onSelectRoad?.(null)}
          />
        </div>
      )}

      {/* Persistent Real OSM Data Attribution Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 text-[10px] font-mono text-slate-300 flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>OpenStreetMap (ODbL) · 3,050 Real Building Footprints · 1,225 Corridors</span>
        </div>
      </div>
    </div>
  );
};
