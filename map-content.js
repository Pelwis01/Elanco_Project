let weatherData = null;

document.addEventListener("DOMContentLoaded", async function () {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;
    
    // Listen for simulation toggle
    document.getElementById("summer-sim").addEventListener("change", function() {
        updateMapLayers(); 
    });
    
    /* =========================== *\
       🗺️ Base map
    \* =========================== */
    // 🌍 Mapbox tile layer URL
    const mapBase = L.tileLayer(
        "https://api.mapbox.com/styles/v1/bryzerse/cmlsnxjpl001c01s951lgbjdp/tiles/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoiYnJ5emVyc2UiLCJhIjoiY2traWNsZWhmMG13MzJvcGdiZ3hkbjlodyJ9.BV94uCu_hACQrqEbO74A8w",
        {
            attribution: '&copy; Mapbox'
        }
    );
    
    // 🗺️ Initialise land-only Leaflet map over the British Isles
    const map = L.map("map", { zoomControl: false })
        .setView([54.5, -4.0], 6);
    
    mapBase.addTo(map);
    
    // 🌾 Agricultural land overlay with hover highlight (TBA)
    const agriData = await fetch("data/FarmCensusDistrictElectoralArea2019_1860894812733494281.geojson").then(r => r.json());
    
    function highlightFeature(e) {
        const layer = e.target;
        layer.setStyle({ weight: 5, color: '#666', fillOpacity: 0.7 });
        layer.bringToFront(); // Ensures the highlight is visible
    }
    
    const geojsonLayer = L.geoJSON(agriData, {
        style: { color: "green", weight: 2 },
        onEachFeature: function (_, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: function(e) { geojsonLayer.resetStyle(e.target); }
            });
        }
    }).addTo(map);
    
    // 🌊 Sea + Labels overlay
    const mapTop = L.tileLayer(
        "https://api.mapbox.com/styles/v1/bryzerse/cmlsoi77b001901sag1cug1yy/tiles/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoiYnJ5emVyc2UiLCJhIjoiY2traWNsZWhmMG13MzJvcGdiZ3hkbjlodyJ9.BV94uCu_hACQrqEbO74A8w",
        {
            attribution: '&copy; Mapbox',
            pane: 'overlayPane'
        }
    );

    /* =========================== *\
       🎨 Layer config
    \* =========================== */
    const baseCfg = {
        radius: 1,
        maxOpacity: 0.8,
        scaleRadius: true,
        useLocalExtrema: false,
        latField: "lat",
        lngField: "lng",
        valueField: "value",
    };

    // Helper to create layers quickly
    const createLayer = (gradient) => new HeatmapOverlay({ ...baseCfg, gradient });

    // 🎨 Define gradients
    // Max of 60 to allow for negative value offset (∴ 20 = 0°C, 0 = -20°C, 50 = 30°C)
    const tempGrad = {
        '.25': 'darkblue', // ❄️ Deep negatives (-10°C and below)
        '.38': 'blue',     // ❄️ Around 0°C
        '.50': 'gold',     // ❄️ Around 10°C to 15°C
        '.75': '#FF8C00',  // 🌤 Around 20°C to 25°C
        '.95': 'red'       // 🔥 30°C+
    };
    const rainGrad = { '.1': '#A0C8FF', '.5': '#0055FF', '.9': '#000080' };
    const riskGrad = { '.1': 'darkgreen', '.2': 'green', '.5': 'gold', '.8': 'orange', '1': 'red' };
    
    // 🏗️ Instantiate layers
    const layers = {
        temp: createLayer(tempGrad),
        rain: createLayer(rainGrad),
        soil: createLayer(rainGrad),
        lungworm: createLayer(riskGrad),
        gutworm: createLayer(riskGrad),
        liverfluke: createLayer(riskGrad),
        hairworm: createLayer(riskGrad),
        coccidia: createLayer(riskGrad),
        tick: createLayer(riskGrad),
        combined: createLayer(riskGrad) 
    };
    
    // 🕹️ Map controls
    const layerControl = {
        "None": L.layerGroup(),
        "Temperature": layers.temp,
        "Precipitation": layers.rain,
        "Soil Moisture": layers.soil,
        "Lungworm Risk": layers.lungworm,
        "Gutworm Risk": layers.gutworm,
        "Liver Fluke Risk": layers.liverfluke,
        "Hairworm Risk": layers.hairworm,
        "Coccidia Risk": layers.coccidia,
        "Tick Risk": layers.tick,
        "Combined Risk (Max)": layers.combined
    };
    
    /* 📋 Legend */
    let legend = L.control({ position: "bottomleft" });
    
    legend.onAdd = function() {
    let div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Legend</h4>";
    div.innerHTML += '<i style="background: green"></i><span>0-30%</span><br>';
    div.innerHTML += '<i style="background: yellow"></i><span>30-70%</span><br>';
    div.innerHTML += '<i style="background: red"></i><span>70-100%</span><br>';
    return div;
    };
    
    legend.addTo(map);
    
    L.control.layers(layerControl, {}).addTo(map);
    layers.combined.addTo(map); // 🗺️ Default view - combined risk map
    
    mapTop.addTo(map); // 🌊 Add sea and labels on top of heatmap layers
    
    /* =========================== *\
       🌩️ Data handling
    \* =========================== */
    try {
        // Retrieve data (cached or new)
        const gridPoints = await getLandPoints();
        weatherData = await getCachedWeather(gridPoints);
        
        // Initial map render
        updateMapLayers(layers);
        
        console.log("✅ Map initialized and ready.");
    } catch (error) {
        console.error("❌ Critical Error loading map data:", error);
    }
    
    map.on("click", (e) => handleMapClick(e, map, layers));
});

