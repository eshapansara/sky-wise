const API_KEY = "b62c7bc294c2fcb565ea9928c1201787";

let lastCity = "New York";
const unitToggle = document.getElementById("unit-toggle");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const suggestionsList = document.getElementById("suggestions-list");

unitToggle.addEventListener("change", function() {
    getWeatherByCity(lastCity);
});


searchForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const city = searchInput.value;
    getWeatherByCity(city);
    suggestionsList.style.display = 'none';
});

function unixToTime(unix_timestamp) {
    const date = new Date(unix_timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function getLocationDetails(city, limit = 5) {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${API_KEY}`);
    const data = await res.json();
    if (data.length > 0) {
        return data;
    }
    throw new Error("City not found");
}

async function getWeather(lat, lon, cityName, state, country) {
    try {
        lastCity = cityName;

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

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`);

        if (!response.ok) {
            throw new Error("Weather data not found");
        }

        const data = await response.json();

        const locationText = `${cityName}${state ? ', ' + state : ''}, ${country}`;
        document.getElementById("city-name").textContent = locationText;

        document.getElementById("temperature").textContent = `${Math.round(data.main.temp)} ${unitSymbol}`;
        document.getElementById("humidity").textContent = `${data.main.humidity}%`;
        document.getElementById("sunrise").textContent = unixToTime(data.sys.sunrise);
        document.getElementById("sunset").textContent = unixToTime(data.sys.sunset);
        document.getElementById("feelsLike").textContent = `${Math.round(data.main.feels_like)} ${unitSymbol}`;
        document.getElementById("wind").textContent = `${data.wind.speed} ${windSpeedUnit}`;
        const iconCode = data.weather[0].icon;
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        getForecast(lat, lon, units, unitSymbol);
    } catch (error) {
        alert(error.message);
    }
}

async function getWeatherByCity(city) {
    try {
        const locations = await getLocationDetails(city, 1); // Get only the top result for a direct search
        if (locations.length > 0) {
            const loc = locations[0];
            getWeather(loc.lat, loc.lon, loc.name, loc.state, loc.country);
        } else {
            throw new Error("City not found");
        }
    } catch (error) {
        alert(error.message);
    }
}

async function showCitySuggestions(searchQuery) {
    suggestionsList.innerHTML = '';
    if (searchQuery.length < 3) { // Only show suggestions after 3 characters
        suggestionsList.style.display = 'none';
        return;
    }

    try {
        const locations = await getLocationDetails(searchQuery);

        if (locations.length > 0) {
            suggestionsList.style.display = 'block';
            locations.forEach(loc => {
                const li = document.createElement("li");
                const locText = `${loc.name}${loc.state ? ', ' + loc.state : ''}, ${loc.country}`;
                li.textContent = locText;

                li.addEventListener('click', () => {
                    getWeather(loc.lat, loc.lon, loc.name, loc.state, loc.country);
                    searchInput.value = locText;
                    suggestionsList.style.display = 'none';
                });
                suggestionsList.appendChild(li);
            });
        } else {
            suggestionsList.style.display = 'none';
        }
    } catch (error) {
        suggestionsList.style.display = 'none';
        console.error(error);
    }
}

// Search input event listener for showing suggestions
searchInput.addEventListener("input", (e) => {
    showCitySuggestions(e.target.value);
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
        suggestionsList.style.display = 'none';
    }
});


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
        const alertsContent = document.getElementById("alerts-content");

        alertsContent.innerHTML = "";
        if (data.alerts && data.alerts.length > 0) {
            data.alerts.forEach(alert => {
                const alertDiv = document.createElement("div");
                alertDiv.classList.add("alert-card");
                alertDiv.innerHTML = `
                    <h4>${alert.event}</h4>
                    <p>${alert.description}</p>
                `;
                alertsContent.appendChild(alertDiv);
            });
        } else {
            alertsContent.innerHTML = "<p>No weather alerts currently</p>";
        }

    } catch (error) {
        alert(error.message);
    }
}

// Default city load
getWeatherByCity("New York");