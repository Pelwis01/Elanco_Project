document.addEventListener("DOMContentLoaded", async function () {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    /* =========================== *\
       🗺️ Base map
    \* =========================== */
    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    });

    const map = L.map("map", {
        center: [54.5, -4.0],
        zoom: 6,
        layers: [osm]
    });

    /* =========================== *\
       🎨 Layer config
    \* =========================== */
    const baseCfg = {
        radius: 0.8,
        maxOpacity: 0.85,
        scaleRadius: true,
        useLocalExtrema: false,
        latField: 'lat',
        lngField: 'lng',
        valueField: 'value'
    };

    // Helper to create layers quickly
    const createLayer = (gradient) => new HeatmapOverlay({ ...baseCfg, gradient });

    // Define Gradients
    const tempGrad = { '.4': 'blue', '.6': 'yellow', '.8': '#FF8C00' };
    const rainGrad = { '.1': '#A0C8FF', '.5': '#0055FF', '.9': '#000080' };
    const riskGrad = { '.1': 'green', '.4': 'yellow', '.7': 'orange', '.9': 'red' };

    // Instantiate Layers
    const layers = {
        temp: createLayer(tempGrad),
        rain: createLayer(rainGrad),
        lungworm: createLayer(riskGrad),
        gutworm: createLayer(riskGrad),
        combined: createLayer(riskGrad) 
    };

    // Add map controls
    const layerControl = {
        "None": L.layerGroup(),
        "Temperature": layers.temp,
        "Precipitation": layers.rain,
        "Lungworm Risk": layers.lungworm,
        "Gut Worm Risk": layers.gutworm,
        "Combined Risk (Max)": layers.combined
    };

    L.control.layers(layerControl, {}).addTo(map);
    layers.combined.addTo(map); // Default view

    /* =========================== *\
       🌩️ Data handling
    \* =========================== */
    const gridPoints = generateUKGrid(0.5);

    try {
        // Retrieve data (cached or new)
        const weatherData = await getCachedWeather(gridPoints);

        const points = {
            temp: [],
            rain: [],
            lungworm: [],
            gutworm: [],
            combined: []
        };

        // Process each grid point
        (Array.isArray(weatherData) ? weatherData : [weatherData]).forEach(w => {
            if (!w.hourly) return;

            const rain = w.hourly.precipitation ? w.hourly.precipitation[0] : 0;
            const temp = w.hourly.temperature_2m ? w.hourly.temperature_2m[0] : 0;

            points.temp.push({ lat: w.latitude, lng: w.longitude, value: temp });
            if (rain > 0) points.rain.push({ lat: w.latitude, lng: w.longitude, value: rain });

            // Risk calculations
            const lRisk = calculateLungwormRisk(temp, rain);
            const gRisk = calculateGutwormRisk(temp, rain);
            const cRisk = Math.max(lRisk, gRisk);

            if (lRisk > 0) points.lungworm.push({ lat: w.latitude, lng: w.longitude, value: lRisk });
            if (gRisk > 0) points.gutworm.push({ lat: w.latitude, lng: w.longitude, value: gRisk });
            if (cRisk > 0) points.combined.push({ lat: w.latitude, lng: w.longitude, value: cRisk });
        });

        // Update layers
        layers.temp.setData({ max: 30, data: points.temp });
        layers.rain.setData({ max: 5, data: points.rain });
        layers.lungworm.setData({ max: 100, data: points.lungworm });
        layers.gutworm.setData({ max: 100, data: points.gutworm });
        layers.combined.setData({ max: 100, data: points.combined });

        console.log(`✅ Map updated with ${points.temp.length} grid points.`);

    } catch (error) {
        console.error("❌ Critical Error loading map data:", error);
    }

    /* =========================== *\
       🖱️ Map click
    \* =========================== */
    map.on("click", (e) => handleMapClick(e));
});

/* =========================== *\
   🧩 Helper functions
\* =========================== */

// Create UK-based grid
function generateUKGrid(step) {
    const points = [];
    for (let lat = 48; lat <= 61; lat += step) {
        for (let lon = -11; lon <= 2; lon += step) {
            points.push({ lat, lon });
        }
    }
    return points;
}

// Retrieve data (cached or new)
async function getCachedWeather(points) {
    const CACHE_KEY = "uk_weather_cache_v2"; // NB: change each update to force refresh for outdated cache
    const EXPIRY = 60 * 60 * 1000; // 1 hour

    // Check cache
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_KEY + "_ts");
    if (cached && timestamp && (Date.now() - timestamp < EXPIRY)) {
        console.log("💾 Loading from cache...");
        return JSON.parse(cached);
    }

    console.log("🌍 Fetching new data...");
    
    // Batch request to avoid URL length limits
    const BATCH_SIZE = 100;
    let allResults = [];

    for (let i = 0; i < points.length; i += BATCH_SIZE) {
        const chunk = points.slice(i, i + BATCH_SIZE);
        const latStr = chunk.map(p => p.lat).join(",");
        const lonStr = chunk.map(p => p.lon).join(",");
        
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latStr}&longitude=${lonStr}&hourly=precipitation,temperature_2m&forecast_days=1`;
        
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Batch ${i} failed`);
            const data = await res.json();
            // Normalise to array format for consistency
            allResults = allResults.concat(Array.isArray(data) ? data : [data]);
        } catch (err) {
            console.warn(`⚠️ Batch failed: ${err.message}`);
        }
    }

    // 💾 Cache
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(allResults));
        localStorage.setItem(CACHE_KEY + "_ts", Date.now());
    } catch(e) { console.warn("⚠️ Cache full."); }

    return allResults;
}

// Click handler
function handleMapClick(e) {
    const { lat, lng } = e.latlng;
    console.log(`📍 Clicked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

    // Fetch local soil data (separate to save bandwidth)
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=rain,temperature_2m,soil_moisture_3_to_9cm&forecast_days=1`)
        .then(res => res.json())
        .then(data => {
            const h = data.hourly;
            const temp = h.temperature_2m[0];
            const rain = h.rain[0] * 100; // Scaling for risk calc
            const soil = (h.soil_moisture_3_to_9cm[0] || 0) / 0.5 * 100;

            console.log(`🌡️ Temp: ${temp}°C, 🌧️ Rain: ${rain}, 🌱 Soil: ${soil.toFixed(1)}`);
            
            // Call external risk function if it exists
            if (typeof getAllParasiteRisks === "function") {
                const result = getAllParasiteRisks(temp, rain, soil);
                console.log("📊 Risk Result:", result);
            }
        })
        .catch(err => console.error("Local fetch failed", err));
}

/* =========================== *\
   🧮 Risk formula placeholders - TBA
\* =========================== */
function calculateLungwormRisk(temp, rain) {
    if (temp > 12 && rain > 0.2) return 85;
    if (temp > 10) return 30;
    return 0;
}
function calculateGutwormRisk(temp, rain) {
    if (temp > 15) return 90;
    if (temp > 8) return 45;
    return 0;
}
