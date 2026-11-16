"""
GeoJSON Validator & Geometry Repair Module
Validates geometries against RFC 7946, checks coordinate bounds,
removes duplicate consecutive vertices, and repairs unclosed polygon rings.
"""

from typing import Dict, Any, List, Optional, Tuple

# Gurugram regional boundary envelope [min_lng, min_lat, max_lng, max_lat]
BBOX = [76.80, 28.30, 77.25, 28.60]

def validate_point(coords: Any) -> Optional[List[float]]:
    if not isinstance(coords, (list, tuple)) or len(coords) < 2:
        return None
    lon, lat = float(coords[0]), float(coords[1])
    if not (BBOX[0] <= lon <= BBOX[2] and BBOX[1] <= lat <= BBOX[3]):
        return None
    return [round(lon, 7), round(lat, 7)]

def clean_linear_ring(ring: Any) -> Optional[List[List[float]]]:
    if not isinstance(ring, (list, tuple)) or len(ring) < 3:
        return None

    cleaned: List[List[float]] = []
    for pt in ring:
        valid_pt = validate_point(pt)
        if valid_pt is None:
            return None
        # Remove consecutive duplicate vertices
        if not cleaned or (abs(valid_pt[0] - cleaned[-1][0]) > 1e-7 or abs(valid_pt[1] - cleaned[-1][1]) > 1e-7):
            cleaned.append(valid_pt)

    if len(cleaned) < 3:
        return None

    # Ensure ring is closed
    if cleaned[0] != cleaned[-1]:
        cleaned.append(cleaned[0])

    return cleaned if len(cleaned) >= 4 else None

def clean_linestring(coords: Any) -> Optional[List[List[float]]]:
    if not isinstance(coords, (list, tuple)) or len(coords) < 2:
        return None

    cleaned: List[List[float]] = []
    for pt in coords:
        valid_pt = validate_point(pt)
        if valid_pt is None:
            continue
        if not cleaned or (abs(valid_pt[0] - cleaned[-1][0]) > 1e-7 or abs(valid_pt[1] - cleaned[-1][1]) > 1e-7):
            cleaned.append(valid_pt)

    return cleaned if len(cleaned) >= 2 else None

def validate_and_repair_geometry(geom: Dict[str, Any]) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    if not isinstance(geom, dict):
        return None, "Geometry is not a dictionary"

    gtype = geom.get("type")
    coords = geom.get("coordinates")

    if not gtype or coords is None:
        return None, "Missing type or coordinates"

    if gtype == "Polygon":
        if not isinstance(coords, (list, tuple)) or len(coords) == 0:
            return None, "Empty polygon coordinates"
        clean_rings = []
        for r in coords:
            cr = clean_linear_ring(r)
            if cr:
                clean_rings.append(cr)
        if not clean_rings:
            return None, "No valid linear rings in polygon"
        return {"type": "Polygon", "coordinates": clean_rings}, None

    elif gtype == "MultiPolygon":
        if not isinstance(coords, (list, tuple)) or len(coords) == 0:
            return None, "Empty multipolygon coordinates"
        clean_polys = []
        for poly in coords:
            clean_rings = []
            for r in poly:
                cr = clean_linear_ring(r)
                if cr:
                    clean_rings.append(cr)
            if clean_rings:
                clean_polys.append(clean_rings)
        if not clean_polys:
            return None, "No valid polygons in multipolygon"
        return {"type": "MultiPolygon", "coordinates": clean_polys}, None

    elif gtype == "LineString":
        cl = clean_linestring(coords)
        if not cl:
            return None, "Invalid or short LineString"
        return {"type": "LineString", "coordinates": cl}, None

    elif gtype == "MultiLineString":
        clean_lines = []
        for line in coords:
            cl = clean_linestring(line)
            if cl:
                clean_lines.append(cl)
        if not clean_lines:
            return None, "No valid lines in MultiLineString"
        return {"type": "MultiLineString", "coordinates": clean_lines}, None

    elif gtype == "Point":
        pt = validate_point(coords)
        if not pt:
            return None, "Point coordinates out of bounds"
        return {"type": "Point", "coordinates": pt}, None

    return None, f"Unsupported geometry type: {gtype}"

