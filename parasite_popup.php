<?php
// example results can change to use our results
$results = [
    "gutWorm" => 68,
    "lungworm" => 82,
    "liverFluke" => 91,
    "hairWorm" => 40,
    "coccidia" => 55
];

// Function to decide message + colour
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
                $message = "🐛 It's a fantastic day to be a lungworm! Bring your snorkels!";
                break;
            case "liverFluke":
                $message = "🐌 Liver flukes are loving these swampy conditioons!";
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
    <title>Parasite Notifications</title>

    <style>
        body {
            font-family: Arial;
            background-color: #f4f4f4;
        }

        /* Notification container */
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 1000;
        }

        /* Notification box */
        .notification {
            width: 260px;
            padding: 15px;
            border-radius: 10px;
            color: white;
            box-shadow: 0px 4px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.4s ease-out;
            font-size: 14px;
        }

        .high { background-color: #d9534f; }
        .medium { background-color: #f0ad4e; }
        .low { background-color: #5cb85c; }

        .notification h4 {
            margin: 0 0 5px 0;
            font-size: 15px;
        }

        .close-btn {
            margin-top: 8px;
            background: rgba(255,255,255,0.3);
            border: none;
            padding: 4px 8px;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 12px;
        }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    </style>
</head>

<body>

<div class="notification-container">

<?php foreach ($results as $parasite => $risk): ?>
    
    <?php list($class, $message) = getPopupData($parasite, $risk); ?>

    <div class="notification <?php echo $class; ?>">
        <h4><?php echo ucfirst($parasite); ?>: <?php echo $risk; ?>%</h4>
        <div><?php echo $message; ?></div>
        <button class="close-btn" onclick="this.parentElement.style.display='none'">Close</button>
    </div>

<?php endforeach; ?>

</div>

</body>
</html>

