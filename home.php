<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #36383b;
            color: #000000;
        }

        .section {
            padding: 30px;
            margin: 20px;
            background-color: #666c6d;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .about-section {
            margin-top: 20px;
        }

        .heatmap-section {
            min-height: 500px;
            margin: 20px;
        }

        .info-section {
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <?php
    include("navbar.php");
    ?>
    
    <!-- about section -->
    <section class="section about-section">
        <h2>About</h2>
    </section>

    <!-- heatmap section -->
    <section class="section heatmap-section">
        <h2>Heatmap</h2>
        <div class="heatmap-container">
            <!-- heatmap here -->
        </div>
    </section>

    <!-- additional information section -->
    <section class="section info-section">
        <h2>Additional Information</h2>
    </section>
</body>
</html>