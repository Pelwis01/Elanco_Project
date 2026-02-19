// temp in °C, rainfall in mm, soilMoisture in % (0–100)for 3-9cm depth
// Returns risk score 0–100 where higher is more risk
// All functions use similar logic but with different thresholds and weightings based on parasite biology
// The multiplier for rainfall is adjusted based on how much the parasite depends on moisture

function getAllParasiteRisks(temp, rainfall, soilMoisture) {
    temp = Number(temp);
    rainfall = Number(rainfall);
    soilMoisture = Number(soilMoisture);

    return {
        gutworm: gutwormRisk(temp, rainfall, soilMoisture),
        lungworm: lungwormRisk(temp, rainfall, soilMoisture),
        liverfluke: liverflukeRisk(temp, rainfall, soilMoisture),
        hairworm: hairwormRisk(temp, rainfall, soilMoisture),
        coccidia: coccidiaRisk(temp, rainfall, soilMoisture),
        tick: tickRisk(temp, rainfall, soilMoisture)
    };
}

    // Ixodes ricinus (sheep tick) prefers cool-mild temperatures and humid conditions.
    // Soil moisture is more important than rainfall.
    // Risk drops in very hot or very dry weather.
// Helper functions for scoring
function clamp100(val) {
    if (!Number.isFinite(val)) return 0;
    return Math.min(100, Math.max(0, val));
}
function gaussian(x, mean, stdDev) {
    if (!Number.isFinite(x)) return 0;
    return Math.exp(-0.5 * ((x - mean) / stdDev) ** 2);
}
function saturating(x, halfPoint) {
    if (!Number.isFinite(x) || x <= 0) return 0;
    return x / (x + halfPoint);
}

function tickRisk(temp, rainfall, soilMoisture) {
    // Ixodes ricinus (castor bean tick) prefers cool-mild temperatures and humid conditions.
    let tempScore = gaussian(temp, 14, 6) * 100;
    let rainScore = saturating(rainfall, 25) * 100;
    let soilScore = gaussian(soilMoisture, 85, 12) * 100;
    
    let risk = (tempScore * 0.35) +
               (rainScore * 0.2) +
               (soilScore * 0.45);
    
    return Math.round(clamp100(risk));
}

function gutwormRisk(temp, rainfall, soilMoisture) {
    // Gutworms can survive in a wider range of conditions, but thrive in moderate temperatures and moisture, so we give temperature a slightly higher weighting than rainfall
    // Temperature effect (0–100)
    let tempScore = gaussian(temp, 16, 7) * 100;
    let rainScore = saturating(rainfall, 30) * 100;
    let soilScore = gaussian(soilMoisture, 70, 20) * 100;

    // Rainfall effect (0–100)
    // Multiplied by 2 because gutworms need moisture but can survive in drier conditions too
    // Capped at 100 to prevent unrealistic scores
    let risk = (tempScore * 0.5) +
               (rainScore * 0.3) +
               (soilScore * 0.2);

    // Soil moisture modererate influence (top grazing layer relevance)
    // Combine (temperature is slightly more important)
    return Math.round(clamp100(risk));
}

function lungwormRisk(temp, rainfall, soilMoisture) {
    // Lungworms are more sensitive to temperature and moisture, so we give both factors equal importance but with a stronger multiplier for rainfall
    // Multiplied by 2.5 because lungworms are very dependent on moisture for their lifecycle
    // Rainfall has a stronger effect on lungworm risk than gutworms
    let tempScore = gaussian(temp, 18, 6) * 100;
    // More dependent on rain splash / moisture
    let rainScore = saturating(rainfall, 20) * 100;
    let soilScore = gaussian(soilMoisture, 80, 15) * 100;

    let risk = (tempScore * 0.4) +
               (rainScore * 0.35) +
               (soilScore * 0.25);

    return Math.round(clamp100(risk));
}
function liverflukeRisk(temp, rainfall, soilMoisture) {
    // liver fluke is highly dependent on wet conditions for its lifecycle, so we give rainfall a much stronger weighting than temperature
    // Multiplied by 3 because liver fluke is highly dependent on wet conditions for its lifecycle
    // liverfluke risk can skyrocket with even moderate rainfall, hence the heavy weighting
    let tempScore = gaussian(temp, 15, 6) * 100;
    // Rainfall extremely important for snail hosts
    let rainScore = saturating(rainfall, 15) * 100;
    let soilScore = gaussian(soilMoisture, 85, 10) * 100;

    // Soil and rainfall are more important due to snail intermediate host, but temperature still plays a role, so we give it a moderate weighting
    let risk = (tempScore * 0.2) +
               (rainScore * 0.45) +
               (soilScore * 0.35);

    return Math.round(clamp100(risk));
}
function hairwormRisk(temp, rainfall, soilMoisture) {
    // hairworms can survive in a wider range of conditions but thrive in moderate temperatures and moisture, so we give temperature a higher weighting than rainfall
    let tempScore = gaussian(temp, 22, 5) * 100;
    let rainScore = saturating(rainfall, 30) * 100;
    let soilScore = gaussian(soilMoisture, 65, 20) * 100;

    let risk = (tempScore * 0.6) +
               (rainScore * 0.2) +
               (soilScore * 0.2);

    return Math.round(clamp100(risk));
}
function coccidiaRisk(temp, rainfall, soilMoisture) {
    // coccidia can survive in a wide range of conditions but thrive in moderate temperatures and moisture, so we give both factors equal importance but with a moderate multiplier for rainfall
    // Multiplied by 1.8 because coccidia can thrive in moist conditions but are not as dependent on rainfall as other parasites
    // Moisture can help coccidia spread, but they can also survive in drier conditions, so we give it a moderate weighting
    // Coccidia can survive in a wide range of conditions but thrive in moderate temperatures and moisture
    let tempScore = gaussian(temp, 18, 8) * 100;
    let rainScore = saturating(rainfall, 35) * 100;
    let soilScore = gaussian(soilMoisture, 75, 18) * 100;

    let risk = (tempScore * 0.4) +
               (rainScore * 0.3) +
               (soilScore * 0.3);

    // Temperature rainfall and soil moisture are equally important
    return Math.round(clamp100(risk));
}

// Test while not got API working
// let testTemp = 16;          // °C
// let testRainfall = 35;      // mm
// let testSoilMoisture = 75;  // % at 3–9 cm depth

// console.log("Testing with:");
// console.log("Temperature:", testTemp + "°C");
// console.log("Rainfall:", testRainfall + "mm");
// console.log("Soil Moisture (3–9cm):", testSoilMoisture + "%\n");

// let results = getAllParasiteRisks(testTemp, testRainfall, testSoilMoisture);

// console.log("Parasite Risk Results (%):");
// console.log(results);
