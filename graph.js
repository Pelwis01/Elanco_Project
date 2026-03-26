const plotbox = document.getElementById("myPlot");
const xArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72];
let yArray = [];

function getGraphData() {
    let elevation = 0;

    fetch(
    `https://api.open-meteo.com/v1/elevation?latitude=53.3811&longitude=1.4701`,
  )
    .then((r) => r.json())
    .then((data) => {
      const elevation = data.elevation;
      console.log(`🏔️ Elevation: ${elevation} m`);
      return elevation;
    });

  // ⛈️ Fetch weather and soil data for precise clicked location (Open-Meteo)
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=53.3811&longitude=1.4701&hourly=precipitation,temperature_2m,soil_moisture_3_to_9cm&forecast_days=3`,
  )
    .then((res) => res.json())
    .then((data) => {

      console.log("📊 Weather & Soil Data:", data);

        for (let i = 0; i < 72; i++) {
            const h = data.hourly;
            const temp = h.temperature_2m[i];
            const rain = h.precipitation[i];
            const soil = ((h.soil_moisture_3_to_9cm[i] || 0) / 0.5) * 100;

            const risks = getAllParasiteRisks(
            temp,
            rain * 10,
            soil,
            elevation,
            false,
            );
            //console.log("Calculated Risks:", risks);

            const combinedRisk = Object.values(risks).reduce((a, b) => a + b, 0) / Object.values(risks).length;
            yArray.push(Math.round(combinedRisk));
        };
   });
}

getGraphData();

 console.log("Final Y Array:", yArray);
// Define Data
const data = [{
  x: xArray,
  y: yArray,
  mode:"lines"
}];



// Define Layout
const layout = {
  xaxis: {range: [1, 72], title: "Hour"},
  yaxis: {range: [0, 100], title: "Percentage Chance of parasite infection"},  
  title: "Chance of parasite infection over time"
};

console.log("Data for Plotly:", data);
// Display using Plotly
Plotly.newPlot(plotbox, data, layout);

