// temp in °C, rainfall in mm, soilMoisture in % (0–100)for 3-9cm depth
// Returns risk score 0–100 where higher is more risk
// All functions use similar logic but with different thresholds and weightings based on parasite biology
// The multiplier for rainfall is adjusted based on how much the parasite depends on moisture

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
    // lungworms are more sensitive to temperature and moisture, so we give both factors equal importance but with a stronger multiplier for rainfall
    let tempScore = 0;
    if (temp < 8) tempScore = 5;
    else if (temp < 12) tempScore = 40;
    else if (temp < 20) tempScore = 90;
    else tempScore = 75;

    // Multiplied by 2.5 because lungworms are very dependent on moisture for their lifecycle
    // Rainfall has a stronger effect on lungworm risk than gut worms
    let rainScore = Math.min(rainfall * 2.5, 100);

    let soilScore = soilMoisture;

    // Combine (temperature, rainfall and soil moisture are equally important)
    let risk = (tempScore * 0.4) + (rainScore * 0.3) + (soilScore * 0.3);

    return Math.round(risk);
}
function liverFlukeRisk(temp, rainfall, soilMoisture) {
    // liver fluke is highly dependent on wet conditions for its lifecycle, so we give rainfall a much stronger weighting than temperature
    let tempScore = 0;
    if (temp < 5) tempScore = 10;
    else if (temp < 10) tempScore = 60;
    else if (temp < 20) tempScore = 80;
    else tempScore = 50;

    // Multiplied by 3 because liver fluke is highly dependent on wet conditions for its lifecycle
    // Liverfluke risk can skyrocket with even moderate rainfall, hence the heavy weighting
    let rainScore = Math.min(rainfall * 3, 100); // heavy weighting

    let soilScore = soilMoisture;

    // Soil and rainfall are more important due to snail intermediate host, but temperature still plays a role, so we give it a moderate weighting
    let risk = (tempScore * 0.2) + (rainScore * 0.4) + (soilScore * 0.4);

    return Math.round(risk);
}
function hairWormRisk(temp, rainfall, soilMoisture) {
    // hairworms can survive in a wider range of conditions but thrive in moderate temperatures and moisture, so we give temperature a higher weighting than rainfall
    let tempScore = 0;
    if (temp < 12) tempScore = 5;
    else if (temp < 18) tempScore = 60;
    else if (temp < 25) tempScore = 95;
    else tempScore = 85;

    // Multiplied by 2 because hairworms need moisture but can survive in drier conditions too
    //But overall temperature is more critical for hairworms than rainfall, so we give it a moderate weighting
    let rainScore = Math.min(rainfall * 2, 100);

    let soilScore = soilMoisture;

    // Temperature alot more important
    let risk = (tempScore * 0.6) + (rainScore * 0.2) + (soilScore * 0.2);

    return Math.round(risk);
}
function coccidiaRisk(temp, rainfall, soilMoisture) {
    // coccidia can survive in a wide range of conditions but thrive in moderate temperatures and moisture, so we give both factors equal importance but with a moderate multiplier for rainfall
    let tempScore = 0;
    if (temp < 5) tempScore = 10;
    else if (temp < 15) tempScore = 70;
    else if (temp < 22) tempScore = 85;
    else tempScore = 60;

    // Multiplied by 1.8 because coccidia can thrive in moist conditions but are not as dependent on rainfall as other parasites
    // Moisture can help coccidia spread, but they can also survive in drier conditions, so we give it a moderate weighting
    let rainScore = Math.min(rainfall * 1.8, 100);

    let soilScore = soilMoisture;

    // Temperature rainfall and soil moisture are equally important
    let risk = (tempScore * 0.4) + (rainScore * 0.3) + (soilScore * 0.3);

    return Math.round(risk);
}

// Test while not got API working

let testTemp = 16;          // °C
let testRainfall = 35;      // mm
let testSoilMoisture = 75;  // % at 3–9 cm depth

console.log("Testing with:");
console.log("Temperature:", testTemp + "°C");
console.log("Rainfall:", testRainfall + "mm");
console.log("Soil Moisture (3–9cm):", testSoilMoisture + "%\n");

let results = getAllParasiteRisks(testTemp, testRainfall, testSoilMoisture);

console.log("Parasite Risk Results (%):");
console.log(results);
