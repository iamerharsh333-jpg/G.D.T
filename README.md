# GURUGRAM DIGITAL TWIN
## Smart City 3D Geospatial Intelligence Platform (Frontend Foundation)

A modern, enterprise-grade 3D Digital Twin frontend for Gurugram, Haryana, India. Designed for urban planners, municipal authorities (GMDA), infrastructure engineers, and smart-city command centres.

---

### Key Capabilities in Step 1
- **Interactive 3D Geospatial Map:** Built on CesiumJS with neutral dark cartographic base tiles (CartoDB / OpenStreetMap). Does not require any paid API keys or proprietary satellite imagery.
- **Parametric 3D Buildings:** Procedural 3D extruded volumes mapped to Gurugram sectors (DLF Cyber City, Golf Course Road, Sohna Road, Udyog Vihar, Sector 29). Color-coded by land-use classification (Commercial, Residential, Mixed-Use, Industrial, Institutional).
- **Major Arterial Corridors:** 3D glowing vectors representing Delhi-Gurugram Expressway (NH-48), Golf Course Road 16-Lane Corridor, Golf Course Extension Road, Southern Peripheral Road (SPR), and MG Road.
- **Public & Critical Infrastructure:** Geocoded markers for super-specialty hospitals (Medanta, Fortis), rapid transit hubs (Millennium City Centre Metro, Cyber City Rapid Metro), Aravalli Biodiversity Park, 400kV substations, and water treatment plants.
- **Inspection & Detail Panel:** Interactive click selection of 3D buildings displaying height, floor count, land-use, occupancy estimates, energy certifications, and camera focus.
- **Command Centre Dashboard:** Recharts-powered analytics for land-use classification, infrastructure operational ratios, temporal diurnal air quality (AQI) curves, and municipal activity audit feeds.
- **Macroscopic Traffic Simulator:** Interactive simulation workbench with vehicle volume controls, road network capacity saturation sliders, weather factors, and calculated Level of Service (LOS) outcomes.
- **What-If Urban Planning Workbench:** Interactive scenario planner for Transit-Oriented Densification, SPR Ecological Buffers, and Old Gurugram Grid Redevelopment.
- **Zero Paid Key / Free Neutral Base Map:** Fully functional standalone operation without Cesium Ion tokens, AWS access, or paid map APIs. Optimized for Apple Silicon MacBooks (8GB RAM).

---

### Technology Stack
- **Framework:** React 18 + TypeScript + Vite
- **3D Geospatial Engine:** CesiumJS (`cesium` + `vite-plugin-cesium`)
- **Styling & Theme:** Tailwind CSS (Dark Command Centre theme)
- **Icons:** Lucide React
- **Data Visualizations:** Recharts

---

### Project Structure
```
urban-twin/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── charts/             # Land-use pie, infrastructure bar, AQI area charts
│   │   ├── dashboard/          # KPI cards, platform activity feed
│   │   ├── layout/             # TopNavbar, Sidebar, BottomBar
│   │   ├── map/                # CesiumMap 3D canvas, MapLayerControls
│   │   └── panels/             # BuildingDetailPanel
│   ├── data/                   # Structured demo JSON datasets
│   │   ├── dashboardStats.json
│   │   ├── environmentalIndicators.json
│   │   ├── infrastructurePoints.json
│   │   ├── sampleBuildings.json
│   │   ├── sampleRoads.json
│   │   └── simulationInputs.json
│   ├── pages/                  # Overview, 3D City View, Buildings, Roads, etc.
│   ├── services/               # Decoupled data access service
│   ├── styles/                 # Tailwind custom theme and scrollbars
│   ├── types/                  # TypeScript data contracts & models
│   ├── App.tsx                 # Root application container & state router
│   └── main.tsx                # React DOM mount point
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

### Local Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Production Build:**
   ```bash
   npm run build
   ```

