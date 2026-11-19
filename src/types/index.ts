export type ActiveView =
  | 'overview'
  | '3d-city'
  | 'buildings'
  | 'roads'
  | 'infrastructure'
  | 'population'
  | 'environment'
  | 'traffic'
  | 'urban-planning'
  | 'reports'
  | 'settings';

export type BuildingType =
  | 'Commercial Office'
  | 'Residential High-rise'
  | 'Mixed Use'
  | 'IT Tech Park'
  | 'Shopping Mall'
  | 'Industrial / Logistics'
  | 'Civic / Government'
  | string;

export type LandUseCategory =
  | 'Commercial'
  | 'Residential'
  | 'Mixed Use'
  | 'Institutional'
  | 'Industrial'
  | 'Recreational / Open Space'
  | string;

export type HeightSource = 'measured' | 'source-provided' | 'levels-derived' | 'estimated';

export interface BuildingData {
  id: string;
  osm_id?: string;
  name: string;
  hasSourceName?: boolean;
  type: BuildingType;
  building_type?: string;
  height: number; // meters
  height_source: HeightSource;
  hasSourceHeight?: boolean;
  floors?: number | null;
  hasSourceLevels?: boolean;
  landUse: LandUseCategory;
  coordinates: {
    lat: number;
    lng: number;
  };
  footprintAreaSqm?: number;
  sector?: string;
  status: 'REAL OSM DATA' | 'DEMO DATA';
  energyRating?: string;
  builtYear?: number;
  occupancyEstimate?: number;
  rawTags?: Record<string, any>;
  dataSource: string;
}

export type RoadCategory =
  | 'Motorway / Expressway'
  | 'Primary / Secondary Arterial'
  | 'Tertiary / Sector Road'
  | 'Residential Street'
  | 'Service / Pedestrian Path'
  | 'Expressway'
  | 'Arterial Road'
  | 'Sector Road'
  | 'Internal Street';

export interface RoadData {
  id: string;
  osm_id?: string;
  name: string;
  hasSourceName?: boolean;
  category: RoadCategory;
  highwayType?: string;
  lanes: number;
  hasSourceLanes?: boolean;
  lengthKm: number;
  speedLimitKmph: number;
  hasSourceSpeed?: boolean;
  surfaceType: string;
  oneway?: string | null;
  hasSourceOneway?: boolean;
  coordinates: [number, number][]; // [lon, lat] pairs
  congestionLevel: 'Low' | 'Moderate' | 'Heavy' | 'Critical';
  visualPriority?: number;
  color?: string;
  dataSource?: string;
  rawTags?: Record<string, any>;
}

export type InfrastructureCategory =
  | 'Healthcare Facility'
  | 'Educational Institution'
  | 'Public Transport'
  | 'Parks & Greenery'
  | 'Water Body & Drainage'
  | 'Land Use & Zoning'
  | 'Hospital'
  | 'School / University'
  | 'Park / Green Space'
  | 'Power & Utilities'
  | 'Rapid Transit / Metro'
  | 'Civic Facility'
  | 'Water Body'
  | 'Public Amenity';

export interface InfrastructurePoint {
  id: string;
  osm_id?: string;
  name: string;
  hasSourceName?: boolean;
  category: InfrastructureCategory;
  subType?: string;
  geometryType?: string;
  lat: number;
  lng: number;
  sector?: string;
  capacity?: string;
  operationalStatus: 'Operational' | 'Under Maintenance' | 'Planned' | 'Active';
  description: string;
  operator?: string;
  network?: string;
  dataSource?: string;
  rawTags?: Record<string, any>;
}

export interface MapLayerConfig {
  buildings: boolean;
  roads: boolean;
  motorways: boolean;
  arterials: boolean;
  residentialRoads: boolean;
  serviceRoads: boolean;
  landuse: boolean;
  parks: boolean;
  healthcare: boolean;
  education: boolean;
  transport: boolean;
  water: boolean;
  amenities: boolean;
  boundaries: boolean;
  greenCover: boolean;
  nightLighting: boolean;
  basemapStyle: 'dark' | 'satellite' | 'osm';
}

export interface MapCameraState {
  longitude: number;
  latitude: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
}

export interface LayerMetadata {
  count: number;
  file: string;
  size_kb: number;
}

export interface DatasetMetadata {
  region: string;
  focus_area: string;
  bbox: number[];
  source: string;
  processed_at: string;
  layers: Record<string, LayerMetadata>;
}
