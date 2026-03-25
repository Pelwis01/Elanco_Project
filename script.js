
function updateDashboard(data) {

    const { temp, rain, soil, cattle, location } = data;

    
    const gut = getGutwormRisk(temp, rain, soil);
    const lung = getLungwormRisk(temp, rain, soil);
    const fluke = getLiverFlukeRisk(temp, rain, soil);
    const hair = getHairwormRisk(temp, rain, soil);
    const cocci = getCoccidiaRisk(temp, rain, soil, cattle);
    const tick = getTickRisk(temp, rain, soil);

    // UI bars
    updateRiskUI("gutworm", gut);
    updateRiskUI("lungworm", lung);
    updateRiskUI("liverfluke", fluke);
    updateRiskUI("hairworm", hair);
    updateRiskUI("coccidia", cocci);
    updateRiskUI("tick", tick);

    //  Overall
    const overall = Math.round((gut + lung + fluke + hair + cocci + tick) / 6);
    updateOverallRisk(overall);

    // Conditions
    document.getElementById("region-temp").textContent = temp + "°C";
    document.getElementById("region-rain").textContent = rain + "mm";
    document.getElementById("region-soil").textContent = soil + "%";

    // Location
    if (location) {
        document.getElementById("region-name").textContent = location;
    }

    // Insight
    generateInsight(temp, rain, soil);
}

// Risk bars
function updateRiskUI(id, value) {
    const text = document.getElementById(`risk-${id}`);
    const bar = document.getElementById(`bar-${id}`);

    text.textContent = value + "%";
    bar.style.width = value + "%";

    bar.classList.remove("low-fill","medium-fill","high-fill");

    if (value < 33) bar.classList.add("low-fill");
    else if (value < 66) bar.classList.add("medium-fill");
    else bar.classList.add("high-fill");
}

// Badge
function updateOverallRisk(value) {
    const badge = document.getElementById("overall-badge");

    badge.textContent = value + "%";
    badge.className = "risk-badge";

    if (value < 33) badge.classList.add("badge-low");
    else if (value < 66) badge.classList.add("badge-medium");
    else badge.classList.add("badge-high");
}

// Insights
function generateInsight(temp, rain, soil) {
    let insights = [];

    if (soil > 70 && rain > 5)
        insights.push("High moisture increasing parasite survival.");

    if (temp > 15 && temp < 25)
        insights.push("Optimal temperature for parasite development.");

    if (temp > 28)
        insights.push("Heat may reduce parasite survival.");

    if (soil < 30)
        insights.push("Dry conditions limiting spread.");

    document.getElementById("insight-text").textContent =
        insights.length ? insights.join(" ") : "Conditions are stable.";
}
