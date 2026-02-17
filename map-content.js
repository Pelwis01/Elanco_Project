document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById("map");

  if (!mapContainer) return;
  // Initialize the map

  let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  });

  let map = L.map("map", {
    center: [54.5, -3.5],
    zoom: 6,
    layers: [osm]
  });

  // On Map Click event to calculate the Rainfall and Temperature for the chosen location to work out the Parasite Risk
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

  // 📊 Placeholder heatmap data:
  let heatData = {
    max: 1,
    data: [{ lat: 53.3811, lng: -1.4701, value: 3 }],
  };

  let gutwormheat = {
    max: 1,
    data: [{ lat: 58.3811, lng: -3.4701, value: 60 }],
  };

  // ⚙️ Heatmap config
  let cfg = {
    radius: 0.1,
    scaleRadius: true, // 🔎 Scaling based on map zoom level
    useLocalExtrema: false,
    latField: "lat",
    lngField: "lng",
    valueField: "value",
  };

  // 🔥 Initialise heatmap overlay using config
  let heatmapLayer = new HeatmapOverlay(cfg);
  console.log(heatmapLayer);
  let gutwormlayer = new HeatmapOverlay(cfg);
  console.log(gutwormlayer);
  // 📌 Set heatmap data and add to map
  heatmapLayer.setData(heatData);
  console.log(heatmapLayer);
  gutwormlayer.setData(gutwormheat);
  console.log(gutwormlayer);
  


let baselayers = {
    
    "Gut Worms": gutwormlayer,
    "Lungworm": heatmapLayer,
  };

  let overlays = {
    "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }),
  };

  L.control.layers(baselayers, overlays).addTo(map);

});
