
function getPopupData(parasite, risk) {

    let message = "";
    let intensity = "";
// all high risk messages 
    if (risk >= 75) {
        intensity = "high";
        switch(parasite) {
            case "gutworm":
                message = "🪱 Pasture party time!";
                break;
            case "lungworm":
                message = "🐛 Great day to be a lungworm!";
                break;
            case "liverfluke":
                message = "🐌 Swampy vibes activated!";
                break;
            case "hairworm":
                message = "🧵 Underground takeover!";
                break;
            case "coccidia":
                message = "🦠 Multiplying rapidly!";
                break;
            case "tick":
                message = "🪳Ticks are #lovinglife!";
                break;
        };
    } else if (risk >= 50) {
        intensity = "medium";
        message = "⚠ Oh No! Moderate risk today.";
    } else {
        intensity = "low";
        message = "☀ Hehe! Low risk conditions.";
    };

    const container = document.querySelector(".notification-container");
    const notification = document.createElement("div");
    notification.className = `notification ${intensity}`;
    notification.innerHTML = `
        <button class="close-btn" onclick="this.parentElement.style.display='none'">×</button>
        <h4>${parasite}: ${risk}%</h4>
        <div>${message}</div>
    `;
    container.appendChild(notification);
    console.log(`Popup for ${parasite} with risk ${risk}%: ${message}`);
   
    
};
