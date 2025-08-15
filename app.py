import sqlite3
import json
from datetime import datetime, timedelta
import requests
from flask import Flask, render_template

app = Flask(__name__)
DB_PATH = 'weather.db'
API_KEY = 'b62c7bc294c2fcb565ea9928c1201787'
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

    c.execute('SELECT data, timestamp FROM weather WHERE city=? ORDER BY timestamp DESC LIMIT 1', (city,))
    row = c.fetchone()

    if row:
        cached_data, timestamp = row
        timestamp = datetime.fromisoformat(timestamp)
        if datetime.now() - timestamp < CACHE_DURATION:
            conn.close()
            return json.loads(cached_data)  # return cached

    data = fetch_weather(city)
    c.execute('INSERT INTO weather (city, data) VALUES (?, ?)', (city, json.dumps(data)))
    conn.commit()
    conn.close()
    return data

@app.route('/')
def home():
    city = 'New York'
    weather = get_weather(city)
    return render_template('index.html', weather=weather)

if __name__ == '__main__':
    app.run(debug=True)
