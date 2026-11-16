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
      return {
        id: p.id || f.id || 'bld-unknown',
        osm_id: p.osm_id || p.id,
        name: p.name || `OSM Building ${p.id}`,
        type: p.building_type || p.building || 'Commercial Office',
        building_type: p.building_type || p.building,
        height: p.height || 15.0,
        height_source: p.height_source || 'estimated',
        floors: p.levels || (p.height ? Math.max(1, Math.round(p.height / 3.3)) : null),
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
        dataSource: p.data_source || 'OpenStreetMap Contributors',
      } as BuildingData;
    });
  },

  // Real roads converted to RoadData array
  async getRealRoads(): Promise<RoadData[]> {
    const geojson = await this.loadGeoJsonLayer('roads');
    if (!geojson || !geojson.features) {
      return this.getDemoRoads();
    }

    return geojson.features.slice(0, 150).map((f: any) => {
      const p = f.properties || {};
      const coords = f.geometry?.coordinates || [];
      return {
        id: p.id || f.id || 'road-unknown',
        osm_id: p.osm_id || p.id,
        name: p.name || `OSM ${p.category || 'Road'}`,
        category: p.category || 'Primary / Secondary Arterial',
        highwayType: p.highway,
        lanes: p.lanes || 4,
        lengthKm: 2.5,
        speedLimitKmph: p.maxspeed || 50,
        surfaceType: p.surface || 'Asphalt',
        coordinates: coords,
        congestionLevel: (p.visual_priority === 1 ? 'Heavy' : p.visual_priority === 2 ? 'Moderate' : 'Low') as any,
        visualPriority: p.visual_priority,
        color: p.color,
        dataSource: 'OpenStreetMap Contributors',
      } as RoadData;
    });
  },

  // Real amenities and parks converted to InfrastructurePoint array
  async getRealInfrastructure(): Promise<InfrastructurePoint[]> {
    const amenitiesGeo = await this.loadGeoJsonLayer('amenities');
    const parksGeo = await this.loadGeoJsonLayer('parks');

    const points: InfrastructurePoint[] = [];

    if (amenitiesGeo && amenitiesGeo.features) {
      amenitiesGeo.features.forEach((f: any) => {
        const p = f.properties || {};
        let coords = [77.085, 28.495];
        if (f.geometry?.type === 'Point') {
          coords = f.geometry.coordinates;
        } else if (f.geometry?.coordinates && f.geometry.coordinates[0]) {
          coords = f.geometry.coordinates[0][0] || coords;
        }
        points.push({
          id: p.id || f.id || 'amenity-unknown',
          osm_id: p.osm_id || p.id,
          name: p.name || `${p.amenity} facility`,
          category: (p.amenity === 'hospital' || p.amenity === 'clinic' ? 'Hospital' : 'Public Amenity') as any,
          lat: coords[1],
          lng: coords[0],
          sector: 'DLF Cyber City / Phase 3',
          operationalStatus: 'Operational',
          description: `OSM Tagged ${p.amenity || 'Facility'}`,
          dataSource: 'OpenStreetMap Contributors',
          rawTags: p.raw_tags || {},
        });
      });
    }

    if (parksGeo && parksGeo.features) {
      parksGeo.features.forEach((f: any) => {
        const p = f.properties || {};
        let coords = [77.085, 28.495];
        if (f.geometry?.coordinates && f.geometry.coordinates[0]) {
          coords = f.geometry.coordinates[0][0] || coords;
        }
        points.push({
          id: p.id || f.id || 'park-unknown',
          osm_id: p.osm_id || p.id,
          name: p.name || 'Public Park / Green Space',
          category: 'Park / Green Space',
          lat: coords[1],
          lng: coords[0],
          sector: 'DLF Phase 2/3 Green Lung',
          operationalStatus: 'Operational',
          description: `OpenStreetMap Park Polygon (${p.type || 'park'})`,
          dataSource: 'OpenStreetMap Contributors',
          rawTags: p.raw_tags || {},
        });
      });
    }

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
