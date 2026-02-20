<?php
// need to merge risk calculator
$results = [
    "gutWorm" => 68,
    "lungworm" => 82,
    "liverFluke" => 91,
    "hairWorm" => 40,
    "coccidia" => 55,
    "tick" => 84
];

function getPopupData($parasite, $risk) {

    $message = "";
    $class = "";
// all high risk messages 
    if ($risk >= 75) {
        $class = "high";
        switch($parasite) {
            case "gutWorm":
                $message = "🪱 Pasture party time!";
                break;
            case "lungworm":
                $message = "🐛 Great day to be a lungworm!";
                break;
            case "liverFluke":
                $message = "🐌 Swampy vibes activated!";
                break;
            case "hairWorm":
                $message = "🧵 Underground takeover!";
                break;
            case "coccidia":
                $message = "🦠 Multiplying rapidly!";
                break;
            case "tick":
                $message = "🪳Ticks are #lovinglife!";
                break;
        }
    } elseif ($risk >= 50) {
        $class = "medium";
        $message = "⚠ Oh No! Moderate risk today.";
    } else {
        $class = "low";
        $message = "☀ Hehe! Low risk conditions.";
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

        .notification-container {
            position: fixed;
            top: 15px;
            right: 15px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 1000;
        }

        .notification {
            position: relative;
            width: 200px;              
            padding: 8px 10px;           
            border-radius: 6px;
            color: white;
            box-shadow: 0px 2px 8px rgba(0,0,0,0.2);
            font-size: 12px;
            line-height: 1.3;
            animation: slideIn 0.3s ease-out;
        }

        .high { background-color: #d9534f; } /* red */
        .medium { background-color: #f0ad4e; } /* orange */
        .low { background-color: #5cb85c; } /* green */

        .notification h4 {
            margin: 0 0 2px 0;
            font-size: 12px;
            font-weight: bold;
        }

        .close-btn {
            position: absolute;
            top: 4px;
            right: 6px;
            background: none;
            border: none;
            color: white;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            padding: 0;
        }

        .close-btn:hover {
            opacity: 0.7;
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
        <button class="close-btn" onclick="this.parentElement.style.display='none'">×</button>
        <h4><?php echo ucfirst($parasite); ?>: <?php echo $risk; ?>%</h4>
        <div><?php echo $message; ?></div>
    </div>

<?php endforeach; ?>

</div>

</body>
</html>



