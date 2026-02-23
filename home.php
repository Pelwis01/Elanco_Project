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
    <navbar class="navbar">
        <div class="navbar-left">
                <img class="navbar-logo" src="./images/logo.png" alt="Elanco Logo">
            </div>
            
            <div class="nav-actions">
        </div>
    </navbar>
    
    <main>
        <!-- 🗺️ Map - left half -->
        <div class="map-wrapper">
            <div id="map" role="application" aria-label="Interactive parasite risk map"></div>
            
            <!-- 🔄 Loading overlay -->
            <div id="loading-overlay">
                <div class="box" style="padding: 24px 32px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);">
                    <div class="spinner"></div>
                    <p>Loading environmental data…</p>
                </div>
            </div>
        </div>
        
        <!-- ➡️ Sidebar - right half -->
        <aside class="sidebar">
            <!-- Region info section -->
            <section id="region-info" class="sidebar-section">
                <div class="box">
                    <div style="display: flex; align-items: center;">
                        <img src="https://cdn-icons-png.flaticon.com/512/1076/1076983.png" class="info-icon" alt="Location icon" style="height: 2.8rem; width: auto; margin-right: 10px; filter: hue-rotate(240deg);">
                        <div>
                            <p style="margin-bottom: -4px"><strong>
                                <span id="region-coords" style="color: #37D; font-size: 0.8em;">53.377169, -1.4676838</span>
                            </strong></p>
                            <p><strong>
                                <span id="region-name" style="font-size: 1.4em;">Sheefield, South Yorkshire</span>
                            </strong></p>
                            <p style="margin-top: -8px"><strong>
                                <span id="region-address" style="color: #555; font-size: 0.8em;">Cantor Building, Arundel Lane, S1 4RB</span>
                            </strong></p>
                        </div>
                    </div>
                </div>
                
                <div class="box simulation-box" style="border: 2px solid #FF8C00; background: #FFF5EB;">
                    <h3 style="color: #E67E22; margin-top: 0;">🧪 Summer Simulation</h3>
                    <label class="switch">
                        <input type="checkbox" id="summer-sim">
                        <span class="slider round"></span>
                    </label>
                    <span style="margin-left: 10px; font-weight: bold;">Enable Summer Simulation</span>
                    <p style="font-size: 0.8em; color: #666; margin-top: 5px;">Adds +8°C and slightly more optimal moisture to visualise peak season potential.</p>
                </div>
                
                <div class="info-box">
                    <h2> Parasite Risks </h2>
                    <p><strong>Overall:  <span id="risk-overall">—</span>%</strong></p>
                    <p>Gutworm:          <span id="risk-gutworm">—</span>%</p>
                    <p>Lungworm:         <span id="risk-lungworm">—</span>%</p>
                    <p>Liver Fluke:      <span id="risk-liverfluke">—</span>%</p>
                    <p>Hair Worm:        <span id="risk-hairworm">—</span>%</p>
                    <p>Coccidia:         <span id="risk-coccidia">—</span>%</p>
                    <p>Castor Bean Tick: <span id="risk-tick">—</span>%</p>
                </div>
                
                <h2> Additional Information </h2>
                <div class="box">
                    <h3><img src="./images/thermometer.png" class="info-icon" alt="Thermometer icon">Temperature</h3>
                    <p><span id="region-temp">—</span> °C</p>
                </div>
                <div class="box">
                    <h3><img src="./images/rain-drops.png" class="info-icon" alt="Rainfall icon">Rainfall</h3>
                    <p><span id="region-rain">—</span> mm</p>
                </div>
                <div class="box">
                    <h3><img src="./images/dirt.png" class="info-icon" alt="Soil moisture icon">Soil Moisture</h3>
                    <p><span id="region-soil">—</span> %</p>
                </div>
                <div class="box">
                    <h3><img src="./images/cow.png" class="info-icon" alt="Cattle density icon">Cattle Density</h3>
                    <p><span id="region-cow">—</span> /km^2</p>
                </div>
            </section>
            
            <!-- Parasite guide section -->
            <section id="about" class="sidebar-section">
                <h2> Parasite Guide </h2>
                <div class="box about-box" id = "gutworm">
                    <h3>Gutworm</h3>
                    <p>Gutworms prefer moderate temperatures and moist pasture conditions, because their eggs hatch and larvae develop in dung before migrating onto grass. Temperature is weighted strongly because development speeds up significantly in warm (but not hot) conditions. Rainfall and soil moisture are also important because larvae need moisture to survive and move onto herbage. However, extreme heat or very dry conditions reduce survival. Therefore, temperature has a slightly higher weighting, but moisture factors still contribute significantly to overall risk.</p>
                </div>
                <div class="box about-box" id = "lungworm">
                    <h3>Lungworm</h3>
                    <p>Lungworm larvae develop in dung and rely heavily on wet pasture conditions to spread. This parasite is strongly influenced by rainfall and soil moisture because moisture allows larvae to migrate from dung onto surrounding grass. Temperature is important but slightly less dominant than moisture. Cool, damp conditions often support outbreaks. For this reason, soil moisture and rainfall are weighted relatively high in the risk calculation.</p>
                </div>
                <div class="box about-box" id = "liverfluke">
                    <h3>Liver Fluke</h3>
                    <p>Liver fluke has a very specific environmental requirement because it depends on a mud snail intermediate host. These snails thrive in very wet, marshy, poorly drained areas. Therefore, soil moisture and rainfall are the most heavily weighted factors. Temperature is still relevant because warmer conditions speed up parasite development inside the snail, but without high moisture the lifecycle cannot continue. As a result, moisture has the strongest influence in the weighting.</p>
                </div>
                <div class="box about-box" id = "hairworm">
                    <h3>Hair Worms</h3>
                    <p>Hair worms lay eggs that are quite resistant to environmental factors. They can survive in soil for long periods but require moderate warmth and some moisture to become infective. They are less dependent on heavy rainfall compared to lungworm or liver fluke. Therefore, temperature and soil moisture are moderately weighted, while rainfall has a slightly smaller effect. Risk increases in warm, slightly damp pasture conditions.</p>
                </div>
                <div class="box about-box" id = "coccidia">
                    <h3>Coccidia</h3>
                    <p>Coccidia are protozoan parasites that multiply rapidly in warm, moist environments, especially where stocking density is high. Moisture allows eggs to survive and sporulate, making them infective. Temperature strongly affects how quickly sporulation occurs. Because both warmth and moisture are critical, temperature and soil moisture are weighted similarly, with rainfall contributing indirectly by increasing overall dampness.</p>
                </div>
                <div class="box about-box" id = "tick">
                    <h3>Castor Bean Ticks</h3>
                    <p>The Castor Bean tick, Ixodes Ricinus, is one of the most common tick species affecting cattle in the UK and across Europe. It is a three-host tick, meaning it feeds on different animals at each stage of its life cycle (larva, nymph, and adult). Castor bean ticks are most active in cool, humid conditions, particularly during spring and autumn, and are commonly found in rough pasture, woodland edges, and areas with dense vegetation. Unlike many internal parasites, they do not rely directly on rainfall but instead depend on environmental humidity to prevent desiccation.  </p>
            </section>
        </aside>
    </main>
    
</body>
</html>
