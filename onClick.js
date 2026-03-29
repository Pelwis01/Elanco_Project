// 🖱️ Click handler with reverse geocoding and weather fetch
function handleMapClick(e, map, layers) {
  document.getElementById("predictive-data").classList.remove("hidden");
  document.getElementById("m-predictive-data").classList.remove("hidden");
  document.getElementById("before-predictive").classList.add("hidden");
  document.getElementById("m-before-predictive").classList.add("hidden");

  const isSimulated = document.getElementById("summer-sim").checked;
  let elevation = 0;
  const { lat, lng } = e.latlng;
  console.log(`📍 Clicked: ${lat}, ${lng}`);

  // 🌐 Update coordinates
  //document.getElementById("region-coords").textContent =
  //`${lat.toFixed(6)}, ${lng.toFixed(7)}`;
  const coordsText = `${lat.toFixed(6)}, ${lng.toFixed(7)}`;

  setText("region-coords", coordsText);
  setText("m-region-coords", coordsText);

  // 📍 Get place name via reverse geocoding
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=07a555ce6feb41af804f92291149e61d`;
  fetch(url)
    .then((r) => r.json())
    .then((data) => {
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
      setText("region-name", place);
      setText("m-region-name", place);

      // Street line (no comma between number + road)
      const streetLine =
        c.house_number && c.road
          ? `${c.house_number} ${c.road}`
          : c.road || null;

      // Building name (if present)
      const nameLine =
        c.shop || c.amenity || c.building || c.attraction || null;

      // Assemble full address cleanly
      const addressParts = [
        nameLine,
        streetLine,
        c.suburb,
        c.village,
        c.town,
        c.city,
        c.postcode,
      ].filter(Boolean);

      // Remove duplicates (if town == city)
      const uniqueAddress = [...new Set(addressParts)];
      const addressText = uniqueAddress.join(", ") || "—";

      setText("region-address", addressText);
      setText("m-region-address", addressText);

      console.log(`📌 Location: ${place}`);
    })
    .catch(() => {
      setText("region-name", "Unknown");
      setText("region-address", "—");
    });

  getElevation(lat, lng).then((elev) => {
    elevation = elev;
    console.log(`🏔️ Elevation: ${elevation} m`);
  });

  // ⛈️ Fetch weather and soil data for precise clicked location (Open-Meteo)
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation,temperature_2m,soil_moisture_3_to_9cm&forecast_days=3`,
  )
    .then((res) => res.json())
    .then((data) => {
      const context = {};
      const id = {
        gutworm: "risk-gutworm",
        lungworm: "risk-lungworm",
        liverfluke: "risk-liverfluke",
        hairworm: "risk-hairworm",
        coccidia: "risk-coccidia",
        tick: "risk-tick",
      };
      const mobile_id = {
        gutworm: "m-risk-gutworm",
        lungworm: "m-risk-lungworm",
        liverfluke: "m-risk-liverfluke",
        hairworm: "m-risk-hairworm",
        coccidia: "m-risk-coccidia",
        tick: "m-risk-tick",
      };
      console.log("📊 Weather & Soil Data:", data);

      const riskEvaluation = () => {
        let value =
          Number.parseInt(document.getElementById("hour").value) ||
          Number.parseInt(document.getElementById("m-hour").value);
        let style = "";
        console.log("value: ", value);
        const h = data.hourly;
        const temp = h.temperature_2m[value];
        const rain = h.precipitation[value];
        const soil = ((h.soil_moisture_3_to_9cm[value] || 0) / 0.5) * 100;

        const risks = getAllParasiteRisks(
          temp,
          rain * 10,
          soil,
          elevation,
          isSimulated,
        );
        for (let i in risks) {
          if (risks[i] <= 30) {
            context[i] = "Low";
            style = "color : green; font-weight : bold";
          } else if (risks[i] <= 70) {
            context[i] = "Medium";
            style = "color : orange; font-weight : bold";
          } else {
            context[i] = "High";
            style = "color :  red; font-weight : bold";
          }
          setText(id[i], `${context[i]} (${Math.round(risks[i])}%)`);
          setText(mobile_id[i], `${context[i]}  (${Math.round(risks[i])}%)`);

          document.getElementById(id[i]).style = style;
          document.getElementById(mobile_id[i]).style = style;
        }

        setText("region-temp", temp.toFixed(1));
        setText("region-rain", rain.toFixed(1));
        setText("region-soil", soil.toFixed(1));
        setText("region-altitude", elevation);

        setText("m-region-temp", temp.toFixed(1));
        setText("m-region-rain", rain.toFixed(1));
        setText("m-region-soil", soil.toFixed(1));
        setText("m-region-altitude", elevation);

        console.log("📊 Risk Result:", risks);

        console.log(
          `🌡️ Temp: ${temp}°C, 🌧️ Rain: ${rain}, 🌱 Soil: ${soil.toFixed(1)}`,
        );

        updateGuideStyles();
        return risks;
      };

      const risks = riskEvaluation();

      document.addEventListener("change", riskEvaluation);

      // 📍 Popup map marker logic
      let activeLayerKey = Object.keys(layers).find((k) =>
        map.hasLayer(layers[k]),
      );
      let content = "";

      if (activeLayerKey === "combined") {
        content =
          Math.round(
            Object.values(risks).reduce(
              (total, current) => total + current,
              0,
            ) / Object.values(risks).length,
          ) + "%";
      } else if (activeLayerKey && risks[activeLayerKey] !== undefined) {
        // Parasite-specific layers
        content = `<strong>${risks[activeLayerKey]}%</strong>`;
      }

      if (content != "") {
        L.popup({
          className: "custom-popup",
          closeButton: false, // ❌ Hides big unecesary X button
        })
          .setLatLng(e.latlng)
          .setContent(content)
          .openOn(map);
      }
    })
    .catch((err) => console.error("Fetch error:", err));
}

