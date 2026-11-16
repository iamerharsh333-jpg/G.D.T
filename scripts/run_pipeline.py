#!/usr/bin/env python3
"""
Master Geospatial Pipeline Runner
Executes:
1. Validation and repair
2. Extraction into separate layers
3. Building enrichment (height, levels, typology)
4. Road processing (classification, oneway, lanes, speeds)
5. Quality report generation
6. Exports to data/raw/, data/processed/, and public/data/
"""

import json
import os
import sys

# Ensure pipeline modules can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pipeline.validate_geojson import validate_and_repair_geometry
from pipeline.enrich_buildings import enrich_building_feature
from pipeline.process_roads import process_road_feature
from pipeline.generate_quality_report import compile_data_quality_report

RAW_DIR = "data/raw"
PROCESSED_DIR = "data/processed"
PUBLIC_DIR = "public/data"

def run_pipeline():
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    input_file = os.path.join(RAW_DIR, "gurugram_osm.geojson")
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found!")
        sys.exit(1)

    print(f"[Pipeline] Loading raw dataset: {input_file}...")
    with open(input_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    raw_features = raw_data.get("features", [])
    print(f"[Pipeline] Read {len(raw_features)} features.")

    categorized = {
        "buildings": [],
        "roads": [],
        "parks": [],
        "landuse": [],
        "water": [],
        "amenities": []
    }

    geom_distribution = {}
    seen_ids = set()
    invalid_count = 0
    duplicate_count = 0
    bbox = [180.0, 90.0, -180.0, -90.0]

    for feat in raw_features:
        props = feat.get("properties", {}) or {}
        geom = feat.get("geometry", {})

        gt = geom.get("type", "Unknown")
        geom_distribution[gt] = geom_distribution.get(gt, 0) + 1

        # Check duplicate IDs
        osm_id = props.get("@id") or props.get("id") or str(feat.get("id", ""))
        if osm_id and osm_id in seen_ids:
            duplicate_count += 1
            continue
        if osm_id:
            seen_ids.add(osm_id)

        # Validate geometry
        valid_geom, err = validate_and_repair_geometry(geom)
        if not valid_geom:
            invalid_count += 1
            continue

        # Update bounding box
        def update_bbox(c, g_type):
            if g_type == "Point":
                bbox[0] = min(bbox[0], c[0])
                bbox[1] = min(bbox[1], c[1])
                bbox[2] = max(bbox[2], c[0])
                bbox[3] = max(bbox[3], c[1])
            elif g_type in ("LineString", "MultiPoint"):
                for pt in c:
                    update_bbox(pt, "Point")
            elif g_type in ("Polygon", "MultiLineString"):
                for ring in c:
                    update_bbox(ring, "LineString")
            elif g_type == "MultiPolygon":
                for poly in c:
                    update_bbox(poly, "Polygon")

        update_bbox(valid_geom["coordinates"], valid_geom["type"])

        # Layer Extraction & Processing
        if "building" in props:
            enriched = enrich_building_feature(feat, valid_geom)
            categorized["buildings"].append(enriched)
        elif "highway" in props:
            processed_road = process_road_feature(feat, valid_geom)
            categorized["roads"].append(processed_road)
        elif "leisure" in props or props.get("landuse") in ["recreation_ground", "grass", "forest", "village_green"]:
            categorized["parks"].append({
                "type": "Feature",
                "id": osm_id,
                "geometry": valid_geom,
                "properties": {
                    "id": osm_id,
                    "osm_id": osm_id,
                    "name": props.get("name") or props.get("name:en") or f"Park ({osm_id.split('/')[-1]})",
                    "category": "Park / Green Space",
                    "type": props.get("leisure") or props.get("landuse"),
                    "data_source": "OpenStreetMap Contributors (ODbL)",
                    "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
                }
            })
        elif "water" in props or "waterway" in props or props.get("natural") in ["water", "wetland"]:
            categorized["water"].append({
                "type": "Feature",
                "id": osm_id,
                "geometry": valid_geom,
                "properties": {
                    "id": osm_id,
                    "osm_id": osm_id,
                    "name": props.get("name") or props.get("name:en") or f"Water Body ({osm_id.split('/')[-1]})",
                    "category": "Water Body",
                    "type": props.get("water") or props.get("waterway") or props.get("natural"),
                    "data_source": "OpenStreetMap Contributors (ODbL)",
                    "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
                }
            })
        elif "landuse" in props:
            categorized["landuse"].append({
                "type": "Feature",
                "id": osm_id,
                "geometry": valid_geom,
                "properties": {
                    "id": osm_id,
                    "osm_id": osm_id,
                    "name": props.get("name") or f"{props['landuse'].capitalize()} Zone",
                    "landuse": props["landuse"],
                    "category": "Land Use Zone",
                    "data_source": "OpenStreetMap Contributors (ODbL)",
                    "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
                }
            })
        elif "amenity" in props:
            categorized["amenities"].append({
                "type": "Feature",
                "id": osm_id,
                "geometry": valid_geom,
                "properties": {
                    "id": osm_id,
                    "osm_id": osm_id,
                    "name": props.get("name") or props.get("name:en") or f"{props['amenity'].capitalize()} ({osm_id.split('/')[-1]})",
                    "amenity": props["amenity"],
                    "category": "Public Amenity",
                    "data_source": "OpenStreetMap Contributors (ODbL)",
                    "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
                }
            })

    print(f"[Pipeline] Feature extraction summary:")
    for k, v in categorized.items():
        print(f"  - {k}: {len(v)} features")

    # Round bounding box
    bbox_rounded = [round(b, 6) for b in bbox]

    # Export to data/raw/, data/processed/, and public/data/
    for layer_name, layer_feats in categorized.items():
        fc = {
            "type": "FeatureCollection",
            "name": f"gurugram_{layer_name}",
            "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
            "features": layer_feats
        }
        raw_target = os.path.join(RAW_DIR, f"{layer_name}.geojson")
        proc_target = os.path.join(PROCESSED_DIR, f"{layer_name}.geojson")
        public_target = os.path.join(PUBLIC_DIR, f"{layer_name}.geojson")

        with open(raw_target, "w", encoding="utf-8") as f:
            json.dump(fc, f)
        with open(proc_target, "w", encoding="utf-8") as f:
            json.dump(fc, f, separators=(',', ':'))
        with open(public_target, "w", encoding="utf-8") as f:
            json.dump(fc, f, separators=(',', ':'))

    # Compile Quality Report
    quality_report = compile_data_quality_report(
        raw_features,
        categorized,
        geom_distribution,
        bbox_rounded,
        invalid_count,
        duplicate_count
    )

    qr_path = os.path.join(PUBLIC_DIR, "data_quality_report.json")
    with open(qr_path, "w", encoding="utf-8") as f:
        json.dump(quality_report, f, indent=2)

    print(f"[Pipeline] Compiled quality report at {qr_path}")
    print("[Pipeline] All layers processed successfully.")

if __name__ == "__main__":
    run_pipeline()

