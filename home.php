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
                <p>about content</p>
            </section>
            
            <!-- additional info section -->
            <section id="info" class="sidebar-section">
                <h2>Additional Information</h2>
                <p>additional information content</p>
            </section>
        </aside>
    </main>

</body>
</html>
