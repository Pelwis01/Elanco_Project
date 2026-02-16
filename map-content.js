document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById("map");

    if (!mapContainer) return;
 // Initialize the map

        var map = L.map("map").setView([54.5, -3.5], 6); // Coordinates for the UK

        // Add a tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);


    // 📊 Placeholder heatmap data:
    var heatData = {
        max: 1,
        data: [
            
            { lat: 53.3811, lng: -1.4701, value: 1.0 }
        ]        
    };
    
    // ⚙️ Heatmap config
    var cfg = {
        radius: 0.3,
        scaleRadius: true, // 🔎 Scaling based on map zoom level
        useLocalExtrema: false,
        latField: "lat",
        lngField: "lng",
        valueField: "value"
    };

    // 🔥 Initialise heatmap overlay using config
    var heatmapLayer = new HeatmapOverlay(cfg);
    
    // 📌 Set heatmap data and add to map
    heatmapLayer.setData(heatData);
    heatmapLayer.addTo(map);
});
