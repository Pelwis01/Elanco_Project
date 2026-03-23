
// 🖱️ Click handler with reverse geocoding and weather fetch
function handleMapClick(e, map, layers) {

    document.getElementById("before-predictive").style.display = "none";
    document.getElementById("predictive-data").style.display = "block";

    
	const isSimulated = document.getElementById("summer-sim").checked;
	const { lat, lng } = e.latlng;
	console.log(`📍 Clicked: ${lat}, ${lng}`);
	
	// 🌐 Update coordinates
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
	
	// ⛈️ Fetch weather and soil data for precise clicked location (Open-Meteo)
	fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation,temperature_2m,soil_moisture_3_to_9cm&forecast_days=3`)
	.then(res => res.json())
	.then(data => {
        const context = {};
    
        const id = {gutworm: "risk-gutworm", lungworm: "risk-lungworm", liverfluke: "risk-liverfluke", hairworm: "risk-hairworm", coccidia: "risk-coccidia", tick: "risk-tick"};
		let value = document.getElementById("hour").value ?? 0;
    
		const h = data.hourly;
		const temp = h.temperature_2m[value];
		const rain = h.precipitation[value];
		const soil = ((h.soil_moisture_3_to_9cm[value] || 0) / 0.5) * 100;
		
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
		const risks = getAllParasiteRisks(temp, rain * 10, soil, isSimulated);
       console.log("📊 Risk Result:", risks);

		for (let i in risks) {
            CombinedRisk = Math.round((Object.values(risks).reduce((total, current) => total + current,0,) / Object.values(risks).length));

			if (risks[i] <= 30) context[i] = "Low";
			else if (risks[i] <= 70) context[i] = "Medium";
			else context[i] = "High";
            document.getElementById(id[i]).textContent = context[i];
		}

        document.addEventListener("change", () => {    

            value = document.getElementById("hour").value ?? 0;
            const temp = h.temperature_2m[value];
            const rain = h.precipitation[value];
            const soil = ((h.soil_moisture_3_to_9cm[value] || 0) / 0.5) * 100;
            console.log(value);
            predictedrisks = getAllParasiteRisks(temp, rain * 10, soil);
            console.log("Predicted Risks:", predictedrisks);
            console.log("Predicted Context:", context);
            for (let i in predictedrisks) {


                if (predictedrisks[i] <= 30) {
                    context[i] = "Low";
                    style = "color : green; font-weight : bold";
                }
                else if (predictedrisks[i] <= 70) {
                    context[i] = "Medium";
                    style = "color : orange; font-weight : bold";
                }
                else {
                    context[i] = "High";
                    style = "color :  red; font-weight : bold";
                }
                document.getElementById(id[i]).textContent = context[i];
                document.getElementById(id[i]).style = style;
            }
        });


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

function getActiveLayerName(layers, map) {
	return Object.keys(layers).find((layer) => map.hasLayer(layers[layer]));
}

function updateValue(e, element) {
    document.getElementById(element).textContent = e;
}

function setCurrentHour() {
    const now = new Date();
    const currentHour = now.getHours();
    document.getElementById("hour").value = currentHour;
    document.getElementById("hour-value").textContent = currentHour;
}
