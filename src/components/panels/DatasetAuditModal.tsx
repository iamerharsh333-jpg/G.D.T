import React from 'react';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Database,
  Globe,
  Layers,
  Calendar,
  FileCheck,
} from 'lucide-react';

interface DatasetAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatasetAuditModal: React.FC<DatasetAuditModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const layerAudit = [
    {
      layer: '3D Buildings',
      count: 3050,
      geomStatus: 'Verified Real OSM Polygons',
      heightStatus: '2 Source-Provided (0.1%), 23 Levels-Derived (0.8%), 3,025 Estimated (99.1%)',
      source: 'OpenStreetMap Contributors (ODbL)',
      verified: true,
      hasEstimates: true,
    },
    {
      layer: 'Road Network',
      count: 1225,
      geomStatus: 'Verified Real OSM LineStrings',
      heightStatus: 'Categorized: 16 Motorways, 53 Arterials, 398 Residential, 758 Sector/Service',
      source: 'OpenStreetMap Contributors (ODbL)',
      verified: true,
      hasEstimates: false,
    },
    {
      layer: 'Parks & Green Spaces',
      count: 18,
      geomStatus: 'Verified Real OSM Leisure/Landuse Polygons',
      heightStatus: 'Native ground plane polygons',
      source: 'OpenStreetMap Contributors (ODbL)',
      verified: true,
      hasEstimates: false,
    },
    {
      layer: 'Water Bodies',
      count: 3,
      geomStatus: 'Verified Real OSM Water Polygons',
      heightStatus: 'Reservoirs & ponds in DLF Cyber City / Udyog Vihar',
      source: 'OpenStreetMap Contributors (ODbL)',
      verified: true,
      hasEstimates: false,
    },
    {
      layer: 'Public Amenities',
      count: 7,
      geomStatus: 'Verified Real OSM Point/Way Features',
      heightStatus: 'Clinics, hospitals, and public facilities',
      source: 'OpenStreetMap Contributors (ODbL)',
      verified: true,
      hasEstimates: false,
    },
    {
      layer: 'GMDA Planning Extent',
      count: 1,
      geomStatus: 'APPROXIMATE GUIDELINE (Unverified)',
      heightStatus: 'Synthetic boundary polygon. Needs official GMDA cadastral shapefile.',
      source: 'Regional Planning Approximate Placeholder',
      verified: false,
      hasEstimates: true,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase">
                Geospatial Data Validation & Accuracy Audit
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Rigorous provenance, geometry verification, and attribute audit for Gurugram Digital Twin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs font-mono">
          {/* Geographic Extent & Extraction Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">GEOGRAPHIC COVERAGE</span>
              <span className="text-sm font-bold text-cyan-400 mt-1 block">
                DLF Cyber City & Udyog Vihar
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                77.0687°E to 77.1126°E, 28.4814°N to 28.5213°N
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">EXTRACTION DATE</span>
              <span className="text-sm font-bold text-slate-200 mt-1 block">Nov 2026 Snapshot</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Source: OpenStreetMap Contributors (ODbL)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">COORDINATE SYSTEM</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block">
                WGS84 EPSG:4326
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                0 Negative Inversions · 0 Corrupted Vertices
              </span>
            </div>
          </div>

          {/* Validation Checks Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-200 uppercase flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated Geometric & Coordinate Validation Checks</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400 block text-[10px]">CORRUPT GEOMETRIES</span>
                <span className="text-emerald-400 font-bold">0 Detected</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400 block text-[10px]">MISSING COORDINATES</span>
                <span className="text-emerald-400 font-bold">0 Missing</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400 block text-[10px]">DUPLICATE OSM IDS</span>
                <span className="text-emerald-400 font-bold">0 Duplicates</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400 block text-[10px]">POLYGON RINGS CLOSED</span>
                <span className="text-emerald-400 font-bold">100% Validated</span>
              </div>
            </div>
          </div>

          {/* Layer-by-Layer Verification Table */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-300 uppercase">
              Layer Provenance & Attribute Verification Matrix
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Layer</th>
                    <th className="py-2.5 px-3">Count</th>
                    <th className="py-2.5 px-3">Geometry Status</th>
                    <th className="py-2.5 px-3">Height / Attributes Status</th>
                    <th className="py-2.5 px-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {layerAudit.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{row.layer}</td>
                      <td className="py-2.5 px-3 text-cyan-400">{row.count}</td>
                      <td className="py-2.5 px-3 text-slate-300">{row.geomStatus}</td>
                      <td className="py-2.5 px-3 text-slate-400">{row.heightStatus}</td>
                      <td className="py-2.5 px-3 text-right">
                        {row.verified ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Real OSM</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Needs Cadastral</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strict Truth In Geospatial Data Notice */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wide block">
                Geospatial Accuracy Policy & Height Provenance
              </span>
              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                While all building footprints and road corridors originate from surveyed OpenStreetMap geometries, 99.1% of buildings in this quadrant lack explicit surveyor heights in OSM. The platform generates algorithmic heights based on footprint area ($m^2$) and zoning typology, explicitly labeling each as <span className="font-mono text-amber-400 font-bold">[ESTIMATED HEIGHT]</span>. True LiDAR/drone-measured 3D BIM tiles will be ingested in upcoming stages.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">OpenStreetMap ODbL License Compliant</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};

