// Temp in °C, rainfall in mm, soilMoisture in % (0–100) for 3–9cm depth, Altitude in meters (m)
// Returns risk scores (0–100) for various parasites, where higher scores indicate higher risk 
// Each parasite has unique thresholds and weightings based on its biology 
// Rainfall multiplier varies depending on the parasite's moisture dependency

function getAllParasiteRisks(temp, rainfall, soilMoisture, altitude, isSimulated = false) {

	let finalTemp = Number(temp);
	let finalRain = Number(rainfall);
	let finalSoil = Number(soilMoisture);
	let finalAlt = Number(altitude);

	if (isSimulated) {
		finalTemp += 8;              // simulate warmer summer
		finalSoil = Math.max(finalSoil, 75); // Ensure soil isn't too dry for life
		finalRain = Math.max(finalRain, 2); // Assume light rain for summer
	}

	return {
		gutworm:    gutwormRisk(finalTemp, finalRain, finalSoil, finalAlt),
		lungworm:   lungwormRisk(finalTemp, finalRain, finalSoil, finalAlt),
		liverfluke: liverflukeRisk(finalTemp, finalRain, finalSoil, finalAlt),
		hairworm:   hairwormRisk(finalTemp, finalRain, finalSoil, finalAlt),
		coccidia:   coccidiaRisk(finalTemp, finalRain, finalSoil, finalAlt),
		tick:       tickRisk(finalTemp, finalRain, finalSoil, finalAlt)
	};
}


// Helper functions for scoring to make sure that it as accurate as possible
// Ensures the value is within the range 0–100
function clamp100(val) {
	if (!Number.isFinite(val)) return 0;
	return Math.min(100, Math.max(0, val));
}
 // Gaussian distribution function for scoring based on mean and standard deviation
function gaussian(x, mean, stdDev) {
	if (!Number.isFinite(x)) return 0;
	return Math.exp(-0.5 * ((x - mean) / stdDev) ** 2);
}
// Saturating function for scoring, where the score approaches 100 as x increases
function saturating(x, halfPoint) {
	if (!Number.isFinite(x) || x <= 0) return 0;
	return x / (x + halfPoint);
}

// Altitude scoring (lower altitude = better parasite survival)
function altitudeScore(altitude) {
	if (!Number.isFinite(altitude)) return 0;

	if (altitude < 200) return 100;     // ideal
	else if (altitude < 500) return 70; // moderate
	else return 40;                     // harsh
}


// Parasites section

function tickRisk(temp, rainfall, soilMoisture, altitude) {
	// Ixodes ricinus (castor bean tick) prefers cool-mild temperatures and humid conditions 
	// Soil moisture is more critical than rainfall; risk decreases in hot or dry weather
	// Altitude has less weighting 
	let tempScore = gaussian(temp, 14, 6) * 100;
	let rainScore = saturating(rainfall, 25) * 100;
	let soilScore = gaussian(soilMoisture, 85, 12) * 100;
	let altScore = altitudeScore(altitude);

	let risk = (tempScore * 0.3) +
			   (rainScore * 0.2) +
			   (soilScore * 0.35) +
			   (altScore * 0.15);

	return Math.round(clamp100(risk));
}


function gutwormRisk(temp, rainfall, soilMoisture, altitude) {
	// Gutworms thrive in moderate temperatures and moisture 
	// Temperature has a slightly higher influence than rainfall
	// They depend less on altitude
	let tempScore = gaussian(temp, 16, 7) * 100;
	let rainScore = saturating(rainfall, 30) * 100;
	let soilScore = gaussian(soilMoisture, 70, 20) * 100;
	let altScore = altitudeScore(altitude);

	let risk = (tempScore * 0.45) +
			   (rainScore * 0.25) +
			   (soilScore * 0.2) +
			   (altScore * 0.1);

	return Math.round(clamp100(risk));
}


function lungwormRisk(temp, rainfall, soilMoisture, altitude) {
	// Lungworms are highly sensitive to temperature and moisture 
	// Rainfall has a stronger influence due to their dependency on moisture
	// Altitude is less important then the others
	let tempScore = gaussian(temp, 18, 6) * 100;
	let rainScore = saturating(rainfall, 20) * 100;
	let soilScore = gaussian(soilMoisture, 80, 15) * 100;
	let altScore = altitudeScore(altitude);

	let risk = (tempScore * 0.35) +
			   (rainScore * 0.3) +
			   (soilScore * 0.2) +
			   (altScore * 0.15);

	return Math.round(clamp100(risk));
}


function liverflukeRisk(temp, rainfall, soilMoisture, altitude) {
	// Liver fluke depends heavily on wet lowland environments (snails)
	// Liver flukes are highly dependent on wet conditions for their lifecycle 
	// Rainfall and soil moisture have a stronger influence than temperature
	let tempScore = gaussian(temp, 15, 6) * 100;
	let rainScore = saturating(rainfall, 15) * 100;
	let soilScore = gaussian(soilMoisture, 85, 10) * 100;
	let altScore = altitudeScore(altitude);

	let risk = (tempScore * 0.15) +
			   (rainScore * 0.4) +
			   (soilScore * 0.25) +
			   (altScore * 0.2); // strong altitude effect

	return Math.round(clamp100(risk));
}


function hairwormRisk(temp, rainfall, soilMoisture, altitude) {
	// Hairworms thrive in moderate temperatures and moisture 
	// Temperature has the highest influence on risk
	// Hairworms are resilient so altitude has small effect
	let tempScore = gaussian(temp, 22, 5) * 100;
	let rainScore = saturating(rainfall, 30) * 100;
	let soilScore = gaussian(soilMoisture, 65, 20) * 100;
	let altScore = altitudeScore(altitude);

	let risk = (tempScore * 0.55) +
			   (rainScore * 0.2) +
			   (soilScore * 0.15) +
			   (altScore * 0.1);

	return Math.round(clamp100(risk));
}


function coccidiaRisk(temp, rainfall, soilMoisture, altitude) {
	// Coccidia thrive in moderate temperatures and moisture 
	// Temperature, rainfall, and soil moisture have roughly equal influence
	// Coccidia influenced by environment but less altitude-dependent
	let tempScore = gaussian(temp, 18, 8) * 100;
	let rainScore = saturating(rainfall, 35) * 100;
	let soilScore = gaussian(soilMoisture, 75, 18) * 100;
	let altScore = altitudeScore(altitude);

	let risk = (tempScore * 0.35) +
			   (rainScore * 0.25) +
			   (soilScore * 0.25) +
			   (altScore * 0.15);

	return Math.round(clamp100(risk));
}
