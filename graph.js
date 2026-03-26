const plotbox = document.getElementById("myPlot");
const xArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72];
const yArray = [];

const data = [{
  x: xArray,
  y: yArray,
  mode:"lines"
}];

const layout = {
  xaxis: {range: [1, 72], title: "Hour"},
  yaxis: {range: [0, 100], title: "Percentage Chance of parasite infection"},  
  title: "Chance of parasite infection over time"
};

Plotly.newPlot(plotbox, data, layout);

async function getGraphData() {
  // Get elevation first
  const elevRes = await fetch(
    `https://api.open-meteo.com/v1/elevation?latitude=53.3811&longitude=1.4701`
  );
  const elevData = await elevRes.json();
  const elevation = elevData.elevation;

  console.log(`🏔️ Elevation: ${elevation} m`);

  // Get weather data
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=53.3811&longitude=1.4701&hourly=precipitation,temperature_2m,soil_moisture_3_to_9cm&forecast_days=3`
  );
  const data = await res.json();

  const h = data.hourly;
  yArray.length = 0; // clear array

  for (let i = 0; i < 72; i++) {
    const temp = h.temperature_2m[i];
    const rain = h.precipitation[i];
    const soil = ((h.soil_moisture_3_to_9cm[i] || 0) / 0.5) * 100;

    const risks = getAllParasiteRisks(
      temp,
      rain * 10,
      soil,
      elevation,
      false
    );

    const combinedRisk =
      Object.values(risks).reduce((a, b) => a + b, 0) /
      Object.values(risks).length;

    yArray.push(Math.round(combinedRisk));
  }

  // ✅ NOW update the graph
  Plotly.update(plotbox, { y: [yArray] });
}

getGraphData();

Plotly.update(plotbox, data, layout);