function updateMapLayers(layers) {
    if (!weatherData) return;
    
    const isSimulated = document.getElementById("summer-sim").checked;
    
    // Accumulate heatmap points by metric
    const points = {
        temp: [],
        rain: [],
        soil: [],
        lungworm: [],
        gutworm: [],
        liverfluke: [],
        hairworm: [],
        coccidia: [],
        tick: [],
        combined: [],
    };
    
    // Process each grid point
    weatherData.forEach((batch) => {
        if (!batch.hourly) return;
        
        const lats = Array.isArray(batch.latitude)  ? batch.latitude  : [batch.latitude];
        const lngs = Array.isArray(batch.longitude) ? batch.longitude : [batch.longitude];
            
        lats.forEach((lat, i) => {
            const lng = lngs[i];
            const temp = (Array.isArray(batch.hourly.temperature_2m[0]) ? batch.hourly.temperature_2m[i][0] : batch.hourly.temperature_2m[0]) ?? 0;
            const rain = (Array.isArray(batch.hourly.precipitation[0]) ? batch.hourly.precipitation[i][0] : batch.hourly.precipitation[0]) ?? 0;
            const rawSoil = (Array.isArray(batch.hourly.soil_moisture_3_to_9cm[0]) ? batch.hourly.soil_moisture_3_to_9cm[i][0] : batch.hourly.soil_moisture_3_to_9cm[0]) ?? 0;
            const soil = clamp100((rawSoil / 0.5) * 100); // Normalise to 0-100% (assuming UK saturation is ~0.5)
            
            const simTemp = isSimulated ? temp + 8 : temp;
            points.temp.push({ lat, lng, value: simTemp + 20 }); // Offset to push negative temps into positive range for heatmap
            points.rain.push({ lat, lng, value: rain });
            points.soil.push({ lat, lng, value: soil });
            
            // 🧮 Risk calculations with unified scaling (rain * 10)
            let result = getAllParasiteRisks(temp, rain * 10, clamp100(soil), isSimulated);
            
            let combinedRisk = Object.values(result).reduce((a, b) => a + b, 0) / Object.values(result).length;
            
            Object.keys(result).forEach(key => {
                if (result[key] > 0) points[key].push({ lat, lng, value: result[key] });
            });
            if (combinedRisk > 0) points.combined.push({ lat, lng, value: combinedRisk });
        });
    });
    
    // 🗺️ Update heatmap visuals
    layers.temp.setData({ max: 160, data: points.temp }); // 🤔 Accounts for 40°C + 20 for negative offset, plus arbitrary headroom for heatmap clustering intensity
    layers.rain.setData({ max: 10, data: points.rain });
    ['soil', 'lungworm', 'gutworm', 'liverfluke', 'hairworm', 'coccidia', 'tick', 'combined'].forEach(key => {
        layers[key].setData({ max: 100, data: points[key] });
    });
}

/* =========================== *\
   🧩 Helper functions
\* =========================== */

// 🇬🇧 Create UK-based grid
async function getLandPoints() {
    const res = await fetch("data/uk_land_grid.json");
    return await res.json();
}

