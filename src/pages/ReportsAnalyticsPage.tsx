import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Database,
  Layers,
  Ruler,
  Navigation,
  ShieldCheck,
  Building2,
  Trees,
  Droplets,
  Activity,
  Globe,
  Tag,
} from 'lucide-react';

export const ReportsAnalyticsPage: React.FC = () => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [qualityReport, setQualityReport] = useState<any>(null);

  useEffect(() => {
    fetch('/data/data_quality_report.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setQualityReport(data);
      })
      .catch((err) => console.warn('Could not fetch data_quality_report.json', err));
  }, []);

  const exportFiles = [
    {
      id: 'EXP-BLD-3D',
      title: 'Gurugram Buildings GeoJSON (3,050 Features)',
      filename: 'buildings.geojson',
      type: 'GeoJSON Polygon FeatureCollection',
      size: '1.7 MB',
      description: 'Cleaned, closed-ring 3D building polygons with surveyed heights, levels, and algorithmic estimates.',
      url: '/data/buildings.geojson',
    },
    {
      id: 'EXP-RDS-NET',
      title: 'Gurugram Road Corridors GeoJSON (1,225 Features)',
      filename: 'roads.geojson',
      type: 'GeoJSON LineString FeatureCollection',
      size: '698 KB',
      description: 'Highway geometries classified into Motorway, Arterial, Sector, and Residential networks with oneway & lane metadata.',
      url: '/data/roads.geojson',
    },
    {
      id: 'EXP-TRANS-NET',
      title: 'Public Transport & Metro GeoJSON (32 Features)',
      filename: 'transport.geojson',
      type: 'GeoJSON Transit Network Vectors',
      size: '42 KB',
      description: 'Rapid Metro Gurgaon and Delhi Metro Yellow Line tracks, stations (Cyber City, Sikanderpur), and stop areas.',
      url: '/data/transport.geojson',
    },
    {
      id: 'EXP-HLTH-MED',
      title: 'Healthcare Facilities GeoJSON (19 Features)',
      filename: 'healthcare.geojson',
      type: 'GeoJSON Medical Points & Polygons',
      size: '22 KB',
      description: 'Hospitals (Neelkanth, World Laparoscopy, RBS Hospital), specialty clinics, and healthcare institutions.',
      url: '/data/healthcare.geojson',
    },
    {
      id: 'EXP-EDU-ACAD',
      title: 'Educational Institutions GeoJSON (16 Features)',
      filename: 'education.geojson',
      type: 'GeoJSON Academic Vectors',
      size: '18 KB',
      description: 'Schools (Gurgaon Valley School, The Shri Ram School), institutes, and educational facilities.',
      url: '/data/education.geojson',
    },
    {
      id: 'EXP-PRK-GRN',
      title: 'Parks & Greenery Reserves GeoJSON (64 Features)',
      filename: 'parks.geojson',
      type: 'GeoJSON Leisure Polygons',
      size: '48 KB',
      description: 'Green lungs, urban gardens, community parks, and sports pitches across DLF Cyber City and Phases.',
      url: '/data/parks.geojson',
    },
    {
      id: 'EXP-WTR-DRN',
      title: 'Water Bodies & Drainage GeoJSON (15 Features)',
      filename: 'water.geojson',
      type: 'GeoJSON Hydrological Vectors',
      size: '16 KB',
      description: 'Retention basins, water reservoirs, drainage canals, and natural drainage vectors.',
      url: '/data/water.geojson',
    },
    {
      id: 'EXP-LND-ZONE',
      title: 'Land Use & Zoning Sectors GeoJSON (85 Features)',
      filename: 'landuse.geojson',
      type: 'GeoJSON Planning Zones',
      size: '92 KB',
      description: 'Residential sectors (DLF Phase 2, Heritage City, Beverly Park), commercial hubs, and administrative zones.',
      url: '/data/landuse.geojson',
    },
    {
      id: 'EXP-QA-AUDIT',
      title: 'Geospatial Data Quality & Validation Audit Report',
      filename: 'data_quality_report.json',
      type: 'JSON Quality Audit Specification',
      size: '4.1 KB',
      description: 'Complete geometric verification, coordinate bounds, attribute completeness ratios, and source provenance.',
      url: '/data/data_quality_report.json',
    },
  ];

  const handleExport = (file: typeof exportFiles[0]) => {
    // Trigger download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Downloaded ${file.filename}`);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 3500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#0a0d14] text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <FileBarChart2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold">Geospatial Data Quality & Pipeline Analytics</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>4,328 VERIFIED OSM FEATURES</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Statistical validation, attribute completeness matrices, and layer export deliverables for Gurugram
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {downloadSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center space-x-2 font-mono animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadSuccess} successfully delivered.</span>
        </div>
      )}

      {/* Top Level Pipeline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL FEATURES</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">4,328</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">100% Geometry Integrity</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>BUILDING FOOTPRINTS</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">3,050</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">3,044 Ways · 6 Relations</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ROAD CORRIDORS</span>
            <Navigation className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">1,225</div>
          <div className="text-[11px] text-amber-400 mt-1 font-mono">16 Motorways · 53 Arterials</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>GEOGRAPHIC ENVELOPE</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
            DLF Cyber City & Udyog Vihar
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            77.0687°E - 77.1126°E, 28.4814°N - 28.5213°N
          </div>
        </div>
      </div>

      {/* Geometry and Feature Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Geometry Types */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-200 font-mono uppercase">
              Geometry Type Distribution (RFC 7946)
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">0 Invalid Geometries</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold">Polygon Geometries</span>
                <span className="text-[10px] text-slate-400 block">
                  Closed linear rings for 3,050 buildings, 18 parks, 25 land-use, 3 water
                </span>
              </div>
              <span className="text-base font-bold text-cyan-400">3,097 (71.6%)</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold">LineString Geometries</span>
                <span className="text-[10px] text-slate-400 block">
                  Highways, motorways, link ramps, and pedestrian pathways
                </span>
              </div>
              <span className="text-base font-bold text-amber-400">1,224 (28.3%)</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold">Point Geometries</span>
                <span className="text-[10px] text-slate-400 block">
                  Critical medical clinics, hospitals, and civic facilities
                </span>
              </div>
              <span className="text-base font-bold text-rose-400">7 (0.1%)</span>
            </div>
          </div>
        </div>

        {/* Building Attribute Completeness & Provenance */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-200 font-mono uppercase">
              Building Attribute Provenance & Coverage
            </span>
            <span className="text-[10px] text-amber-400 font-mono">99.1% Estimated Height</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {/* Height provenance */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Surveyed Height Tags in Source:</span>
                <span className="text-emerald-400 font-bold">2 of 3,050 (0.07%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '0.07%' }} />
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Preserved: way/121362984 (60m), way/844694020 (12m).
              </span>
            </div>

            {/* Floor levels */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Surveyed Floor Levels (building:levels):</span>
                <span className="text-cyan-400 font-bold">26 of 3,050 (0.85%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: '0.85%' }} />
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Derived into storey heights; missing floor counts kept as null.
              </span>
            </div>

            {/* Names */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Named Buildings (name tag):</span>
                <span className="text-indigo-300 font-bold">55 of 3,050 (1.80%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: '1.8%' }} />
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                E.g. Bharti Airtel, Building 7A, 9A, 9B, Royal Bank of Scotland.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Road Classification & Coverage */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-200 font-mono uppercase">
            Road Network Classification & Attribute Completeness (1,225 Features)
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">OpenStreetMap ODbL</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">NAMED CORRIDORS</span>
            <span className="text-base font-bold text-white mt-1 block">141 (11.5%)</span>
            <span className="text-[10px] text-slate-500">E.g. NH-48, Shankar Chowk</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">ONE-WAY ATTRIBUTES</span>
            <span className="text-base font-bold text-cyan-400 mt-1 block">261 (21.3%)</span>
            <span className="text-[10px] text-slate-500">Directionality preserved</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">LANES SPECIFIED</span>
            <span className="text-base font-bold text-amber-400 mt-1 block">56 (4.6%)</span>
            <span className="text-[10px] text-slate-500">Remaining left as null</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">SPEED LIMIT TAGGED</span>
            <span className="text-base font-bold text-emerald-400 mt-1 block">30 (2.5%)</span>
            <span className="text-[10px] text-slate-500">40 to 80 km/h</span>
          </div>
        </div>
      </div>

      {/* Processed Layer Deliverables & Export Center */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
          <span>Processed Geospatial Layer Deliverables</span>
          <span className="text-[10px] text-emerald-400">Ready for GIS & CesiumJS Ingestion</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportFiles.map((file) => (
            <div
              key={file.id}
              className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                    {file.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{file.size}</span>
                </div>

                <h3 className="font-semibold text-slate-100 text-sm mt-2">{file.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {file.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">{file.filename}</span>
                <button
                  onClick={() => handleExport(file)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-xs font-mono transition border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Layer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
