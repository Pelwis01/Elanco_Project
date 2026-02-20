const fs = require("fs");

const STEP = 0.5;
const BATCH_SIZE = 100;
const OUTPUT = "uk_land_grid.json";

function sleep(ms) {
	return new Promise(r => setTimeout(r, ms));
}

function key(lat, lon) {
	return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

async function generateGrid() {

	const rawPoints = [];

	for (let lat = 49; lat <= 61; lat += STEP) {
		for (let lon = -11; lon <= 2; lon += STEP) {
			rawPoints.push({ lat, lon });
		}
	}

	console.log(`Total raw points: ${rawPoints.length}`);

	const landSet = new Set();
	const allPoints = new Map();

	for (let i = 0; i < rawPoints.length; i += BATCH_SIZE) {

		const chunk = rawPoints.slice(i, i + BATCH_SIZE);

		const latList = chunk.map(p => p.lat).join(",");
		const lonList = chunk.map(p => p.lon).join(",");

		const url = `https://api.open-meteo.com/v1/elevation?latitude=${latList}&longitude=${lonList}`;

		try {

			const res = await fetch(url);
			if (!res.ok) throw new Error(res.status);

			const data = await res.json();

			chunk.forEach((p, idx) => {
				const k = key(p.lat, p.lon);
				allPoints.set(k, { lat: p.lat, lng: p.lon });

				if (data.elevation[idx] > 0) {
					landSet.add(k);
				}
			});

			console.log(`Processed ${i + chunk.length} / ${rawPoints.length}`);

		} catch (err) {
			console.log("Retrying batch...");
			i -= BATCH_SIZE;
			await sleep(1000);
			continue;
		}

		await sleep(300);
	}

	// Add coastal neighbours
	const finalSet = new Set(landSet);

	for (const k of landSet) {
		const [lat, lon] = k.split(",").map(Number);

		for (let dLat = -STEP; dLat <= STEP; dLat += STEP) {
			for (let dLon = -STEP; dLon <= STEP; dLon += STEP) {

				const neighbourKey = key(lat + dLat, lon + dLon);

				if (allPoints.has(neighbourKey)) {
					finalSet.add(neighbourKey);
				}
			}
		}
	}

	const finalPoints = Array.from(finalSet).map(k => {
		const [lat, lon] = k.split(",").map(Number);
		return { lat, lng: lon };
	});

	fs.writeFileSync(OUTPUT, JSON.stringify(finalPoints, null, 2));

	console.log(`Saved ${finalPoints.length} buffered land points → ${OUTPUT}`);
}

generateGrid();
