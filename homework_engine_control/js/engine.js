let engineOn = false;
let rpm = 0;
let temp = 20;

const statusDisplay = document.getElementById("engineStatus");
const rpmDisplay = document.getElementById("rpmValue");
const tempDisplay = document.getElementById("tempValue");
const rpmSlider = document.getElementById("rpmSlider");

document.getElementById("startBtn").addEventListener("click", () => {
    engineOn = true;
    statusDisplay.textContent = "ON";
    statusDisplay.style.color = "#00e676";
});

document.getElementById("stopBtn").addEventListener("click", () => {
    engineOn = false;
    rpm = 0;
    temp = 20;
    rpmSlider.value = 0;

    statusDisplay.textContent = "OFF";
    statusDisplay.style.color = "#ff5252";

    rpmDisplay.textContent = rpm;
    tempDisplay.textContent = temp + "°C";
});

rpmSlider.addEventListener("input", () => {
    if (!engineOn) return;

    rpm = parseInt(rpmSlider.value);
    rpmDisplay.textContent = rpm;

    temp = 20 + Math.floor(rpm / 80);
    tempDisplay.textContent = temp + "°C";

    // Warnings
    if (rpm > 7000) {
        rpmDisplay.className = "danger";
    } else if (rpm > 5000) {
        rpmDisplay.className = "warning";
    } else {
        rpmDisplay.className = "";
    }

    if (temp > 120) {
        tempDisplay.className = "danger";
    } else if (temp > 90) {
        tempDisplay.className = "warning";
    } else {
        tempDisplay.className = "";
    }
});
