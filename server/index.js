const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const apicache = require('apicache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const cache = apicache.middleware;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests, please try again later.'
});

// Apply rate limiting to all weather API endpoints
app.use('/api/weather', limiter);

// Weather API route with caching
app.get('/api/weather', cache('10 minutes'), async (req, res) => {
  try {
    const location = req.query.location;
    
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    // Get API key from environment variables
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      console.error('API key is missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Determine if location is a city name or coordinates
    const isCoordinates = location.includes(',');
    let params = {};

    if (isCoordinates) {
      const [lat, lon] = location.split(',');
      params = {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      };
    } else {
      params = {
        q: location,
        appid: API_KEY,
        units: 'metric'
      };
    }

    // Make request to OpenWeather API
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params
    });

    // Transform the data before sending it to client
    const weatherData = {
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error.message);
    
    if (error.response) {
      // Forward OpenWeather API error messages
      return res.status(error.response.status).json({
        error: `Weather service error: ${error.response.status}`,
        message: error.response.data.message || 'Unknown error'
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Static file serving for production builds
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../build'));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
