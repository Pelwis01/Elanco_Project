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
	let gutwormCfg = { ...heatmapCfg };
  let lungwormCfg = { ...heatmapCfg };
	let liverflukeCfg = { ...heatmapCfg };
  let hairwormCfg = { ...heatmapCfg };
  let coccidiaCfg = { ...heatmapCfg };
	let allCfg = { ...heatmapCfg };

	// Unique objects for every radio button option
	let gutwormLayer = new HeatmapOverlay(gutwormCfg);
  let lungwormLayer = new HeatmapOverlay(lungwormCfg);
	let liverflukeLayer = new HeatmapOverlay(liverflukeCfg);
  let hairwormLayer = new HeatmapOverlay(hairwormCfg);
  let coccidiaLayer = new HeatmapOverlay(coccidiaCfg);
	let allLayer = new HeatmapOverlay(allCfg);
		
	// Assign datasets
	const gutwormData = [{ lat: 58.3811, lng: -3.4701, value: 1 }];
  const lungwormData = [{ lat: 53.3811, lng: -1.4701, value: 1 }];
	const liverflukeData = [{ lat: 54.3811, lng: -2.4701, value: 1 }];
  const hairwormData = [{ lat: 56.3811, lng: -4.4701, value: 1 }];
  const coccidiaData = [{ lat: 57.3811, lng: -5.4701, value: 1 }];
	
  gutwormLayer.setData({ max: 1, data: gutwormData });
	lungwormLayer.setData({ max: 1, data: lungwormData });
	liverflukeLayer.setData({ max: 1, data: liverflukeData });
  hairwormLayer.setData({ max: 1, data: hairwormData });
  coccidiaLayer.setData({ max: 1, data: coccidiaData });

	// Combined layer with both data sets
	allLayer.setData({ 
		max: 1, 
		data: [...gutwormData, ...lungwormData, ...liverflukeData, ...hairwormData, ...coccidiaData] 
	});

	// Radio buttons for parasite selection
	let heatmapChoices = {
		"None": L.layerGroup(), 
		"Gut Worms": gutwormLayer, 
		"Lungworm": lungwormLayer, 
    "Liver Fluke": liverflukeLayer,
    "Hair Worm": hairwormLayer,
    "Coccidia": coccidiaLayer,
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