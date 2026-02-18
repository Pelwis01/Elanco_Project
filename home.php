<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/Elanco_Project/images/favicon.png">
    
    <!-- 🗺️ Leaflet -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <!-- 🔥 Heatmap.js -->
    <script src="https://unpkg.com/heatmap.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/leaflet-heatmap/leaflet-heatmap.js"></script>
    
    <script src="parasiteCalculator.js"></script>
    <script src="map-content.js"></script>
    
    <!-- 🎨 Styles -->
    <link rel="stylesheet" href="style.css">

    <!-- 📛 Title -->
    <title> Elanco - Parasite Risk Map </title>
</head>

<body>
    <?php include("navbar.php"); ?>
    
    <main>
        <!-- 🗺️ Map - left half -->
        <div id="map" role="application" aria-label="Interactive parasite risk map"></div>
            <!-- 🐄 map-content.js -->
        </div>
        
        <!-- ➡️ Sidebar - right half -->
        <aside class="sidebar">
            <!-- About section -->
            <section id="about" class="sidebar-section">
                <h2> About </h2>
                <div class="about-box">
                    <h3>Gutworm</h3>
                    <p>Gutworms prefer moderate temperatures and moist pasture conditions, because their eggs hatch and larvae develop in dung before migrating onto grass. Temperature is weighted strongly because development speeds up significantly in warm (but not hot) conditions. Rainfall and soil moisture are also important because larvae need moisture to survive and move onto herbage. However, extreme heat or very dry conditions reduce survival. Therefore, temperature has a slightly higher weighting, but moisture factors still contribute significantly to overall risk.</p>
                </div>
                <div class="about-box">
                    <h3>Lungworm</h3>
                    <p>Lungworm larvae develop in dung and rely heavily on wet pasture conditions to spread. This parasite is strongly influenced by rainfall and soil moisture because moisture allows larvae to migrate from dung onto surrounding grass. Temperature is important but slightly less dominant than moisture. Cool, damp conditions often support outbreaks. For this reason, soil moisture and rainfall are weighted relatively high in the risk calculation.</p>
                </div>
                <div class="about-box">
                    <h3>Liver Fluke</h3>
                    <p>Liver fluke has a very specific environmental requirement because it depends on a mud snail intermediate host. These snails thrive in very wet, marshy, poorly drained areas. Therefore, soil moisture and rainfall are the most heavily weighted factors. Temperature is still relevant because warmer conditions speed up parasite development inside the snail, but without high moisture the lifecycle cannot continue. As a result, moisture has the strongest influence in the weighting.</p>
                </div>
                <div class="about-box">
                    <h3>Hair Worms</h3>
                    <p>Hair worms lay eggs that are quite resistant to environmental factors. They can survive in soil for long periods but require moderate warmth and some moisture to become infective. They are less dependent on heavy rainfall compared to lungworm or liver fluke. Therefore, temperature and soil moisture are moderately weighted, while rainfall has a slightly smaller effect. Risk increases in warm, slightly damp pasture conditions.</p>
                </div>
                <div class="about-box">
                    <h3>Coccidia</h3>
                    <p>Coccidia are protozoan parasites that multiply rapidly in warm, moist environments, especially where stocking density is high. Moisture allows eggs to survive and sporulate, making them infective. Temperature strongly affects how quickly sporulation occurs. Because both warmth and moisture are critical, temperature and soil moisture are weighted similarly, with rainfall contributing indirectly by increasing overall dampness.</p>
                </div>
            </section>
            
            <!-- Additional info section -->
            <section id="info" class="sidebar-section">
                <h2> Additional Information </h2>
                <div class="info-box">
                    <h3><img src="./images/thermometer.png" class="info-icon" alt="Thermometer icon">Temperature</h3>
                </div>
                <div class="info-box">
                    <h3><img src="./images/rain-drops.png" class="info-icon" alt="Rainfall icon">Rainfall</h3>
                </div>
                <div class="info-box">
                    <h3><img src="./images/dirt.png" class="info-icon" alt="Soil moisture icon">Soil Moisture</h3>
                </div>
                <div class="info-box">
                    <h3><img src="./images/cow.png" class="info-icon" alt="Cattle density icon">Cattle Density</h3>
                </div>
            </section>
        </aside>
    </main>

</body>
</html>
