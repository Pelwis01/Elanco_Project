// Temp in °C, rainfall in mm, soilMoisture in % (0–100) for 3-9cm depth
// Returns risk scores (0–100) for various parasites, where higher scores indicate higher risk
// Each parasite has unique thresholds and weightings based on its biology
// Rainfall multiplier varies depending on the parasite's moisture dependency

function getAllParasiteRisks(temp, rainfall, soilMoisture, isSimulated = false) {
	let finalTemp = Number(temp);
	let finalRain = Number(rainfall);
	let finalSoil = Number(soilMoisture);
	
	if (isSimulated) {
		finalTemp += 8; // Buff temp for summer
		finalSoil = Math.max(finalSoil, 75); // Ensure soil isn't too dry for life
		finalRain = Math.max(finalRain, 2); // Assume light "summer showers"
	}
	
	return {
		gutworm:    gutwormRisk(finalTemp, finalRain, finalSoil),
		lungworm:   lungwormRisk(finalTemp, finalRain, finalSoil),
		liverfluke: liverflukeRisk(finalTemp, finalRain, finalSoil),
		hairworm:   hairwormRisk(finalTemp, finalRain, finalSoil),
		coccidia:   coccidiaRisk(finalTemp, finalRain, finalSoil),
		tick:       tickRisk(finalTemp, finalRain, finalSoil)
	};
}

// Helper functions for scoring
function clamp100(val) {
	// Ensures the value is within the range 0–100
	if (!Number.isFinite(val)) return 0;
	return Math.min(100, Math.max(0, val));
}
function gaussian(x, mean, stdDev) {
	// Gaussian distribution function for scoring based on mean and standard deviation
	if (!Number.isFinite(x)) return 0;
	return Math.exp(-0.5 * ((x - mean) / stdDev) ** 2);
}
function saturating(x, halfPoint) {
	// Saturating function for scoring, where the score approaches 100 as x increases
	if (!Number.isFinite(x) || x <= 0) return 0;
	return x / (x + halfPoint);
}

function tickRisk(temp, rainfall, soilMoisture) {
	// Ixodes ricinus (castor bean tick) prefers cool-mild temperatures and humid conditions
	// Soil moisture is more critical than rainfall; risk decreases in hot or dry weather
	let tempScore = gaussian(temp, 14, 6) * 100;
	let rainScore = saturating(rainfall, 25) * 100;
	let soilScore = gaussian(soilMoisture, 85, 12) * 100;
	
	let risk = (tempScore * 0.35) +
			   (rainScore * 0.2) +
			   (soilScore * 0.45);
	
	return Math.round(clamp100(risk));
}

function gutwormRisk(temp, rainfall, soilMoisture) {
	// Gutworms thrive in moderate temperatures and moisture
	// Temperature has a slightly higher influence than rainfall
	let tempScore = gaussian(temp, 16, 7) * 100;
	let rainScore = saturating(rainfall, 30) * 100;
	let soilScore = gaussian(soilMoisture, 70, 20) * 100;
	
	let risk = (tempScore * 0.5) +
			   (rainScore * 0.3) +
			   (soilScore * 0.2);
	
	return Math.round(clamp100(risk));
}

function lungwormRisk(temp, rainfall, soilMoisture) {
	// Lungworms are highly sensitive to temperature and moisture
	// Rainfall has a stronger influence due to their dependency on moisture
	let tempScore = gaussian(temp, 18, 6) * 100;
	let rainScore = saturating(rainfall, 20) * 100;
	let soilScore = gaussian(soilMoisture, 80, 15) * 100;
	
	let risk = (tempScore * 0.4) +
			   (rainScore * 0.35) +
			   (soilScore * 0.25);
	
	return Math.round(clamp100(risk));
}

function liverflukeRisk(temp, rainfall, soilMoisture) {
	// Liver flukes are highly dependent on wet conditions for their lifecycle
	// Rainfall and soil moisture have a stronger influence than temperature
	let tempScore = gaussian(temp, 15, 6) * 100;
	let rainScore = saturating(rainfall, 15) * 100;
	let soilScore = gaussian(soilMoisture, 85, 10) * 100;
	
	let risk = (tempScore * 0.2) +
			   (rainScore * 0.45) +
			   (soilScore * 0.35);
	
	return Math.round(clamp100(risk));
}

function hairwormRisk(temp, rainfall, soilMoisture) {
	// Hairworms thrive in moderate temperatures and moisture
	// Temperature has the highest influence on risk
	let tempScore = gaussian(temp, 22, 5) * 100;
	let rainScore = saturating(rainfall, 30) * 100;
	let soilScore = gaussian(soilMoisture, 65, 20) * 100;
	
	let risk = (tempScore * 0.6) +
			   (rainScore * 0.2) +
			   (soilScore * 0.2);
	
	return Math.round(clamp100(risk));
}

function coccidiaRisk(temp, rainfall, soilMoisture) {
	// Coccidia thrive in moderate temperatures and moisture
	// Temperature, rainfall, and soil moisture have roughly equal influence
	let tempScore = gaussian(temp, 18, 8) * 100;
	let rainScore = saturating(rainfall, 35) * 100;
	let soilScore = gaussian(soilMoisture, 75, 18) * 100;
	
	let risk = (tempScore * 0.4) +
			   (rainScore * 0.3) +
			   (soilScore * 0.3);
	
	return Math.round(clamp100(risk));
}
