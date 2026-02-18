<?php
// we will have to replace this with our real results
$results = [
    "gutWorm" => 68,
    "lungworm" => 82,
    "liverFluke" => 91,
    "hairWorm" => 40,
    "coccidia" => 55
];

function getPopupData($parasite, $risk) {

    $message = "";
    $class = "";

    if ($risk >= 75) {
        $class = "high";
        switch($parasite) {
            case "gutWorm":
                $message = "🪱 Gut worms are throwing a pasture party!";
                break;
            case "lungworm":
                $message = "🐛 It's a fantastic day to be a lungworm! Bring your snorkel!";
                break;
            case "liverFluke":
                $message = "🐌 Liver flukes are loving these swamp vibes!";
                break;
            case "hairWorm":
                $message = "🧵 Hair worms are thriving underground!";
                break;
            case "coccidia":
                $message = "🦠 Coccidia are multiplying like crazy!";
                break;
        }

    } elseif ($risk >= 50) {
        $class = "medium";
        $message = "⚠ Moderate risk — parasites are watching closely.";
    } else {
        $class = "low";
        $message = "☀ Low risk — parasites are having a rough day!";
    }

    return [$class, $message];
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Parasite Risk Alerts</title>

    <style>
        body {
            font-family: Arial;
            background-color: #f4f4f4;
            text-align: center;
        }

        .popup {
            margin: 15px auto;
            padding: 20px;
            border-radius: 12px;
            width: 350px;
            color: white;
            box-shadow: 0px 0px 15px rgba(0,0,0,0.3);
        }

        .high { background-color: #d9534f; }   /* red */
        .medium { background-color: #f0ad4e; } /* orange */
        .low { background-color: #5cb85c; }    /* green */

        button {
            margin-top: 10px;
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }
    </style>
</head>

<body>

<h2>Parasite Risk Alerts</h2>

<?php foreach ($results as $parasite => $risk): ?>
    
    <?php list($class, $message) = getPopupData($parasite, $risk); ?>

    <div class="popup <?php echo $class; ?>">
        <h3><?php echo ucfirst($parasite); ?> Risk: <?php echo $risk; ?>%</h3>
        <p><?php echo $message; ?></p>
        <button onclick="this.parentElement.style.display='none'">Close</button>
    </div>

<?php endforeach; ?>

</body>
</html>
