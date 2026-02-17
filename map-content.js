document.addEventListener("DOMContentLoaded", function () {
	const mapContainer = document.getElementById("map");
	if (!mapContainer) return;

	// Initialise map
	let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '© OpenStreetMap'
	});
	let map = L.map("map", {
		center: [55.0, -3.5],
		zoom: 5,
		layers: [osm]
	});

	// ⚙️ General heatmap config
	const heatmapCfg = {
		"radius": 0.8,
		"maxOpacity": .8,
		"scaleRadius": true,
		"useLocalExtrema": false,
		"latField": 'lat',
		"lngField": 'lng',
		"valueField": 'value'
	};
	let lungwormCfg = { ...heatmapCfg };
	let gutwormCfg = { ...heatmapCfg };
	let allCfg = { ...heatmapCfg };

	// Unique objects for every radio button option
	let lungwormLayer = new HeatmapOverlay(lungwormCfg);
	let gutwormLayer = new HeatmapOverlay(gutwormCfg);
	let allLayer = new HeatmapOverlay(allCfg);
		
	// Assign datasets
	const lungwormData = [{ lat: 53.3811, lng: -1.4701, value: 1 }];
	const gutwormData = [{ lat: 58.3811, lng: -3.4701, value: 1 }];
	
	lungwormLayer.setData({ max: 1, data: lungwormData });
	gutwormLayer.setData({ max: 1, data: gutwormData });

	// Combined layer with both data sets
	allLayer.setData({ 
		max: 1, 
		data: [...lungwormData, ...gutwormData] 
	});

	// Radio buttons for parasite selection
	let heatmapChoices = {
		"None": L.layerGroup(), 
		"Gut Worms": gutwormLayer, 
		"Lungworm": lungwormLayer, 
		"All": allLayer
	};

	// Base maps - blank to prevent pointless option appearing
	let baseMaps = {
	};

	L.control.layers(heatmapChoices, baseMaps).addTo(map);

	// Default selection
	allLayer.addTo(map);

	// On map click, calculate Rainfall and Temperature for chosen location to work out Parasite Risk
	map.on("click", (e) => {
		console.log(e);
		let values = {
			lat: e.latlng.lat,
			lng: e.latlng.lng,
		};

	console.log("The Coordinates are : ", values);
	fetch(
		`https://api.open-meteo.com/v1/forecast?latitude=${values.lat}&longitude=${values.lng}&hourly=rain,temperature_2m,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm&forecast_days=1`,
	)
	.then((Response) => Response.json())
	.then((object) => {
		console.log(object);
		console.log("The Results of the Fetch Are:  ", object.hourly);
		console.log("Rain:  ", object.hourly.rain[0]);
		console.log("Temperature:  ", object.hourly.temperature_2m[0]);
		console.log(
			"Soil Moisture 1 to 3cm: ",
			object.hourly.soil_moisture_1_to_3cm[0],
		);

			let result = getAllParasiteRisks(
			object.hourly.temperature_2m[0],
			object.hourly.rain[0] * 100,
			);
			console.log(result);
		});
	});
});