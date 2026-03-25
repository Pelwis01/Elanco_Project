const plotbox = document.getElementById("myPlot");

const xArray = [50,60,70,80,90,100,110,120,130,140,1500];
const yArray = [7,8,8,9,9,9,10,11,14,14,150];

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

// Display using Plotly
Plotly.newPlot(plotbox, data, layout);