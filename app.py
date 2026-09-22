import sqlite3
import json
import os
from datetime import datetime, timedelta

import requests
from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, request

load_dotenv()

app = Flask(__name__)

DB_PATH = 'weather.db'
API_KEY = os.getenv("OPENWEATHER_API_KEY")
CACHE_DURATION = timedelta(minutes=30)


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS weather (
            id INTEGER PRIMARY KEY,
            city TEXT,
            data TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()


init_db()


def fetch_weather(city):
    url = f'https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric'

    response = requests.get(url)
    return response.json()


def get_weather(city):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute(
        'SELECT data, timestamp FROM weather WHERE city=? ORDER BY timestamp DESC LIMIT 1',
        (city,)
    )

    row = c.fetchone()

    if row:
        cached_data, timestamp = row
        timestamp = datetime.fromisoformat(timestamp)

        if datetime.now() - timestamp < CACHE_DURATION:
            conn.close()
            return json.loads(cached_data)

    data = fetch_weather(city)

    c.execute(
        'INSERT INTO weather (city, data) VALUES (?, ?)',
        (city, json.dumps(data))
    )

    conn.commit()
    conn.close()

    return data


@app.route('/')
def home():
    city = 'New York'
    weather = get_weather(city)

    return render_template('index.html', weather=weather)


@app.route('/api/cities')
def search_cities():
    city = request.args.get('q', '').strip()

    if not city:
        return jsonify([])

    url = 'https://api.openweathermap.org/geo/1.0/direct'
    params = {
        'q': city,
        'limit': 5,
        'appid': API_KEY
    }

    response = requests.get(url, params=params)
    return jsonify(response.json())


@app.route('/api/weather')
def weather_api():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    units = request.args.get('units', 'metric')

    if not lat or not lon:
        return jsonify({"error": "Latitude and longitude are required"}), 400

    url = 'https://api.openweathermap.org/data/2.5/weather'
    params = {
        'lat': lat,
        'lon': lon,
        'appid': API_KEY,
        'units': units
    }

    response = requests.get(url, params=params)
    return jsonify(response.json()), response.status_code

@app.route('/api/forecast')
def forecast_api():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    units = request.args.get('units', 'metric')

    if not lat or not lon:
        return jsonify({"error": "Latitude and longitude are required"}), 400

    url = 'https://api.openweathermap.org/data/3.0/onecall'
    params = {
        'lat': lat,
        'lon': lon,
        'exclude': 'minutely,current',
        'appid': API_KEY,
        'units': units
    }

    response = requests.get(url, params=params)
    return jsonify(response.json()), response.status_code

if __name__ == '__main__':
    app.run(debug=True)
