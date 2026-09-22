# Sky-Wise 🌤️

A weather web application built with Flask and JavaScript that provides current weather conditions, forecasts, and city search using the OpenWeather API.

## Features

* 🌡️ Current weather conditions
* 📍 Search for cities with autocomplete suggestions
* 🌦️ Hourly and weekly forecasts
* 🌡️ Toggle between Celsius and Fahrenheit
* 💨 Wind speed and other weather details
* ⚠️ Weather alerts when available
* 💾 SQLite-based weather caching
* 🔐 Server-side API key handling using environment variables

## Tech Stack

* **Backend:** Python, Flask
* **Frontend:** HTML, CSS, JavaScript, Bootstrap
* **Database:** SQLite
* **API:** OpenWeather API
* **Tools:** Git, GitHub

## Project Structure

```text
sky-wise/
├── app.py
├── requirements.txt
├── templates/
│   └── index.html
├── static/
│   ├── script.js
│   └── style.css
├── .gitignore
└── README.md
```

## How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/eshapansara/sky-wise.git
cd sky-wise
```

### 2. Create and activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Add your OpenWeather API key

Create a `.env` file in the project root:

```text
OPENWEATHER_API_KEY=your_api_key_here
```

The `.env` file is excluded from Git using `.gitignore` so the API key is not committed to the repository.

### 5. Run the application

```bash
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

## API Architecture

Sky-Wise uses Flask as a backend layer between the frontend and OpenWeather.

The browser communicates with Flask endpoints for:

* `/api/cities` — city search and geocoding
* `/api/weather` — current weather
* `/api/forecast` — forecast data

This keeps the OpenWeather API key on the server rather than exposing it in client-side JavaScript.

## Caching

Current weather data is cached in SQLite for 30 minutes to reduce repeated API requests for the same city.

## Future Improvements

* Deploy the application for public access
* Improve error handling for API failures
* Add additional weather visualizations
* Improve responsive design for mobile devices
* Add automated tests
