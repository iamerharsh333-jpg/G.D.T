import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import {
  BuildingData,
  InfrastructurePoint,
  MapCameraState,
  MapLayerConfig,
  RoadData,
} from '../../types';

interface CesiumMapProps {
  buildings: BuildingData[];
  roads: RoadData[];
  infrastructure: InfrastructurePoint[];
  layerConfig: MapLayerConfig;
  selectedBuilding: BuildingData | null;
  selectedRoad?: RoadData | null;
  onSelectBuilding: (building: BuildingData | null) => void;
  onSelectRoad?: (road: RoadData | null) => void;
  onCameraChange?: (cameraState: MapCameraState) => void;
  flyToPresetKey?: 'cybercity' | 'golfcourse' | 'nh48' | 'overview' | 'udyogvihar' | null;
  focusedBuilding?: BuildingData | null;
}

export const CesiumMap: React.FC<CesiumMapProps> = ({
  layerConfig,
  onSelectBuilding,
  onSelectRoad,
  onCameraChange,
  flyToPresetKey,
  focusedBuilding,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  // References to DataSources
  const dataSourcesRef = useRef<{
    buildings?: Cesium.GeoJsonDataSource;
    roads?: Cesium.GeoJsonDataSource;
    parks?: Cesium.GeoJsonDataSource;
    water?: Cesium.GeoJsonDataSource;
    landuse?: Cesium.GeoJsonDataSource;
    amenities?: Cesium.GeoJsonDataSource;
    boundary?: Cesium.Entity;
  }>({});

  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing 3D Viewport...');
  const [layersLoaded, setLayersLoaded] = useState<boolean>(false);
  const [selectedEntityRef, setSelectedEntityRef] = useState<Cesium.Entity | null>(null);

  // 1. Initialize Viewer & Load Real OSM GeoJSON Layers
  useEffect(() => {
    if (!containerRef.current) return;

    // Neutral base imagery provider: CartoDB Dark Matter / OSM raster tiles
    const baseImagery = new Cesium.UrlTemplateImageryProvider({
      url: 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
      maximumLevel: 19,
      credit: 'CartoDB & OpenStreetMap contributors (ODbL)',
    });

    const viewer = new Cesium.Viewer(containerRef.current, {
      baseLayer: new Cesium.ImageryLayer(baseImagery),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      animation: false,
      fullscreenButton: false,
      scene3DOnly: true,
      shouldAnimate: true,
    });

    viewerRef.current = viewer;

    // Appearance & Performance optimization
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.depthTestAgainstTerrain = false;
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0a0d14');

    // Camera initial position focused over real Gurugram Cyber City & Udyog Vihar
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(77.0910, 28.4860, 2800.0),
      orientation: {
        heading: Cesium.Math.toRadians(18.0),
        pitch: Cesium.Math.toRadians(-35.0),
        roll: 0.0,
      },
    });

    // Add GMDA Planning Boundary Guideline
    const boundaryCoords = [
      76.9200, 28.3400,
      76.9000, 28.4200,
      76.9800, 28.5200,
      77.1250, 28.5150,
      77.1450, 28.4450,
      77.1150, 28.3600,
      77.0100, 28.3300,
    ];
    dataSourcesRef.current.boundary = viewer.entities.add({
      name: 'GMDA Gurugram Boundary (Guideline)',
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray(boundaryCoords),
        material: Cesium.Color.fromCssColorString('#06b6d4').withAlpha(0.03),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#06b6d4').withAlpha(0.6),
        outlineWidth: 2,
      },
    });

    // Progressive GeoJSON Layer Loading Pipeline
    const loadRealLayers = async () => {
      // 1. Load Buildings (3,050 real OSM footprint geometries)
      try {
        setLoadingStatus('Loading 3,050 actual building footprints...');
        const bldSource = await Cesium.GeoJsonDataSource.load('/data/buildings.geojson', {
          clampToGround: false,
        });
        await viewer.dataSources.add(bldSource);
        dataSourcesRef.current.buildings = bldSource;

        const bldEntities = bldSource.entities.values;
        for (let i = 0; i < bldEntities.length; i++) {
          const entity = bldEntities[i];
          const props = entity.properties;
          if (entity.polygon) {
            const height = props?.height?.getValue() || 12;
            const bldType = String(props?.building_type?.getValue() || props?.building?.getValue() || 'yes').toLowerCase();

            let color = Cesium.Color.fromCssColorString('#06b6d4'); // Default cyan
            if (bldType.includes('office') || bldType.includes('commercial')) {
              color = Cesium.Color.fromCssColorString('#38bdf8'); // Sky blue for corporate
            } else if (bldType.includes('apartment') || bldType.includes('residential') || bldType.includes('house')) {
              color = Cesium.Color.fromCssColorString('#818cf8'); // Indigo
            } else if (bldType.includes('industrial') || bldType.includes('warehouse')) {
              color = Cesium.Color.fromCssColorString('#94a3b8'); // Slate
            } else if (bldType.includes('retail') || bldType.includes('mall') || bldType.includes('shop')) {
              color = Cesium.Color.fromCssColorString('#fbbf24'); // Amber
            } else if (bldType.includes('hospital') || bldType.includes('clinic')) {
              color = Cesium.Color.fromCssColorString('#f43f5e'); // Rose
            }

            entity.polygon.extrudedHeight = new Cesium.ConstantProperty(height);
            entity.polygon.material = new Cesium.ColorMaterialProperty(color.withAlpha(0.85));
            entity.polygon.outline = new Cesium.ConstantProperty(true);
            entity.polygon.outlineColor = new Cesium.ConstantProperty(Cesium.Color.WHITE.withAlpha(0.35));
          }
        }
      } catch (err) {
        console.warn('[CesiumMap] buildings.geojson failed to load:', err);
      }

      // 2. Load Roads (1,225 real OSM corridors)
      try {
        setLoadingStatus('Loading 1,225 highway & road corridors...');
        const roadsSource = await Cesium.GeoJsonDataSource.load('/data/roads.geojson');
        await viewer.dataSources.add(roadsSource);
        dataSourcesRef.current.roads = roadsSource;

        const roadEntities = roadsSource.entities.values;
        for (let i = 0; i < roadEntities.length; i++) {
          const entity = roadEntities[i];
          if (entity.polyline) {
            const colorStr = entity.properties?.color?.getValue() || '#64748b';
            const width = entity.properties?.width?.getValue() || 2.0;
            entity.polyline.width = new Cesium.ConstantProperty(width);
            entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.22,
              color: Cesium.Color.fromCssColorString(colorStr),
            });
          }
        }
      } catch (err) {
        console.warn('[CesiumMap] roads.geojson failed to load:', err);
      }

      // 3. Load Parks / Green Spaces
      try {
        setLoadingStatus('Loading urban parks & green spaces...');
        const parksSource = await Cesium.GeoJsonDataSource.load('/data/parks.geojson');
        await viewer.dataSources.add(parksSource);
        dataSourcesRef.current.parks = parksSource;

        const parkEntities = parksSource.entities.values;
        for (let i = 0; i < parkEntities.length; i++) {
          const entity = parkEntities[i];
          if (entity.polygon) {
            entity.polygon.material = new Cesium.ColorMaterialProperty(
              Cesium.Color.fromCssColorString('#10b981').withAlpha(0.35)
            );
            entity.polygon.outline = new Cesium.ConstantProperty(true);
            entity.polygon.outlineColor = new Cesium.ConstantProperty(
              Cesium.Color.fromCssColorString('#10b981').withAlpha(0.9)
            );
          }
        }
      } catch (err) {
        console.warn('[CesiumMap] parks.geojson failed to load:', err);
      }

      // 4. Load Water Bodies
      try {
        setLoadingStatus('Loading reservoirs & water bodies...');
        const waterSource = await Cesium.GeoJsonDataSource.load('/data/water.geojson');
        await viewer.dataSources.add(waterSource);
        dataSourcesRef.current.water = waterSource;

        const waterEntities = waterSource.entities.values;
        for (let i = 0; i < waterEntities.length; i++) {
          const entity = waterEntities[i];
          if (entity.polygon) {
            entity.polygon.material = new Cesium.ColorMaterialProperty(
              Cesium.Color.fromCssColorString('#0284c7').withAlpha(0.6)
            );
            entity.polygon.outline = new Cesium.ConstantProperty(true);
            entity.polygon.outlineColor = new Cesium.ConstantProperty(
              Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.9)
            );
          }
        }
      } catch (err) {
        console.warn('[CesiumMap] water.geojson failed to load:', err);
      }

      // 5. Load Amenities (hospitals, clinics, etc.)
      try {
        setLoadingStatus('Loading critical amenities...');
        const amenitiesSource = await Cesium.GeoJsonDataSource.load('/data/amenities.geojson');
        await viewer.dataSources.add(amenitiesSource);
        dataSourcesRef.current.amenities = amenitiesSource;

        const amenityEntities = amenitiesSource.entities.values;
        for (let i = 0; i < amenityEntities.length; i++) {
          const entity = amenityEntities[i];
          if (entity.billboard) {
            entity.billboard.show = new Cesium.ConstantProperty(false);
          }
          const name = entity.properties?.name?.getValue() || 'Amenity';
          entity.point = new Cesium.PointGraphics({
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString('#f43f5e'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          });
          entity.label = new Cesium.LabelGraphics({
            text: name,
            font: '10px monospace',
            fillColor: Cesium.Color.fromCssColorString('#f8fafc'),
            backgroundColor: Cesium.Color.fromCssColorString('#0f172a').withAlpha(0.85),
            showBackground: true,
            style: Cesium.LabelStyle.FILL,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -12),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(50.0, 6000.0),
          });
        }
      } catch (err) {
        console.warn('[CesiumMap] amenities.geojson failed to load:', err);
      }

      setLoadingStatus('');
      setLayersLoaded(true);
    };

    loadRealLayers();

    // Camera Change Listener
    const cameraListener = () => {
      if (!viewer.camera) return;
      const cartographic = Cesium.Cartographic.fromCartesian(viewer.camera.position);
      const state: MapCameraState = {
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        latitude: Cesium.Math.toDegrees(cartographic.latitude),
        height: cartographic.height,
        heading: viewer.camera.heading,
        pitch: viewer.camera.pitch,
        roll: viewer.camera.roll,
      };
      onCameraChange?.(state);
    };

    viewer.camera.changed.addEventListener(cameraListener);

    // Entity Click Selection Handler (Supports Buildings, Roads, Amenities)
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: { position: Cesium.Cartesian2 }) => {
      const pickedObject = viewer.scene.pick(movement.position);

      if (Cesium.defined(pickedObject) && pickedObject.id) {
        const entity: Cesium.Entity = pickedObject.id;
        const props = entity.properties;

        if (props) {
          // If a road polyline was clicked:
          if (entity.polyline && onSelectRoad) {
            const rawId = props.id?.getValue() || entity.id;
            const osmId = props.osm_id?.getValue() || rawId;
            const name = props.name?.getValue() || `Unnamed Road (${osmId})`;
            const category = props.category?.getValue() || 'Road Corridor';
            const hwType = props.highway?.getValue() || 'highway';
            const lanes = props.lanes?.getValue() || 2;
            const speed = props.maxspeed?.getValue() || 50;
            const surface = props.surface?.getValue() || 'Asphalt';
            const rawTags = props.raw_tags?.getValue() || {};

            const roadData: RoadData = {
              id: rawId,
              osm_id: osmId,
              name: name,
              category: category,
              highwayType: hwType,
              lanes: lanes,
              lengthKm: 1.5,
              speedLimitKmph: speed,
              surfaceType: surface,
              coordinates: [],
              congestionLevel: 'Moderate',
              rawTags: rawTags,
              dataSource: 'OpenStreetMap Contributors (ODbL)',
            };

            setSelectedEntityRef(entity);
            onSelectBuilding(null);
            onSelectRoad(roadData);
            return;
          }

          // If a building or polygon was clicked:
          const rawId = props.id?.getValue() || entity.id;
          const osmId = props.osm_id?.getValue() || rawId;
          const name = props.name?.getValue() || `OSM Building ${osmId}`;
          const bldType = props.building_type?.getValue() || props.building?.getValue() || props.amenity?.getValue() || 'Building';
          const height = props.height?.getValue() || 12;
          const heightSource = props.height_source?.getValue() || 'estimated';
          const levels = props.levels?.getValue() || (height ? Math.max(1, Math.round(height / 3.3)) : null);
          const landuse = props.landuse?.getValue() || 'Urban';
          const footprintArea = props.footprint_area_sqm?.getValue() || 0;
          const rawTags = props.raw_tags?.getValue() || {};

          let lat = 28.495;
          let lng = 77.089;
          const centroid = props.centroid?.getValue();
          if (centroid && Array.isArray(centroid)) {
            lng = centroid[0];
            lat = centroid[1];
          }

          const buildingData: BuildingData = {
            id: rawId,
            osm_id: osmId,
            name: name,
            type: bldType,
            building_type: bldType,
            height: height,
            height_source: heightSource,
            floors: levels,
            landUse: landuse,
            coordinates: { lat, lng },
            footprintAreaSqm: footprintArea,
            sector: props.address?.getValue() || 'DLF Cyber City / Udyog Vihar',
            status: 'REAL OSM DATA',
            energyRating: 'GRIHA 4-Star (Est.)',
            builtYear: 2018,
            occupancyEstimate: footprintArea ? Math.round(footprintArea * (levels || 3) / 14) : 450,
            rawTags: rawTags,
            dataSource: 'OpenStreetMap Contributors (ODbL)',
          };

          setSelectedEntityRef(entity);
          onSelectRoad?.(null);
          onSelectBuilding(buildingData);
          return;
        }
      }

      // Empty space clicked
      setSelectedEntityRef(null);
      onSelectBuilding(null);
      onSelectRoad?.(null);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      viewer.camera.changed.removeEventListener(cameraListener);
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  // Update Dynamic Layer Visibility
  useEffect(() => {
    if (!viewerRef.current) return;

    if (dataSourcesRef.current.buildings) {
      dataSourcesRef.current.buildings.show = layerConfig.buildings;
    }

    if (dataSourcesRef.current.roads) {
      dataSourcesRef.current.roads.show = layerConfig.roads;
      const entities = dataSourcesRef.current.roads.entities.values;
      for (let i = 0; i < entities.length; i++) {
        const ent = entities[i];
        const priority = ent.properties?.visual_priority?.getValue();
        if (priority === 1) {
          ent.show = layerConfig.motorways;
        } else if (priority === 2) {
          ent.show = layerConfig.arterials;
        } else if (priority === 4) {
          ent.show = layerConfig.residentialRoads;
        } else if (priority === 5) {
          ent.show = layerConfig.serviceRoads;
        }
      }
    }

    if (dataSourcesRef.current.parks) {
      dataSourcesRef.current.parks.show = layerConfig.parks;
    }

    if (dataSourcesRef.current.water) {
      dataSourcesRef.current.water.show = layerConfig.water;
    }

    if (dataSourcesRef.current.amenities) {
      dataSourcesRef.current.amenities.show = layerConfig.amenities;
    }

    if (dataSourcesRef.current.boundary) {
      dataSourcesRef.current.boundary.show = layerConfig.boundaries;
    }
  }, [layerConfig, layersLoaded]);

  // Highlight Selected Entity
  useEffect(() => {
    if (!selectedEntityRef) return;

    if (selectedEntityRef.polygon) {
      const polygon = selectedEntityRef.polygon;
      const originalOutlineColor = polygon.outlineColor?.getValue(Cesium.JulianDate.now());
      const originalOutlineWidth = polygon.outlineWidth?.getValue(Cesium.JulianDate.now());

      polygon.outlineColor = new Cesium.ConstantProperty(Cesium.Color.fromCssColorString('#06b6d4'));
      polygon.outlineWidth = new Cesium.ConstantProperty(3);

      return () => {
        if (polygon) {
          polygon.outlineColor = new Cesium.ConstantProperty(originalOutlineColor || Cesium.Color.WHITE.withAlpha(0.35));
          polygon.outlineWidth = new Cesium.ConstantProperty(originalOutlineWidth || 1);
        }
      };
    }
  }, [selectedEntityRef]);

  // Handle Fly-To Camera Presets
  useEffect(() => {
    if (!viewerRef.current || !flyToPresetKey) return;
    const viewer = viewerRef.current;

    if (flyToPresetKey === 'cybercity') {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.0890, 28.4940, 1200.0),
        orientation: {
          heading: Cesium.Math.toRadians(25.0),
          pitch: Cesium.Math.toRadians(-32.0),
          roll: 0.0,
        },
        duration: 1.6,
      });
    } else if (flyToPresetKey === 'udyogvihar') {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.0780, 28.5020, 1400.0),
        orientation: {
          heading: Cesium.Math.toRadians(5.0),
          pitch: Cesium.Math.toRadians(-30.0),
          roll: 0.0,
        },
        duration: 1.6,
      });
    } else if (flyToPresetKey === 'nh48') {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.0850, 28.4980, 1800.0),
        orientation: {
          heading: Cesium.Math.toRadians(350.0),
          pitch: Cesium.Math.toRadians(-28.0),
          roll: 0.0,
        },
        duration: 1.6,
      });
    } else if (flyToPresetKey === 'golfcourse') {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.1000, 28.4550, 2500.0),
        orientation: {
          heading: Cesium.Math.toRadians(40.0),
          pitch: Cesium.Math.toRadians(-30.0),
          roll: 0.0,
        },
        duration: 1.6,
      });
    } else if (flyToPresetKey === 'overview') {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.0850, 28.4800, 9500.0),
        orientation: {
          heading: Cesium.Math.toRadians(15.0),
          pitch: Cesium.Math.toRadians(-40.0),
          roll: 0.0,
        },
        duration: 1.8,
      });
    }
  }, [flyToPresetKey]);

  // Focus Specific Building
  useEffect(() => {
    if (!viewerRef.current || !focusedBuilding) return;
    const viewer = viewerRef.current;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        focusedBuilding.coordinates.lng,
        focusedBuilding.coordinates.lat - 0.003,
        Math.max(focusedBuilding.height * 3, 280)
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-28.0),
        roll: 0.0,
      },
      duration: 1.4,
    });
  }, [focusedBuilding]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading Progress Indicator Overlay */}
      {loadingStatus && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 rounded-xl px-4 py-2 flex items-center space-x-3 text-xs font-mono text-cyan-300 shadow-2xl z-30 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>{loadingStatus}</span>
        </div>
      )}

      {/* Viewport Status & Real OSM Tag */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-lg p-2.5 flex items-center space-x-2 text-[11px] font-mono text-cyan-400 select-none pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-slate-200">GURUGRAM 3D VIEWPORT</span>
        <span className="text-[10px] text-emerald-400 border border-emerald-800 bg-emerald-950/70 px-1.5 py-0.2 rounded font-semibold">
          REAL OSM DATA
        </span>
      </div>
    </div>
  );
};
