let weatherData = null;
let layers = null;

document.addEventListener("DOMContentLoaded", async function () {
	setCurrentHour();
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
		// Below are two style options - the first with and the second without farm highlights. One should be commented out depending on preference.
		"https://api.mapbox.com/styles/v1/bryzerse/cmlyheaow001g01qyft8m8tos/tiles/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoiYnJ5emVyc2UiLCJhIjoiY2traWNsZWhmMG13MzJvcGdiZ3hkbjlodyJ9.BV94uCu_hACQrqEbO74A8w",
		// "https://api.mapbox.com/styles/v1/bryzerse/cmlsnxjpl001c01s951lgbjdp/tiles/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoiYnJ5emVyc2UiLCJhIjoiY2traWNsZWhmMG13MzJvcGdiZ3hkbjlodyJ9.BV94uCu_hACQrqEbO74A8w",
		{
			attribution: '&copy; Mapbox'
		}
	);
	
	// 🗺️ Initialise land-only Leaflet map over British Isles
	const map = L.map("map", { zoomControl: false })
		.setView([54.5, -4.0], 6);

	mapBase.addTo(map);
	
  map.options.minZoom = 6;
  map.options.maxZoom = 10;

	// 🌾 Agricultural land overlay with hover highlight (TBA)
	const agriData = await fetch("data/FarmCensusDistrictElectoralArea2019_1860894812733494281.geojson").then(r => r.json());
	
	function highlightFeature(e) {
		const layer = e.target;
		layer.setStyle({ weight: 5, color: '#666', fillOpacity: 0.7 });
		layer.bringToFront(); // Ensures highlight is visible
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
	
	// 🌊 Sea + labels overlay
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
	const createLayer = (gradient) =>
		new HeatmapOverlay({ ...baseCfg, gradient });
	
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
	layers = {
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
	div.innerHTML += "<h4>Map Key</h4>";
	div.innerHTML += '<i style="background: green"></i><span>Low</span><br>';
	div.innerHTML +=
	  '<i style="background: yellow"></i><span>Medium</span><br>';
	div.innerHTML += '<i style="background: red"></i><span>High</span><br>';
	return div;
	};
	
	legend.addTo(map);
	
	L.control.layers(layerControl, {}).addTo(map);
	layers.combined.addTo(map); // 🗺️ Default view - combined risk map
	
	mapTop.addTo(map); // 🌊 Add sea and labels on top of heatmap layers
	

const search = new GeoSearch.GeoSearchControl({
  provider: new GeoSearch.OpenStreetMapProvider(),
});

map.addControl(search);
	/* =========================== *\
	   🌩️ Data handling
	\* =========================== */
	try {
		// Retrieve data (cached or new)
		const gridPoints = await getLandPoints();
		weatherData = await getCachedWeather(gridPoints);
		elevationData= await getElevation(gridPoints);
		weatherData[0].elevation = elevationData;

		console.log(weatherData)
		// Initial map render
		updateMapLayers();
		
		console.log("✅ Map initialized and ready.");
	} catch (error) {
		console.error("❌ Critical Error loading map data:", error);
	}
	
	map.on("click", (e) => handleMapClick(e, map, layers));
});

function updateMapLayers() {
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
			const elevation = batch.elevation ? (Array.isArray(batch.elevation) ? batch.elevation[i] : batch.elevation) : 0;
			const simTemp = isSimulated ? temp + 8 : temp;
			points.temp.push({ lat, lng, value: simTemp + 20 }); // Offset to push negative temps into positive range for heatmap
			points.rain.push({ lat, lng, value: rain });
			points.soil.push({ lat, lng, value: soil });
			points.elevation.push({ lat, lng, value: elevation });
			
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

// 📊 Retrieve data (cached or new)
async function getCachedWeather(points) {
	const CACHE_KEY = "uk_weather_cache_v5"; // ‼️ NB: change each map update to force early refresh for outdated cache - can be made more elegant with versioning for long-term maintenance
	const EXPIRY = 60 * 60 * 1000; // 🕰️ 1 hour
	
	// 🔄 Show loading overlay
	document.getElementById("loading-overlay").style.display = "flex";
	
	// 💾 Check cache
	const cached = localStorage.getItem(CACHE_KEY);
	const timestamp = localStorage.getItem(CACHE_KEY + "_ts");
	if (cached && timestamp && Date.now() - timestamp < EXPIRY) {
		console.log("💾 Loading from cache...");
		document.getElementById("loading-overlay").style.display = "none";
		return JSON.parse(cached);
	}
	
	console.log("🌍 Fetching new data...");
	
	// 🧺 Batch request to avoid limits
	const BATCH_SIZE = 100;
	let allResults = [];
	
	const totalBatches = Math.ceil(points.length / BATCH_SIZE);
	
	for (let i = 0; i < points.length; i += BATCH_SIZE) {
		const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
		const chunk = points.slice(i, i + BATCH_SIZE);
		const latStr = chunk.map((p) => p.lat).join(",");
		const lonStr = chunk.map((p) => p.lng).join(",");
		
		console.log(
			`📦 Batch ${batchIndex}/${totalBatches} | Points ${i + 1}-${i + chunk.length}`
		);
		
		const url = `https://api.open-meteo.com/v1/forecast?latitude=${latStr}&longitude=${lonStr}&hourly=precipitation,temperature_2m,soil_moisture_3_to_9cm&forecast_days=1`;
		const start = performance.now();

		try {
			const res = await fetch(url);
			
			if (res.status === 429) {
				console.warn("⏳ Rate limited — waiting 6s...");
				await new Promise(r => setTimeout(r, 6000));
				i -= BATCH_SIZE; // ↩️ Retry batch
				continue;
			}
			
			if (!res.ok) throw new Error(`⚠️ Batch ${i} failed`);
			const data = await res.json();
			
			// 🗃️ Normalise to array format for consistency
			allResults = allResults.concat(Array.isArray(data) ? data : [data]);
			
			const duration = ((performance.now() - start) / 1000).toFixed(2);
			console.log(`✅ Batch ${batchIndex} complete (${duration}s)`);
		} catch (err) {
			console.warn(`⚠️ Batch failed: ${err.message}`);
		}
		
		await new Promise(r => setTimeout(r, 1000)); // ⏳ Throttle requests 1 second to be safe against rate limits
	}
	
	// 💾 Cache
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify(allResults));
		localStorage.setItem(CACHE_KEY + "_ts", Date.now());
	} catch (e) {
		console.warn(`⚠️ Cache full: ${e.message}`);
	}
	
	document.getElementById("loading-overlay").style.display = "none";
	return allResults;
}


function getElevation(points) {

	let allResults = [];
	
		elevationData = fetch(`data/elevation_data.json?lat=${points.lat}&lon=${points.lon}`)
			.then((res) => res.json())
			.then((data) => {
				
				for (let i = 0; i < data.length; i++) {
					allResults.push({
						evelation: data[i].elevation[0],
					});
				}
				console.log(allResults);
				console.log("✅ Elevation data retrieved");
			})
			.catch((err) => {
				console.warn(`⚠️ Elevation batch failed: ${err.message}`);
			});
	
	
	return allResults;
}	