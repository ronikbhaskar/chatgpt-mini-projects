// https://sunrise-sunset.org/api
async function getSunriseSunset(latitude, longitude, callback) {
    const url = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`;
    const response = await fetch(url);
    const data = await response.json();
    const sunrise = new Date(data.results.sunrise);
    const sunset = new Date(data.results.sunset);
    callback(sunrise, sunset);
}
  
function getLatitudeLongitude(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const result = [latitude, longitude];
            callback(result);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}
  
getLatitudeLongitude(function(result) {
    getSunriseSunset(result[0], result[1], doClock);
});
  
  
function doClock(sunrise, sunset) {
    
    const startAngle = sunrise.getHours() + sunrise.getMinutes() / 60;
    const endAngle = sunset.getHours() + sunset.getMinutes() / 60;
    console.log(sunrise, sunset)
    
    const numHours = endAngle - startAngle;
    // Create a canvas element
    const canvas = document.getElementById('canvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Get the canvas context
    const ctx = canvas.getContext('2d');
    
    // Define the clock parameters
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.4;
    const hourLength = radius * 0.7;
    
    // Define the colors
    var bgColor;
    var hourColor;
    var shadedColor;
    
    // Draw the clock face
    function drawClock() {
        // Clear the canvas
    
        const date = new Date();
        const hours = date.getHours() + date.getMinutes() / 60;
        let angle;
        if (hours >= startAngle && hours <= endAngle) {
            angle = (hours - startAngle) / (endAngle - startAngle) * Math.PI * 2 - Math.PI / 2;
            bgColor = '#f7e6d1';
            hourColor = '#543d26';
            shadedColor = 'rgba(84, 61, 38, 0.3)';
        } else {
            angle = 3 * Math.PI / 2;
            bgColor = '#1b2735';
            hourColor = "#7d8e9c";
            shadedColor = 'rgba(99, 110, 118, 0.3)';
        }
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, angle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = shadedColor;
        ctx.fill();
    
        // Draw the clock face
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = hourColor;
        ctx.lineWidth = 8;
        ctx.stroke();
    
        // Draw the hour ticks
        for (let i = 1; i <= numHours + 1; i++) {
            const angle = (i - 1) / numHours * Math.PI * 2 - Math.PI / 2;
            const x1 = centerX + (radius - 0.5 * hourLength) * Math.cos(angle);
            const y1 = centerY + (radius - 0.5 * hourLength) * Math.sin(angle);
            const x2 = centerX + radius * Math.cos(angle);
            const y2 = centerY + radius * Math.sin(angle);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = hourColor;
            ctx.lineWidth = 6;
            ctx.stroke();
        }
    
        // Draw the hour hand
        const x = centerX + hourLength * Math.cos(angle);
        const y = centerY + hourLength * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = hourColor;
        ctx.lineWidth = 10;
        ctx.stroke();
    }
    
    // Draw the clock initially
    drawClock();
    
    // Animate the clock
    setInterval(drawClock, 1000 * 60); // Update every 1 minute
}
  
  
  
  