// Retrieve data (cached or new)
async function getCachedWeather(points) {
    const CACHE_KEY = "uk_weather_cache_v5"; // ‼️ NB: change each map update to force early refresh for outdated cache - can be made more elegant with versioning for long-term maintenance
    const EXPIRY = 60 * 60 * 1000; // 🕰️ 1 hour
    
    // Check cache
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_KEY + "_ts");
    if (cached && timestamp && Date.now() - timestamp < EXPIRY) {
        console.log("💾 Loading from cache...");
        return JSON.parse(cached);
    }
    
    console.log("🌍 Fetching new data...");
    
    // Batch request to avoid URL length limits
    const BATCH_SIZE = 100;
    let allResults = [];
    
    for (let i = 0; i < points.length; i += BATCH_SIZE) {
        const chunk = points.slice(i, i + BATCH_SIZE);
        const latStr = chunk.map((p) => p.lat).join(",");
        const lonStr = chunk.map((p) => p.lng).join(",");
        
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latStr}&longitude=${lonStr}&hourly=precipitation,temperature_2m,soil_moisture_3_to_9cm&forecast_days=1`;
        
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
    } catch (e) {
        console.warn(`⚠️ Cache full: ${e.message}`);
    }
    
    return allResults;
}

// 🖱️ Click handler with reverse geocoding and weather fetch
function handleMapClick(e, map, layers) {
    const isSimulated = document.getElementById("summer-sim").checked;
    const { lat, lng } = e.latlng;
    console.log(`📍 Clicked: ${lat}, ${lng}`);
    
    // Update coordinates
    document.getElementById("region-coords").textContent =
        `${lat.toFixed(6)}, ${lng.toFixed(7)}`;
    
    // 📍 Get place name via reverse geocoding
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=07a555ce6feb41af804f92291149e61d`;
        fetch(url)
        .then(r => r.json())
        .then(data => {
            const result = data.results?.[0];
            if (!result) return;
            const c = result.components;
            
            const place =
                c.city ||
                c.town ||
                c.village ||
                c.hamlet ||
                c.locality ||
                c.suburb ||
                c.county ||
                "Unknown";
            document.getElementById("region-name").textContent = place;
            
            // Street line (no comma between number + road)
            const streetLine =
                (c.house_number && c.road)
                    ? `${c.house_number} ${c.road}`
                    : c.road || null;
            
            // Building name (if present)
            const nameLine =
                c.shop ||
                c.amenity ||
                c.building ||
                c.attraction ||
                null;
            
            // Assemble full address cleanly
            const addressParts = [
                nameLine,
                streetLine,
                c.suburb,
                c.village,
                c.town,
                c.city,
                c.postcode
            ].filter(Boolean);
            
            // Remove duplicates (if town == city)
            const uniqueAddress = [...new Set(addressParts)];
            
            document.getElementById("region-address").textContent =
                uniqueAddress.join(", ") || "—";
            
            console.log(`📌 Location: ${place}`);
        })
    .catch(() => {
        document.getElementById("region-name").textContent = "Unknown";
        document.getElementById("region-address").textContent = "—";
    });
    
    // ⛈️ Fetch weather and soil data (Open-Meteo)
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation,temperature_2m,soil_moisture_3_to_9cm&forecast_days=1`)
    .then(res => res.json())
    .then(data => {
        const h = data.hourly;
        const temp = h.temperature_2m[0];
        const rain = h.precipitation[0];
        const soil = ((h.soil_moisture_3_to_9cm[0] || 0) / 0.5) * 100;
        
        // Apply simulation buffs to the sidebar display values if active
        const displayTemp = isSimulated ? temp + 8 : temp;
        
        // ➡️ Update sidebar
        document.getElementById("region-temp").textContent = displayTemp.toFixed(1);
        document.getElementById("region-rain").textContent = rain.toFixed(1);
        document.getElementById("region-soil").textContent = soil.toFixed(1);
        
        console.log(
            `🌡️ Temp: ${temp}°C, 🌧️ Rain: ${rain}, 🌱 Soil: ${soil.toFixed(1)}`,
        );
        
        // 📊 Parasite risk calculation with unified scaling (rain * 100 for percentage)
        const risks = getAllParasiteRisks(temp, rain * 100, soil, isSimulated);
        console.log("📊 Risk Result:", risks);
        
        document.getElementById("risk-overall").textContent =  Math.round((Object.values(risks).reduce((total, current) => total + current,0,) / Object.values(risks).length)) ?? 0;
        document.getElementById("risk-gutworm").textContent = risks.gutworm ?? 0;
        document.getElementById("risk-lungworm").textContent = risks.lungworm ?? 0;
        document.getElementById("risk-liverfluke").textContent = risks.liverfluke ?? 0;
        document.getElementById("risk-hairworm").textContent = risks.hairworm ?? 0;
        document.getElementById("risk-coccidia").textContent = risks.coccidia ?? 0;
        document.getElementById("risk-tick").textContent = risks.tick ?? 0;
        
        // 📍 Popup map marker logic
        let activeLayerKey = Object.keys(layers).find(k => map.hasLayer(layers[k]));
        let content = "";
        
        if (activeLayerKey === "temp") {
            content = `<strong>${displayTemp.toFixed(1)}°C</strong>`;
        } else if (activeLayerKey === "rain") {
            content = `<strong>${rain.toFixed(1)}mm</strong>`;
        } else if (activeLayerKey === "soil") {
            content = `<strong>${soil.toFixed(1)}%</strong>`;
        } else if (activeLayerKey === "combined") {
            content =
                Math.round(Object.values(risks).reduce(
                (total, current) => total + current,
                0,
                ) /
                Object.values(risks).length) +
                "%";
        } else if (activeLayerKey && risks[activeLayerKey] !== undefined) {
            // Parasite-specific layers
            content = `<strong>${risks[activeLayerKey]}%</strong>`;
        } else {
            content = "Select a layer to see data";
        }
        
        L.popup({
            className: "custom-popup",
            closeButton: false // ❌ Hides big unecesary X button
        })
        .setLatLng(e.latlng)
        .setContent(content)
        .openOn(map);
    })
    .catch(err => console.error("Fetch error:", err));
}
