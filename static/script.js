const API_KEY = "b62c7bc294c2fcb565ea9928c1201787";

let lastCity = "New York";
const unitToggle = document.getElementById("unit-toggle");

unitToggle.addEventListener("change",function() {
    getWeather(lastCity);
});

function unixToTime(unix_timestamp) {
    const date = new Date(unix_timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function getWeather(city) {
    try {
        lastCity = city;

        let units;
        let unitSymbol;
        let windSpeedUnit;

        if (unitToggle.checked) {
            units = 'imperial';
            unitSymbol = '°F';
            windSpeedUnit = 'mph';

        } else {
            units = 'metric';
            unitSymbol = '°C';
            windSpeedUnit = 'm/s';
        }


        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`);

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();

        document.getElementById("city-name").textContent = `${data.name}, ${data.sys.country}`;
        document.getElementById("temperature").textContent = `${Math.round(data.main.temp)} ${unitSymbol}`;
        document.getElementById("humidity").textContent = `${data.main.humidity}%`;
        document.getElementById("sunrise").textContent = unixToTime(data.sys.sunrise);
        document.getElementById("sunset").textContent = unixToTime(data.sys.sunset);
        document.getElementById("feelsLike").textContent = `${data.main.feels_like} ${unitSymbol}`;
        document.getElementById("wind").textContent = `${data.wind.speed} ${windSpeedUnit}`;
        const iconCode = data.weather[0].icon;
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        // Call forecast function
        getForecast(data.coord.lat, data.coord.lon, units, unitSymbol);
    } catch (error) {
        alert(error.message);
    }
}

async function getForecast(lat, lon, units, unitSymbol) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,current&appid=${API_KEY}&units=${units}`);
        if (!response.ok) {
            throw new Error("Failed to get forecast");
        }

        const data = await response.json();

        // Hourly forecast
        const hourlyCont = document.getElementById("hourly-forecast");
        hourlyCont.innerHTML = "";
        data.hourly.slice(0, 24).forEach(hour => {
            const hourDiv = document.createElement("div");
            hourDiv.classList.add("hour-card");
            hourDiv.innerHTML = `
                <p>${unixToTime(hour.dt)}</p>
                <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png">
                <p>${Math.round(hour.temp)}${unitSymbol}</p>
            `;
            hourlyCont.appendChild(hourDiv);
        });


       // Daily forecast
        const dailyCont = document.getElementById("weekly-forecast");
        dailyCont.innerHTML = "";
        data.daily.slice(0, 7).forEach(day => {
            const dailyDiv = document.createElement("div");
            dailyDiv.classList.add("forecast-day"); // matching our Apple-style CSS

            dailyDiv.innerHTML = `
                <span class="day-name">${new Date(day.dt * 1000).toLocaleDateString([], { weekday: 'long' })}</span>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="icon">
                <span class="temps">
                 <strong class="max-temp">${Math.round(day.temp.max)}${unitSymbol}</strong> / <span class="min-temp">${Math.round(day.temp.min)}${unitSymbol}</span>
            </span>
    `;

    dailyCont.appendChild(dailyDiv);

});


        // Alerts
        const alertCont = document.getElementById("alerts-card");
        alertCont.innerHTML = "";
        if (data.alerts && data.alerts.length > 0) {
            data.alerts.forEach(alert => {
                const alertDiv = document.createElement("div");
                alertDiv.classList.add("alert-card");
                alertDiv.innerHTML = `
                    <h4>${alert.event}</h4>
                    <p>${alert.description}</p>
                `;
                alertCont.appendChild(alertDiv);
            });
        } else {
            alertCont.innerHTML = "<p>No weather alerts currently</p>";
        }

    } catch (error) {
        alert(error.message);
    }
}

// Search form event listener
document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const city = document.getElementById("search-input").value;
    if (city) {
        getWeather(city);
    }
});

// Default city load
getWeather("New York");


