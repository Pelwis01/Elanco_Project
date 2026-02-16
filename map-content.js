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

        // 🌍 Mapbox tile layer URL
    L.tileLayer("https://api.mapbox.com/styles/v1/bryzerse/cm88xjf8h00ds01sbeevxgzhz/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYnJ5emVyc2UiLCJhIjoiY2traWNsZWhmMG13MzJvcGdiZ3hkbjlodyJ9.BV94uCu_hACQrqEbO74A8w", {
        attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
    }).addTo(map);

    // 📊 Placeholder heatmap data:
    var heatData = {
        max: 1,
        data: [
            { lat: 52.3702, lng: 4.8952, value: 0.8 }, // Amsterdam
            { lat: 51.9225, lng: 4.47917, value: 0.6 }, // Rotterdam
            { lat: 52.0705, lng: 4.3007, value: 0.7 }, // The Hague
            { lat: 51.4416, lng: 5.4697, value: 0.9 }, // Eindhoven
            { lat: 53.2194, lng: 6.5665, value: 0.5 }, // Groningen
            { lat: 52.2112, lng: 5.9699, value: 0.65 }, // Apeldoorn
            { lat: 51.5719, lng: 5.0761, value: 0.75 }, // Tilburg
            { lat: 50.8476, lng: 5.688, value: 0.6 }, // Maastricht
            { lat: 52.6314, lng: 4.7486, value: 0.55 }, // Alkmaar
            { lat: 51.9851, lng: 5.8987, value: 0.7 }, // Arnhem
            { lat: 52.2292, lng: 6.8937, value: 0.58 }, // Enschede
            { lat: 52.5152, lng: 6.0830, value: 0.68 }, // Zwolle
            { lat: 52.0856, lng: 5.1189, value: 0.82 }, // Utrecht
            { lat: 52.0308, lng: 4.7084, value: 0.62 }, // Gouda
            { lat: 51.8231, lng: 5.8707, value: 0.57 }, // Nijmegen
            { lat: 52.3508, lng: 5.2647, value: 0.73 }, // Almere
            { lat: 52.3874, lng: 4.6462, value: 0.77 }, // Haarlem
            { lat: 53.1424, lng: 6.6906, value: 0.54 }, // Drachten
            { lat: 53.0482, lng: 5.6599, value: 0.52 }, // Leeuwarden
            { lat: 52.1601, lng: 4.4970, value: 0.66 }, // Leiden
            { lat: 52.2795, lng: 5.1671, value: 0.71 }, // Hilversum
            { lat: 51.6366, lng: 5.0751, value: 0.69 }, // Den Bosch
            { lat: 51.4428, lng: 4.8271, value: 0.65 },  // Breda
            { lat: 53.3811, lng: -1.4701, value: 50.0 }
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
