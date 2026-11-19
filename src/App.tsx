import React, { useState, useEffect } from 'react';
import { TopNavbar } from './components/layout/TopNavbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomBar } from './components/layout/BottomBar';
import { OverviewPage } from './pages/OverviewPage';
import { CityViewPage } from './pages/CityViewPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { RoadsPage } from './pages/RoadsPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { PopulationPage } from './pages/PopulationPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { TrafficSimulationPage } from './pages/TrafficSimulationPage';
import { UrbanPlanningPage } from './pages/UrbanPlanningPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DatasetAuditModal } from './components/panels/DatasetAuditModal';
import { dataService } from './services/dataService';
import {
  ActiveView,
  BuildingData,
  InfrastructurePoint,
  MapCameraState,
  MapLayerConfig,
  RoadData,
} from './types';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('3d-city');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Real datasets state with initial fallbacks
  const [buildings, setBuildings] = useState<BuildingData[]>(dataService.getDemoBuildings());
  const [roads, setRoads] = useState<RoadData[]>(dataService.getDemoRoads());
  const [infrastructure, setInfrastructure] = useState<InfrastructurePoint[]>(dataService.getDemoInfrastructure());

  // Selected building, road & infrastructure for the inspection drawers
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<RoadData | null>(null);
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<InfrastructurePoint | null>(null);
  const [focusedBuilding, setFocusedBuilding] = useState<BuildingData | null>(null);

  // Dataset audit modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Map layer toggle configuration across all 6 verified GIS layers
  const [layerConfig, setLayerConfig] = useState<MapLayerConfig>({
    buildings: true,
    roads: true,
    motorways: true,
    arterials: true,
    residentialRoads: true,
    serviceRoads: true,
    landuse: true,
    parks: true,
    healthcare: true,
    education: true,
    transport: true,
    water: true,
    amenities: true,
    boundaries: true,
    greenCover: true,
    nightLighting: true,
    basemapStyle: 'dark',
  });

  // Map camera state (updated dynamically by Cesium viewer)
  const [cameraState, setCameraState] = useState<MapCameraState>({
    longitude: 77.089,
    latitude: 28.495,
    height: 2800,
    heading: 0.3,
    pitch: -0.61,
    roll: 0.0,
  });

  // Camera preset trigger
  const [flyToPresetKey, setFlyToPresetKey] = useState<
    'cybercity' | 'golfcourse' | 'nh48' | 'overview' | 'udyogvihar' | null
  >(null);

  // Load real OpenStreetMap features on mount
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const [realBld, realRds, realInfra] = await Promise.all([
          dataService.getRealBuildings(),
          dataService.getRealRoads(),
          dataService.getRealInfrastructure(),
        ]);
        if (realBld && realBld.length > 0) setBuildings(realBld);
        if (realRds && realRds.length > 0) setRoads(realRds);
        if (realInfra && realInfra.length > 0) setInfrastructure(realInfra);
      } catch (err) {
        console.warn('[App] Error initializing real OSM datasets:', err);
      }
    };

    fetchRealData();
  }, []);

  const handleToggleLayer = (key: keyof MapLayerConfig) => {
    setLayerConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectBasemap = (style: 'dark' | 'satellite' | 'osm') => {
    setLayerConfig((prev) => ({
      ...prev,
      basemapStyle: style,
    }));
  };

  const handleFlyToPreset = (presetKey: 'cybercity' | 'golfcourse' | 'nh48' | 'overview' | 'udyogvihar') => {
    setFlyToPresetKey(presetKey);
    setTimeout(() => setFlyToPresetKey(null), 500);
  };

  const handleFocusBuilding = (bld: BuildingData) => {
    setFocusedBuilding(bld);
    setSelectedBuilding(bld);
    setSelectedRoad(null);
    setSelectedInfrastructure(null);
    setActiveView('3d-city');
    setTimeout(() => setFocusedBuilding(null), 500);
  };

  const handleFocusInfrastructure = (item: InfrastructurePoint) => {
    setSelectedInfrastructure(item);
    setSelectedBuilding(null);
    setSelectedRoad(null);
    setActiveView('3d-city');
  };

  const handleSearchSelect = (item: {
    type: 'building' | 'infrastructure';
    data: BuildingData | InfrastructurePoint;
  }) => {
    if (item.type === 'building') {
      const b = item.data as BuildingData;
      handleFocusBuilding(b);
    } else {
      const infra = item.data as InfrastructurePoint;
      handleFocusInfrastructure(infra);
    }
  };

  const handleResetView = () => {
    handleFlyToPreset('cybercity');
    if (activeView !== '3d-city') {
      setActiveView('3d-city');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0d14] text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <TopNavbar
        buildings={buildings}
        infrastructure={infrastructure}
        onSearchSelect={handleSearchSelect}
        onResetView={handleResetView}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        isNightMode={layerConfig.nightLighting}
        onToggleNightMode={() => handleToggleLayer('nightLighting')}
      />

      {/* Main Content Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Collapsible Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* View Routing / Display */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeView === 'overview' && (
            <OverviewPage onNavigateToView={setActiveView} />
          )}

          {activeView === '3d-city' && (
            <CityViewPage
              buildings={buildings}
              roads={roads}
              infrastructure={infrastructure}
              layerConfig={layerConfig}
              onToggleLayer={handleToggleLayer}
              onSelectBasemap={handleSelectBasemap}
              selectedBuilding={selectedBuilding}
              selectedRoad={selectedRoad}
              selectedInfrastructure={selectedInfrastructure}
              onSelectBuilding={(bld) => {
                setSelectedBuilding(bld);
                if (bld) {
                  setSelectedRoad(null);
                  setSelectedInfrastructure(null);
                }
              }}
              onSelectRoad={(rd) => {
                setSelectedRoad(rd);
                if (rd) {
                  setSelectedBuilding(null);
                  setSelectedInfrastructure(null);
                }
              }}
              onSelectInfrastructure={(infra) => {
                setSelectedInfrastructure(infra);
                if (infra) {
                  setSelectedBuilding(null);
                  setSelectedRoad(null);
                }
              }}
              cameraState={cameraState}
              onCameraChange={setCameraState}
              flyToPresetKey={flyToPresetKey}
              onFlyToPreset={handleFlyToPreset}
              focusedBuilding={focusedBuilding}
              onFocusBuilding={handleFocusBuilding}
              onFocusInfrastructure={handleFocusInfrastructure}
            />
          )}

          {activeView === 'buildings' && (
            <BuildingsPage
              buildings={buildings}
              onSelectBuilding={handleFocusBuilding}
              onNavigateTo3D={() => setActiveView('3d-city')}
            />
          )}

          {activeView === 'roads' && (
            <RoadsPage
              roads={roads}
              onNavigateTo3D={() => setActiveView('3d-city')}
            />
          )}

          {activeView === 'infrastructure' && (
            <InfrastructurePage
              infrastructure={infrastructure}
              onNavigateTo3D={() => setActiveView('3d-city')}
            />
          )}

          {activeView === 'population' && <PopulationPage />}

          {activeView === 'environment' && <EnvironmentPage />}

          {activeView === 'traffic' && <TrafficSimulationPage />}

          {activeView === 'urban-planning' && <UrbanPlanningPage />}

          {activeView === 'reports' && <ReportsAnalyticsPage />}

          {activeView === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Bottom Information Status Bar */}
      <BottomBar cameraState={cameraState} layerConfig={layerConfig} />

      {/* Data Validation & Accuracy Audit Modal */}
      <DatasetAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};
