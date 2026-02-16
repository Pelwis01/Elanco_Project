document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById("map");

  if (!mapContainer) return;
  // Initialize the map

  var map = L.map("map").setView([54.5, -3.5], 6); // Coordinates for the UK

  // Add a tile layer (OpenStreetMap)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  map.on("click", (e) => {
    console.log(e);
    let values = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    };

    console.log("The Coordinates are : ", values);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${values.lat}&longitude=${values.lng}&current=rain,temperature_2m,precipitation,precipitation_probability&models=ukmo_uk_deterministic_2km,ukmo_global_deterministic_10km&forecast_days=1`,
    )
      .then((Response) => Response.json())
      .then((object) => {
        console.log(object);
        console.log("The Results of the Fetch Are:  ", object.current);
        console.log("Rain:  ", object.current.rain);
        console.log("Temperature:  ", object.current.temperature_2m);

        let result = getAllParasiteRisks(
          object.current.temperature_2m,
          object.current.rain * 100,
        );
        console.log(result);
      });
  });

  // 📊 Placeholder heatmap data:
  var heatData = {
    max: 1,
    data: [{ lat: 53.3811, lng: -1.4701, value: 1.0 }],
  };

  // ⚙️ Heatmap config
  var cfg = {
    radius: 0.3,
    scaleRadius: true, // 🔎 Scaling based on map zoom level
    useLocalExtrema: false,
    latField: "lat",
    lngField: "lng",
    valueField: "value",
  };

  // 🔥 Initialise heatmap overlay using config
  var heatmapLayer = new HeatmapOverlay(cfg);

  // 📌 Set heatmap data and add to map
  heatmapLayer.setData(heatData);
  heatmapLayer.addTo(map);
});
