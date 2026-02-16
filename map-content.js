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

        // Add a marker
        L.marker([51.505, -0.09]).addTo(map)
            .bindPopup('A pretty marker.<br> Easily customizable.')
            .openPopup();

        L.marker([51.51, -0.1]).addTo(map)
            .bindPopup('Another marker.<br> With more info.')
            .openPopup();

    });