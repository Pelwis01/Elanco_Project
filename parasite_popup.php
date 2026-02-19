<?php
// Example data unil we link the calculator
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
        }

    } elseif ($risk >= 50) {
        $class = "medium";
        $message = "⚠ Oh no! Moderate risk today.";
    } else {
        $class = "low";
        $message = "☀ Oh Yeah! Low risk conditions.";
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
            gap: 8px;
            z-index: 1000;
        }

        .notification {
            width: 220px;              
            padding: 10px 12px;        
            border-radius: 8px;
            color: white;
            box-shadow: 0px 3px 10px rgba(0,0,0,0.2);
            font-size: 13px;           
            line-height: 1.3;
            animation: slideIn 0.3s ease-out;
        }

        .high { background-color: #d9534f; }
        .medium { background-color: #f0ad4e; }
        .low { background-color: #5cb85c; }

        .notification h4 {
            margin: 0 0 3px 0;
            font-size: 13px;          
            font-weight: bold;
        }

        .close-btn {
            margin-top: 5px;
            background: rgba(255,255,255,0.25);
            border: none;
            padding: 3px 6px;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 11px;
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
        <button class="close-btn" onclick="this.parentElement.style.display='none'">x</button>
    </div>

<?php endforeach; ?>

</div>

</body>
</html>


