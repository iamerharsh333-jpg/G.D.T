import sampleBuildingsData from '../data/sampleBuildings.json';
import sampleRoadsData from '../data/sampleRoads.json';
import infrastructurePointsData from '../data/infrastructurePoints.json';
import dashboardStatsData from '../data/dashboardStats.json';
import environmentalIndicatorsData from '../data/environmentalIndicators.json';
import simulationInputsData from '../data/simulationInputs.json';
import { BuildingData, RoadData, InfrastructurePoint, DatasetMetadata } from '../types';

export const dataService = {
  // Metadata about loaded layers
  async getDatasetMetadata(): Promise<DatasetMetadata | null> {
    try {
      const res = await fetch('/data/metadata.json');
      if (res.ok) {
        return (await res.json()) as DatasetMetadata;
      }
    } catch (e) {
      console.warn('[dataService] Could not fetch /data/metadata.json:', e);
    }
    return null;
  },

  // Load real GeoJSON layers
  async loadGeoJsonLayer(layerName: string): Promise<any | null> {
    try {
      const res = await fetch(`/data/${layerName}.geojson`);
      if (res.ok) {
        return await res.json();
      }
      console.warn(`[dataService] /data/${layerName}.geojson returned status ${res.status}`);
    } catch (e) {
      console.warn(`[dataService] Failed to load /data/${layerName}.geojson:`, e);
    }
    return null;
  },

  // Real buildings converted to BuildingData array
  async getRealBuildings(): Promise<BuildingData[]> {
    const geojson = await this.loadGeoJsonLayer('buildings');
    if (!geojson || !geojson.features) {
      return this.getDemoBuildings();
    }

    return geojson.features.map((f: any) => {
      const p = f.properties || {};
      const centroid = p.centroid || [77.089, 28.495];
      const hasSourceName = Boolean(p.has_source_name);
      const hasSourceHeight = p.height_source === 'source-provided';
      const hasSourceLevels = Boolean(p.has_source_levels);

      return {
        id: p.id || f.id || 'bld-unknown',
        osm_id: p.osm_id || p.id,
        name: p.name || `OSM Building ${p.id}`,
        hasSourceName: hasSourceName,
        type: p.building_type || p.building || 'Commercial Office',
        building_type: p.building_type || p.building,
        height: p.height || 15.0,
        height_source: p.height_source || 'estimated',
        hasSourceHeight: hasSourceHeight,
        floors: p.levels !== undefined && p.levels !== null ? p.levels : null,
        hasSourceLevels: hasSourceLevels,
        landUse: p.landuse || (['office', 'commercial'].includes(p.building_type) ? 'Commercial' : 'Residential'),
        coordinates: {
          lng: centroid[0],
          lat: centroid[1],
        },
        footprintAreaSqm: p.footprint_area_sqm,
        sector: p.address || 'DLF Cyber City / Udyog Vihar',
        status: 'REAL OSM DATA',
        energyRating: 'GRIHA 4-Star (Est.)',
        builtYear: 2018,
        occupancyEstimate: p.footprint_area_sqm ? Math.round(p.footprint_area_sqm * (p.levels || 3) / 15) : 450,
        rawTags: p.raw_tags || {},
        dataSource: p.data_source || 'OpenStreetMap Contributors (ODbL)',
      } as BuildingData;
    });
  },

  // Real roads converted to RoadData array (All 1,225 features preserved)
  async getRealRoads(): Promise<RoadData[]> {
    const geojson = await this.loadGeoJsonLayer('roads');
    if (!geojson || !geojson.features) {
      return this.getDemoRoads();
    }

    return geojson.features.map((f: any) => {
      const p = f.properties || {};
      const coords = f.geometry?.coordinates || [];
      return {
        id: p.id || f.id || 'road-unknown',
        osm_id: p.osm_id || p.id,
        name: p.name || `OSM ${p.category || 'Road'}`,
        hasSourceName: Boolean(p.has_source_name),
        category: p.category || 'Primary / Secondary Arterial',
        highwayType: p.highway,
        lanes: p.lanes || (p.visual_priority === 1 ? 6 : p.visual_priority === 2 ? 4 : 2),
        hasSourceLanes: Boolean(p.has_source_lanes),
        lengthKm: p.length_km ? Math.round(p.length_km * 100) / 100 : 0.5,
        speedLimitKmph: p.maxspeed || (p.visual_priority === 1 ? 80 : p.visual_priority === 2 ? 50 : 30),
        hasSourceSpeed: Boolean(p.has_source_maxspeed),
        surfaceType: p.surface || 'Asphalt',
        oneway: p.oneway || null,
        hasSourceOneway: Boolean(p.has_source_oneway),
        coordinates: coords,
        congestionLevel: (p.visual_priority === 1 ? 'Heavy' : p.visual_priority === 2 ? 'Moderate' : 'Low') as any,
        visualPriority: p.visual_priority,
        color: p.color,
        rawTags: p.raw_tags || {},
        dataSource: 'OpenStreetMap Contributors (ODbL)',
      } as RoadData;
    });
  },

  // Real infrastructure across all 6 verified GIS layers
  async getRealInfrastructure(): Promise<InfrastructurePoint[]> {
    const layerNames = ['healthcare', 'education', 'transport', 'parks', 'water', 'landuse'];
    const layerPromises = layerNames.map((name) => this.loadGeoJsonLayer(name));
    const results = await Promise.all(layerPromises);

    const points: InfrastructurePoint[] = [];

    results.forEach((geo, idx) => {
      if (!geo || !geo.features) return;
      const layerName = layerNames[idx];

      geo.features.forEach((f: any) => {
        const p = f.properties || {};
        const centroid = p.centroid || [77.089, 28.495];
        let lat = centroid[1];
        let lng = centroid[0];

        if (f.geometry?.type === 'Point' && f.geometry.coordinates) {
          lng = f.geometry.coordinates[0];
          lat = f.geometry.coordinates[1];
        }

        const categoryMap: Record<string, any> = {
          healthcare: 'Healthcare Facility',
          education: 'Educational Institution',
          transport: 'Public Transport',
          parks: 'Parks & Greenery',
          water: 'Water Body & Drainage',
          landuse: 'Land Use & Zoning',
        };

        points.push({
          id: p.id || f.id || `${layerName}-${points.length}`,
          osm_id: p.osm_id || p.id,
          name: p.name || `OSM ${p.sub_type || layerName}`,
          hasSourceName: Boolean(p.has_source_name),
          category: p.category || categoryMap[layerName] || 'Public Amenity',
          subType: p.sub_type || p.amenity || p.leisure || p.landuse || layerName,
          geometryType: f.geometry?.type || 'Point',
          lat: lat,
          lng: lng,
          sector: p.address || 'DLF Cyber City / Udyog Vihar / Sector 14-25',
          operationalStatus: 'Operational',
          description: `OSM ${p.category || categoryMap[layerName]} (${p.sub_type || layerName})`,
          operator: p.operator,
          network: p.network,
          dataSource: p.data_source || 'OpenStreetMap Contributors (ODbL) via Overpass Turbo',
          rawTags: p.raw_tags || {},
        });
      });
    });

    if (points.length === 0) {
      return this.getDemoInfrastructure();
    }

    return points;
  },

  // Fallback demo datasets
  getDemoBuildings(): BuildingData[] {
    return (sampleBuildingsData as any[]).map((b) => ({
      ...b,
      height_source: 'estimated',
      dataSource: 'Synthetic Demo Baseline',
    })) as BuildingData[];
  },

  getDemoRoads(): RoadData[] {
    return sampleRoadsData as RoadData[];
  },

  getDemoInfrastructure(): InfrastructurePoint[] {
    return infrastructurePointsData as InfrastructurePoint[];
  },

  getBuildings(): BuildingData[] {
    return this.getDemoBuildings();
  },

  getRoads(): RoadData[] {
    return this.getDemoRoads();
  },

  getInfrastructure(): InfrastructurePoint[] {
    return this.getDemoInfrastructure();
  },

  async getDataQualityReport(): Promise<any | null> {
    try {
      const res = await fetch('/data/data_quality_report.json');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[dataService] Failed to load data_quality_report.json:', e);
    }
    return null;
  },

  getDashboardStats() {
    return dashboardStatsData;
  },

  getEnvironmentalIndicators() {
    return environmentalIndicatorsData;
  },

  getSimulationData() {
    return simulationInputsData;
  },
};
