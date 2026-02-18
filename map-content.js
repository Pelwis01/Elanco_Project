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
        radius: 1,
        maxOpacity: 0.8,
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
        liverfluke: createLayer(riskGrad),
        hairworm: createLayer(riskGrad),
        coccidia: createLayer(riskGrad),
        combined: createLayer(riskGrad) 
    };

    // 🕹️ Map controls
    const layerControl = {
        "None": L.layerGroup(),
        "Temperature": layers.temp,
        "Precipitation": layers.rain,
        "Lungworm Risk": layers.lungworm,
        "Gut Worm Risk": layers.gutworm,
        "Liver Fluke Risk": layers.liverfluke,
        "Hairworm Risk": layers.hairworm,
        "Coccidia Risk": layers.coccidia,
        "Combined Risk (Max)": layers.combined
    };

    L.control.layers(layerControl, {}).addTo(map);
    layers.combined.addTo(map); // Default view

    /* =========================== *\
       🌩️ Data handling
    \* =========================== */
    try {
        // Retrieve data (cached or new)
        const gridPoints = await getLandPoints();
        const weatherData = await getCachedWeather(gridPoints);

        const points = {
            temp: [],
            rain: [],
            lungworm: [],
            gutworm: [],
            liverfluke: [],
            hairworm: [],
            coccidia: [],
            combined: []
        };
        
        // Process each grid point
        (Array.isArray(weatherData) ? weatherData : [weatherData]).forEach(w => {
            if (!w.hourly) return;
        weatherData.forEach(batch => {
            if (!batch.hourly) return;
            
            const lats = Array.isArray(batch.latitude) ? batch.latitude : [batch.latitude];
            const lngs = Array.isArray(batch.longitude) ? batch.longitude : [batch.longitude];
            
            lats.forEach((lat, i) => {
                const lng = lngs[i];
                
                const tempArray = Array.isArray(batch.hourly.temperature_2m[0])
                    ? batch.hourly.temperature_2m[i]
                    : batch.hourly.temperature_2m;
                    
                const rainArray = Array.isArray(batch.hourly.precipitation[0])
                    ? batch.hourly.precipitation[i]
                    : batch.hourly.precipitation;
                    
                const temp = tempArray[0] ?? 0;
                const rain = rainArray[0] ?? 0;
                
                points.temp.push({ lat: w.latitude, lng: w.longitude, value: temp });
                if (rain > 0) points.rain.push({ lat: w.latitude, lng: w.longitude, value: rain });
                
                // Risk calculations
                let result = getAllParasiteRisks(temp, rain * 100, 0); // Soil moisture not available in batch data, set to 0
                let combinedRisk = Math.max(result.lungworm, result.gutWorm, result.liverFluke, result.hairWorm, result.coccidia);
                
                if (result.lungworm > 0) points.lungworm.push({ lat: w.latitude, lng: w.longitude, value: result.lungworm });
                if (result.gutWorm > 0) points.gutworm.push({ lat: w.latitude, lng: w.longitude, value: result.gutWorm });
                if (result.liverFluke > 0) points.liverfluke.push({ lat: w.latitude, lng: w.longitude, value: result.liverFluke });
                if (result.hairWorm > 0) points.hairworm.push({ lat: w.latitude, lng: w.longitude, value: result.hairWorm });
                if (result.coccidia > 0) points.coccidia.push({ lat: w.latitude, lng: w.longitude, value: result.coccidia });
                if (combinedRisk > 0) points.combined.push({ lat: w.latitude, lng: w.longitude, value: combinedRisk });
            });
        });

        // Update layers
        layers.temp.setData({ max: 30, data: points.temp });
        layers.rain.setData({ max: 5, data: points.rain });
        layers.lungworm.setData({ max: 100, data: points.lungworm });
        layers.gutworm.setData({ max: 100, data: points.gutworm });
        layers.liverfluke.setData({ max: 100, data: points.liverfluke });
        layers.hairworm.setData({ max: 100, data: points.hairworm });
        layers.coccidia.setData({ max: 100, data: points.coccidia });
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
async function getLandPoints() {
    const res = await fetch("data/uk_land_grid.json");
    return await res.json();
}

// Retrieve data (cached or new)
async function getCachedWeather(points) {
    const CACHE_KEY = "uk_weather_cache_v3"; // NB: change each update to force refresh for outdated cache
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
        const lonStr = chunk.map(p => p.lng).join(",");
        
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

    // Fetch place name (reverse geocoding)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
            const place = data.address ? (data.address.city || data.address.town || data.address.village || "Unknown") : "Unknown";
            console.log(`📌 Location: ${place}`);
        })
        .catch(err => console.error("Reverse geocoding failed", err));

    // Fetch local soil data (separate to save bandwidth)
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation,temperature_2m,soil_moisture_3_to_9cm&forecast_days=1`)
        .then(res => res.json())
        .then(data => {
            const h = data.hourly;
            const temp = h.temperature_2m[0];
            const rain = h.precipitation[0] * 100; // Scaling for risk calc
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

