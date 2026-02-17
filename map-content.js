document.addEventListener("DOMContentLoaded", async function () {

    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    const map = L.map("map").setView([54.5, -3.5], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    const cfg = {
        // Slightly larger than grid step (0.5) to ensure point blending.
        radius: 0.8, 
        
        scaleRadius: true,
        useLocalExtrema: false,
        latField: "lat",
        lngField: "lon",
        valueField: "value",
        
        // 2. ADD WEATHER COLORS (Optional):
        // This makes light rain blue and heavy rain red
        gradient: {
            '.1': 'blue',
            '.2': 'green',
            '.5': 'yellow',
            '.8': 'orange',
            '.95': 'red'
        }
    };

    const heatmapLayer = new HeatmapOverlay(cfg);
    heatmapLayer.addTo(map);
    
    const gridPoints = generateUKGrid(0.5); // 0.5 degree step gives ~400 points across the UK.
    
    // Note: Fetching 400 points might take a second longer
    const weather = await fetchWeatherGrid(gridPoints);

    const heatPoints = convertWeather(weather, gridPoints);

    heatmapLayer.setData({
        max: 10, // 10mm rain - sensible UK limit
        data: heatPoints
    });
});

/* =========================== *\
   Coordinate grid
\* =========================== */
function generateUKGrid(step) {
    const points = [];
    // Expanded range slightly to cover edges of the map
    for (let lat = 48; lat <= 62; lat += step) {
        for (let lon = -12; lon <= 4; lon += step) {
            points.push({ lat, lon });
        }
    }
    return points;
}

/* =========================== *\
   Fetch weather safely
\* =========================== */
async function fetchWeatherGrid(points) {
    // Open-Meteo handles large URL lists well, but if you go much finer than 0.5 step, you might need to batch requests.
    const latList = points.map(p => p.lat).join(",");
    const lonList = points.map(p => p.lon).join(",");

    const url =
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${latList}` +
        `&longitude=${lonList}` +
		`&hourly=precipitation,temperature_2m` +
        `&forecast_days=1`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API failed");
    return await res.json();
}

/* =========================== *\
   Convert to heatmap points
============================ */
function convertWeather(weatherArray, gridPoints) {
    const heat = [];

    // Open-Meteo returns a single object with arrays if you send multiple coords, 
    // OR an array of objects. We need to handle the format carefully.
    // *If the API returns an array (standard for multi-point)*:
    
    const dataList = Array.isArray(weatherArray) ? weatherArray : [weatherArray];

    for (let i = 0; i < dataList.length; i++) {
        const w = dataList[i];
        if (!w.hourly || !w.hourly.precipitation) continue;

        const rainfall = w.hourly.precipitation[0]; 

        // 4. (OPTIONAL) SHOW DRY AREAS:
        // If you want the WHOLE map colored, comment out the next line.
        // However, standard heatmaps are transparent at 0.
        // if (rainfall <= 0) continue; 

        heat.push({
            lat: w.latitude,
            lon: w.longitude,
            // Use a minimum value of 0.1 so even light rain registers
            value: rainfall > 0 ? rainfall : 0 
        });
    }

    console.log("Heat points generated:", heat.length);
    return heat;
}
