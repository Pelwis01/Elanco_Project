  document.addEventListener("DOMContentLoaded", function () {
    const mapContainer = document.getElementById("map");

    if (!mapContainer) return;
    // Initialize the map

    let map = L.map("map").setView([54.5, -3.5], 6); // Coordinates for the UK

    // Add a tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

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
            "Soil Moisture 3 to 9cm: ",
            object.hourly.soil_moisture_3_to_9cm[0]/0.5 * 100,
          );

        
          let result = getAllParasiteRisks(
            object.hourly.temperature_2m[0],
            object.hourly.rain[0] * 100,
            object.hourly.soil_moisture_3_to_9cm[0] /0.5 * 100,
          );
          console.log(result);
            
          

          function onMapClick(e) {
          L.popup({
            className: "custom-popup",
          })
              .setLatLng(e.latlng)
              .setContent(result['coccidia'] + '%')
              .openOn(map);
          }
          
          onMapClick(e);

        });
    });

    // 📊 Placeholder heatmap data:
    let heatData = {
      max: 1,
      data: [{ lat: 53.3811, lng: -1.4701, value: 3 }],
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

    // 📌 Set heatmap data and add to map
    heatmapLayer.setData(heatData);
    heatmapLayer.addTo(map);
  });
