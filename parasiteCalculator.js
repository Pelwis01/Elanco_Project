// temp in °C, rainfall in mm, soilMoisture in % (0–100)for 3-9cm depth
// Returns risk score 0–100 where higher is more risk
// All functions use similar logic but with different thresholds and weightings based on parasite biology
// The multiplier for rainfall is adjusted based on how much the parasite depends on moisture

function getAllParasiteRisks(temp, rainfall, soilMoisture) {

    return {
        gutworm: gutwormRisk(temp, rainfall, soilMoisture),
        lungworm: lungwormRisk(temp, rainfall, soilMoisture),
        liverfluke: liverflukeRisk(temp, rainfall, soilMoisture),
        hairworm: hairwormRisk(temp, rainfall, soilMoisture),
        coccidia: coccidiaRisk(temp, rainfall, soilMoisture)
    };
}

function gutwormRisk(temp, rainfall, soilMoisture) {
    // Gutworms can survive in a wider range of conditions, but thrive in moderate temperatures and moisture, so we give temperature a slightly higher weighting than rainfall
    // Temperature effect (0–100)
    let tempScore = 0;
    if (temp < 5) tempScore = 5;
    else if (temp < 10) tempScore = 40;
    else if (temp < 18) tempScore = 85;
    else if (temp < 22) tempScore = 70;
    else tempScore = 50;

    // Rainfall effect (0–100)
    // Multiplied by 2 because gutworms need moisture but can survive in drier conditions too
    // Capped at 100 to prevent unrealistic scores
    let rainScore = Math.min(rainfall * 2, 100);

    // Soil moisture modererate influence (top grazing layer relevance)
    let soilScore = soilMoisture;

    // Combine (temperature is slightly more important)
    let risk = (tempScore * 0.5) + (rainScore * 0.3) + (soilScore * 0.2);

    return Math.round(risk);
}

function lungwormRisk(temp, rainfall, soilMoisture) {
    // Lungworms are more sensitive to temperature and moisture, so we give both factors equal importance but with a stronger multiplier for rainfall
    let tempScore = 0;
    if (temp < 8) tempScore = 5;
    else if (temp < 12) tempScore = 40;
    else if (temp < 20) tempScore = 90;
    else tempScore = 75;

    // Multiplied by 2.5 because lungworms are very dependent on moisture for their lifecycle
    // Rainfall has a stronger effect on lungworm risk than gutworms
    let rainScore = Math.min(rainfall * 2.5, 100);

    let soilScore = soilMoisture;

    // Combine (temperature, rainfall and soil moisture are equally important)
    let risk = (tempScore * 0.4) + (rainScore * 0.3) + (soilScore * 0.3);

    return Math.round(risk);
}
function liverflukeRisk(temp, rainfall, soilMoisture) {
    // liver fluke is highly dependent on wet conditions for its lifecycle, so we give rainfall a much stronger weighting than temperature
    let tempScore = 0;
    if (temp < 5) tempScore = 10;
    else if (temp < 10) tempScore = 60;
    else if (temp < 20) tempScore = 80;
    else tempScore = 50;

    // Multiplied by 3 because liver fluke is highly dependent on wet conditions for its lifecycle
    // liverfluke risk can skyrocket with even moderate rainfall, hence the heavy weighting
    let rainScore = Math.min(rainfall * 3, 100); // heavy weighting

    let soilScore = soilMoisture;

    // Soil and rainfall are more important due to snail intermediate host, but temperature still plays a role, so we give it a moderate weighting
    let risk = (tempScore * 0.2) + (rainScore * 0.4) + (soilScore * 0.4);

    return Math.round(risk);
}
function hairwormRisk(temp, rainfall, soilMoisture) {
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
