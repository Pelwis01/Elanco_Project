<!DOCTYPE html>
<html lang="en-gb">

<head>
    
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/Elanco/images/favicon.png"> <!-- TBA? - Favicon -->
    
    <!-- 🗺️ Leaflet -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <!-- 🔥 Heatmap.js -->
    <script src="https://unpkg.com/heatmap.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/leaflet-heatmap/leaflet-heatmap.js"></script>

    <link rel="stylesheet" href="styles.css"/>
    <script src="parasiteCalculator.js"></script>
    <script src="map-content.js"></script>
    
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #36383b;
            color: #000000;
        }
        
        .section {
            padding: 20px;
            margin: 20px;
            background-color: #666c6d;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>

<body>
    <?php
        include("navbar.php");
    ?>
    
    <!-- about section -->
    <section class="section">
        <h2> About </h2>
    </section>
    
    <!-- 🔥 heatmap section -->
    <section class="section">
        <h2> Heatmap </h2>
        <div class="heatmap-container">
            <!-- 🔥 heatmap -->
            <div id="map" style="height: 800px; width: 600px;"></div>
        </div>
    </section>
    
    <!-- additional information section -->
    <section class="section">
        <h2> Additional Information </h2>
    </section>
</body>
</html>