function setCurrentHour() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentDate = `${currentDay}/0${currentMonth}/${currentYear}`;

  document.getElementById("hour-value").textContent = currentHour;
  document.getElementById("m-hour-value").textContent = currentHour;
  document.getElementById("date-value").textContent = currentDate;
  document.getElementById("m-date-value").textContent = currentDate;
}

function changeDate(value) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDate();

  let Newtime = currentHour + Number.parseInt(value);
  let daysToAdd = Math.floor(Newtime / 24);
  let NewDate = currentDay + daysToAdd;

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  let currentDate = `${NewDate}/0${currentMonth}/${currentYear}`;

  document.getElementById("hour-value").textContent = Newtime % 24;
  document.getElementById("m-hour-value").textContent = Newtime % 24;
  document.getElementById("date-value").textContent = currentDate;
  document.getElementById("m-date-value").textContent = currentDate;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getElevation(lat, lng) {
  return fetch(
    `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`,
  )
    .then((r) => r.json())
    .then((data) => {
      const elevation = data.elevation;
      return elevation;
    });
}

function getRiskLevel(value) {
  const brackPos = value.indexOf("(");
  const percPos = value.indexOf("%");
  console.log(brackPos);
  console.log(percPos);
  value = value.substring(brackPos + 1, percPos);
  console.log(value);
  value = Number.parseFloat(value);

  if (Number.isNaN(value)) return null;

  if (value <= 30) return "low";
  if (value <= 70) return "medium";
  return "high";
}

function updateGuideStyles() {
  const parasites = [
    "gutworm",
    "lungworm",
    "liverfluke",
    "hairworm",
    "coccidia",
    "tick",
  ];

  parasites.forEach((p) => {
    const riskEl = document.getElementById(`risk-${p}`);
    const tagEl = document.getElementById(`tag-${p}`);
    const cardEl = document.getElementById(`guide-${p}`);

    if (!riskEl || !tagEl || !cardEl) return;

    const value = riskEl.textContent;
    const level = getRiskLevel(value);

    if (!level) return;

    tagEl.textContent = level.toUpperCase();

    tagEl.classList.remove("low", "medium", "high");
    cardEl.classList.remove("low", "medium", "high");

    tagEl.classList.add(level);
    cardEl.classList.add(level);
  });
}
