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
    
    <style>
        :root { --navbar-height: 56px; }
        body {
            margin: 0;
            padding: 0;
            background-color: #36383b;
            color: #000000;
            font-family: Arial, Helvetica, sans-serif;
        }

        /*space for fixed navbar */
        main {
            padding-top: var(--navbar-height);
            display: flex;
            height: calc(100vh - var(--navbar-height));
            gap: 0;
        }

        /*map takes 2/3 width */
        #map {
            flex: 2;
            background: #e6e6e6;
            overflow: hidden;
        }

        /*sidebar takes 1/3 width */
        .sidebar {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #f5f5f5;
            border-left: 1px solid #ccc;
            overflow: hidden;
        }

        .sidebar-section {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            border-bottom: 1px solid #ddd;
            background: #fff;
        }

        .sidebar-section:last-child {
            border-bottom: none;
        }

        .sidebar-section h2 {
            margin-top: 0;
            margin-bottom: 12px;
            font-size: 18px;
            color: #003366;
        }

        .sidebar-section p {
            margin: 0 0 12px 0;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
        }
        .about-box {
            border: 1px solid #cce0ff;
            border-radius: 8px;
            margin-bottom: 18px;
            padding: 14px 16px 10px 16px;
            background: #f8fbff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.03);
        }
        .about-box h3 {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 16px;
            color: #003366;
            font-weight: bold;
        }
        .info-box {
            border: 1px solid #cce0ff;
            border-radius: 8px;
            margin-bottom: 18px;
            padding: 14px 16px 10px 16px;
            background: #f8fbff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.03);
        }
        .info-box h3 {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 16px;
            color: #003366;
            font-weight: bold;
        }
        .info-icon {
            width: 28px;
            height: 28px;
            vertical-align: middle;
            margin-right: 8px;
            margin-bottom: 4px;
        }
        
    </style>
    <!-- leaflet css -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
</head>
<body>
    <?php include("navbar.php"); ?>

    <main>
        <!-- map area (2/3 width) -->
        <div id="map" aria-label="Main map area">
            <!-- map-content.js should initialize the map inside #map -->
        </div>

        <!-- sidebar (1/3 width) -->
        <aside class="sidebar">
            <!-- about section -->
            <section id="about" class="sidebar-section">
                <h2>About</h2>
                <div class="about-box">
                    <h3>Gut Worm</h3>
                    <p>Gut worms prefer moderate temperatures and moist pasture conditions, because their eggs hatch and larvae develop in dung before migrating onto grass. Temperature is weighted strongly because development speeds up significantly in warm (but not hot) conditions. Rainfall and soil moisture are also important because larvae need moisture to survive and move onto herbage. However, extreme heat or very dry conditions reduce survival. Therefore, temperature has a slightly higher weighting, but moisture factors still contribute significantly to overall risk.</p>
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
                    <p>Hair worms lay eggs that are quite resistant in the environment. They can survive in soil for long periods but require moderate warmth and some moisture to become infective. They are less dependent on heavy rainfall compared to lungworm or liver fluke. Therefore, temperature and soil moisture are moderately weighted, while rainfall has a slightly smaller effect. Risk increases in warm, slightly damp pasture conditions.</p>
                </div>
                <div class="about-box">
                    <h3>Coccidia</h3>
                    <p>Coccidia are protozoan parasites that multiply rapidly in warm, moist environments, especially where stocking density is high. Moisture allows eggs to survive and sporulate, making them infective. Temperature strongly affects how quickly sporulation occurs. Because both warmth and moisture are critical, temperature and soil moisture are weighted similarly, with rainfall contributing indirectly by increasing overall dampness.</p>
                </div>
            </section>
            
            <!-- additional info section -->
            <section id="info" class="sidebar-section">
                <h2>Additional Information</h2>
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
