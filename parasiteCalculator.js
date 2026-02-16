function getParasiteRisk(temperature, rainfall) {
// rainfall in mm per week, temperature in °C based on average weekly conditions
    const risk = {
        gutWorm: "LOW",
        lungworm: "LOW",
        liverFluke: "LOW",
        hairWorm: "LOW",
        coccidia: "LOW"
    };

    // 1.Global LOW risk for all parasites if temperature is below 5°C

    if (temperature < 5) {
        return risk; // All remain LOW
    }

    // 2. COCCIDIA likes moderate temperatures and rainfall

    if (temperature >= 5 && temperature < 15 && rainfall >= 10) {
        risk.coccidia = "MODERATE";
    }
    if (temperature >= 10 && temperature < 20 && rainfall >= 20) {
        risk.coccidia = "HIGH";
    }

    // 3. GUT WORM (Ostertagia)=
    if (temperature >= 5 && temperature < 10 && rainfall >= 10) {
        risk.gutWorm = "MODERATE";
    }

    if (temperature >= 10 && temperature < 20) {
        if (rainfall >= 20) {
            risk.gutWorm = "HIGH";
        } else {
            risk.gutWorm = "MODERATE";
        }
    }

    if (temperature >= 20 && rainfall >= 10) {
        risk.gutWorm = "MODERATE";
    }


    // 4. LUNGWORM likes warmer temperatures and moderate rainfall

    if (temperature >= 8 && temperature < 12 && rainfall >= 20) {
        risk.lungworm = "MODERATE";
    }

    if (temperature >= 12) {
        if (rainfall >= 20) {
            risk.lungworm = "HIGH";
        } else if (rainfall >= 10) {
            risk.lungworm = "MODERATE";
        }
    }

    // 5. LIVER FLUKE (Fasciola hepatica) likes wet conditions and moderate temparatures

    if (rainfall >= 20 && temperature >= 5 && temperature < 10) {
        risk.liverFluke = "MODERATE";
    }

    if (rainfall >= 40 && temperature >= 10 && temperature < 20) {
        risk.liverFluke = "HIGH";
    }

    if (rainfall >= 40 && temperature >= 20) {
        risk.liverFluke = "MODERATE";
    }

    // 6. HAIR WORM (Haemonchus) likes warm temperatures and moderate to high rainfall

    if (temperature >= 12 && temperature < 18 && rainfall >= 20) {
        risk.hairWorm = "MODERATE";
    }

    if (temperature >= 18 && rainfall >= 20) {
        risk.hairWorm = "HIGH";
    }

    return risk;
}
