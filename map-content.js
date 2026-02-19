document.addEventListener("DOMContentLoaded", async function () {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

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

    // 🌊 Sea + Labels overlay
    const mapTop = L.tileLayer(
        "https://api.mapbox.com/styles/v1/bryzerse/cmlsoi77b001901sag1cug1yy/tiles/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoiYnJ5emVyc2UiLCJhIjoiY2traWNsZWhmMG13MzJvcGdiZ3hkbjlodyJ9.BV94uCu_hACQrqEbO74A8w",
        {
            attribution: '&copy; Mapbox',
            pane: 'overlayPane'
        }
    );

    // 🗺️ Initialise land-only Leaflet map over the British Isles
    var map = L.map("map", { zoomControl: false })
        .setView([54.5, -4.0], 6);
    
    mapBase.addTo(map);

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

    // Define Gradients
    const tempGrad = { '.1': 'darkblue', '.4': 'blue', '.6': 'gold', '.9': '#FF8C00' };
    const rainGrad = { '.1': '#A0C8FF', '.5': '#0055FF', '.9': '#000080' };
    const riskGrad = { '.1': 'green', '.4': 'yellow', '.7': 'orange', '1': 'red' };

    // Instantiate Layers
    const layers = {
        temp: createLayer(tempGrad),
        rain: createLayer(rainGrad),
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
        "Lungworm Risk": layers.lungworm,
        "Gutworm Risk": layers.gutworm,
        "Liver Fluke Risk": layers.liverfluke,
        "Hairworm Risk": layers.hairworm,
        "Coccidia Risk": layers.coccidia,
        "Tick Risk": layers.tick,
        "Combined Risk (Max)": layers.combined
    };

        
    /*Legend specific*/
    let legend = L.control({ position: "bottomleft" });

    legend.onAdd = function(map) {
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
        const weatherData = await getCachedWeather(gridPoints);

        const points = {
        temp: [],
        rain: [],
        soil_moisture: [],
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

        const lats = Array.isArray(batch.latitude)
            ? batch.latitude
            : [batch.latitude];
        const lngs = Array.isArray(batch.longitude)
            ? batch.longitude
            : [batch.longitude];

        lats.forEach((lat, i) => {
            const lng = lngs[i];

            const tempArray = Array.isArray(batch.hourly.temperature_2m[0])
            ? batch.hourly.temperature_2m[i]
            : batch.hourly.temperature_2m;

            const rainArray = Array.isArray(batch.hourly.precipitation[0])
            ? batch.hourly.precipitation[i]
            : batch.hourly.precipitation;

            const soilmoistureArray = Array.isArray(
            batch.hourly.soil_moisture_3_to_9cm[0],
            )
            ? batch.hourly.soil_moisture_3_to_9cm[i]
            : batch.hourly.soil_moisture_3_to_9cm;

            const temp = tempArray[0] ?? 0;
            const rain = rainArray[0] ?? 0;
            const soil_moisture = soilmoistureArray[0] ?? 0;

            points.temp.push({ lat, lng, value: temp });
            if (rain > 0) points.rain.push({ lat, lng, value: rain });
            points.soil_moisture.push({ lat, lng, value: soil_moisture });

            // Risk calculations
            let result = getAllParasiteRisks(
            temp,
            rain * 100,
            (soil_moisture / 0.5) * 100,
            );
            let combinedRisk =
            (result.lungworm +
                result.gutworm +
                result.liverfluke +
                result.hairworm +
                result.coccidia +
                result.tick) /
            6; 

            if (result.lungworm > 0)
            points.lungworm.push({ lat, lng, value: result.lungworm });
            if (result.gutworm > 0)
            points.gutworm.push({ lat, lng, value: result.gutworm });
            if (result.liverfluke > 0)
            points.liverfluke.push({ lat, lng, value: result.liverfluke });
            if (result.hairworm > 0)
            points.hairworm.push({ lat, lng, value: result.hairworm });
            if (result.coccidia > 0)
            points.coccidia.push({ lat, lng, value: result.coccidia });
            if (result.tick > 0)
            points.tick.push({ lat, lng, value: result.tick });
            if (combinedRisk > 0)
            points.combined.push({ lat, lng, value: combinedRisk });
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
        layers.tick.setData({ max: 100, data: points.tick });
        layers.combined.setData({ max: 100, data: points.combined });

        console.log(`✅ Map updated with ${points.temp.length} grid points.`);
    } catch (error) {
        console.error("❌ Critical Error loading map data:", error);
    }

    /* =========================== *\
       🖱️ Map click
    \* =========================== */
    map.on("click", (e) => {
        handleMapClick(e, map, layers);
    });
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
    const CACHE_KEY = "uk_weather_cache_v4"; // NB: change each update to force refresh for outdated cache
    const EXPIRY = 60 * 60 * 1000; // 1 hour
    
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

// Click handler
function handleMapClick(e, map, layers) {
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
            
            // Build street line (no comma between number + road)
            const streetLine =
                (c.house_number && c.road)
                    ? `${c.house_number} ${c.road}`
                    : c.road || null;
            
            // Business / building name if present
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
            
            // Remove duplicates (sometimes town == city)
            const uniqueAddress = [...new Set(addressParts)];
            
            document.getElementById("region-address").textContent =
                uniqueAddress.join(", ") || "—";
                
            console.log(`📌 Location: ${place}`);
        })
    .catch(() => {
        document.getElementById("region-name").textContent = "Unknown";
        document.getElementById("region-address").textContent = "—";
    });
        
    // Fetch local soil data (separate to save bandwidth)
    fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation,temperature_2m,soil_moisture_3_to_9cm&forecast_days=1`,
    )
    .then((res) => res.json())
    .then((data) => {
        const h = data.hourly;
        const temp = h.temperature_2m[0];
        const rain = h.precipitation[0];
        const soil = ((h.soil_moisture_3_to_9cm[0] || 0) / 0.5) * 100;
        
        // ➡️ Update sidebar
        document.getElementById("region-temp").textContent = temp.toFixed(1);
        document.getElementById("region-rain").textContent = rain.toFixed(1);
        document.getElementById("region-soil").textContent = soil.toFixed(1);
        
        console.log(
            `🌡️ Temp: ${temp}°C, 🌧️ Rain: ${rain}, 🌱 Soil: ${soil.toFixed(1)}`,
        );
        
        // Call external risk function if it exists
        if (typeof getAllParasiteRisks === "function") {
            const risks = getAllParasiteRisks(temp, rain * 100, soil);
            console.log("📊 Risk Result:", risks);
        
            document.getElementById("risk-overall").textContent =  (Object.values(risks).reduce((total, current) => total + current,0,) / 5) ?? 0;
            document.getElementById("risk-gutworm").textContent = risks.gutworm ?? 0;
            document.getElementById("risk-lungworm").textContent = risks.lungworm ?? 0;
            document.getElementById("risk-liverfluke").textContent = risks.liverfluke ?? 0;
            document.getElementById("risk-hairworm").textContent = risks.hairworm ?? 0;
            document.getElementById("risk-coccidia").textContent = risks.coccidia ?? 0;
            document.getElementById("risk-tick").textContent = risks.tick ?? 0;
            


            let activelayer = Object.keys(layers).find((layer) =>
            map.hasLayer(layers[layer]),
            );
            let content = null;
            if (activelayer === "temp") {
            content = temp + "°C";
            } else if (activelayer === "rain") {
            content = rain + "mm";
            } else if (activelayer === "combined") {
            content =
                Math.round(Object.values(risks).reduce(
                (total, current) => total + current,
                0,
                ) /
                Object.values(risks).length) +
                "%";
            } else {
            content = risks[activelayer] + "%";
            console.log("Active Layer:", activelayer, "Content:", content);
            console.log("Layers on map:", Object.keys(layers).filter((layer) => map.hasLayer(layers[layer])));
            document.getElementById(activelayer).style.display = "block";
            }
            L.popup({
            className: "custom-popup",
            })
            .setLatLng(e.latlng)
            .setContent(content)
            .openOn(map);
        }
    })
    .catch((err) => console.error("Local fetch failed", err));
}
