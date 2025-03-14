const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const apicache = require('apicache');

const app = express();
const PORT = process.env.PORT || 3001;
const cache = apicache.middleware;

// Default config that can be overridden at runtime
let CONFIG = {
  // Default to National Weather Service API
  WEATHER_API_URL: 'https://api.weather.gov',
  WEATHER_API_TYPE: 'nws', // 'nws' or 'openweather'
  WEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  CACHE_DURATION: '10 minutes',
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 50
};

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint to update configuration at runtime
app.post('/api/config', (req, res) => {
  const { apiUrl, apiType, apiKey, cacheDuration, rateLimitWindowMs, rateLimitMaxRequests } = req.body;
  
  // Only update values that are provided
  if (apiUrl) CONFIG.WEATHER_API_URL = apiUrl;
  if (apiType) CONFIG.WEATHER_API_TYPE = apiType;
  if (apiKey) CONFIG.WEATHER_API_KEY = apiKey;
  if (cacheDuration) CONFIG.CACHE_DURATION = cacheDuration;
  if (rateLimitWindowMs) CONFIG.RATE_LIMIT_WINDOW_MS = rateLimitWindowMs;
  if (rateLimitMaxRequests) CONFIG.RATE_LIMIT_MAX_REQUESTS = rateLimitMaxRequests;
  
  // Return current configuration (without the API key for security)
  res.json({
    apiUrl: CONFIG.WEATHER_API_URL,
    apiType: CONFIG.WEATHER_API_TYPE,
    cacheDuration: CONFIG.CACHE_DURATION,
    rateLimitWindowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: CONFIG.RATE_LIMIT_MAX_REQUESTS,
    message: 'Configuration updated successfully'
  });
});

// Get current configuration (without API key)
app.get('/api/config', (req, res) => {
  res.json({
    apiUrl: CONFIG.WEATHER_API_URL,
    apiType: CONFIG.WEATHER_API_TYPE,
    cacheDuration: CONFIG.CACHE_DURATION,
    rateLimitWindowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: CONFIG.RATE_LIMIT_MAX_REQUESTS
  });
});

// Create rate limiter with dynamic configuration
const getLimiter = () => rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
  max: CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests, please try again later.'
});

// NWS common request headers
const getNWSHeaders = () => ({
  'User-Agent': '(react-weather-dashboard, contact@example.com)', // Replace with your contact info
  'Accept': 'application/geo+json'
});

// Helper to validate coordinates
const validateCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lon)) {
    return false;
  }
  
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return false;
  }
  
  return true;
};

// NWS points endpoint (get grid information)
app.get('/api/weather/points', cache(CONFIG.CACHE_DURATION), getLimiter(), async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude parameters are required' });
    }

    if (!validateCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.' });
    }

    // Call NWS points endpoint
    const response = await axios.get(`${CONFIG.WEATHER_API_URL}/points/${latitude},${longitude}`, {
      headers: getNWSHeaders(),
      timeout: 10000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Weather API error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Weather service error: ${error.response.status}`,
        message: error.response?.data?.detail || 'Unknown error'
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// NWS forecast endpoint
app.get('/api/weather/forecast', cache(CONFIG.CACHE_DURATION), getLimiter(), async (req, res) => {
  try {
    const { endpoint } = req.query;
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Forecast endpoint parameter is required' });
    }

    // Call NWS forecast endpoint
    const response = await axios.get(endpoint, {
      headers: getNWSHeaders(),
      timeout: 10000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Weather API error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Weather service error: ${error.response.status}`,
        message: error.response?.data?.detail || 'Unknown error'
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// NWS stations endpoint
app.get('/api/weather/stations', cache(CONFIG.CACHE_DURATION), getLimiter(), async (req, res) => {
  try {
    const { endpoint } = req.query;
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Stations endpoint parameter is required' });
    }

    const response = await axios.get(endpoint, {
      headers: getNWSHeaders(),
      timeout: 10000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Weather API error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Weather service error: ${error.response.status}`,
        message: error.response?.data?.detail || 'Unknown error'
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch station data' });
  }
});

// NWS station observations endpoint
app.get('/api/weather/observations', cache(CONFIG.CACHE_DURATION), getLimiter(), async (req, res) => {
  try {
    const { stationId } = req.query;
    
    if (!stationId) {
      return res.status(400).json({ error: 'Station ID parameter is required' });
    }

    const response = await axios.get(`${CONFIG.WEATHER_API_URL}/stations/${stationId}/observations/latest`, {
      headers: getNWSHeaders(),
      timeout: 10000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Weather API error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Weather service error: ${error.response.status}`,
        message: error.response?.data?.detail || 'Unknown error'
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch observation data' });
  }
});

// NWS alerts endpoint
app.get('/api/weather/alerts', cache('5 minutes'), getLimiter(), async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude parameters are required' });
    }

    if (!validateCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Get active alerts for the point
    const response = await axios.get(`${CONFIG.WEATHER_API_URL}/alerts/active`, {
      params: {
        point: `${latitude},${longitude}`
      },
      headers: getNWSHeaders(),
      timeout: 10000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Weather API error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Weather service error: ${error.response.status}`,
        message: error.response?.data?.detail || 'Unknown error'
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
});

// NWS gridpoints endpoint for raw forecast data
app.get('/api/weather/gridpoints', cache(CONFIG.CACHE_DURATION), getLimiter(), async (req, res) => {
  try {
    const { office, gridX, gridY } = req.query;
    
    if (!office || !gridX || !gridY) {
      return res.status(400).json({ error: 'Office, gridX, and gridY parameters are required' });
    }

    const response = await axios.get(`${CONFIG.WEATHER_API_URL}/gridpoints/${office}/${gridX},${gridY}`, {
      headers: getNWSHeaders(),
      timeout: 10000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Weather API error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Weather service error: ${error.response.status}`,
        message: error.response?.data?.detail || 'Unknown error'
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch gridpoint data' });
  }
});

// Legacy endpoint for OpenWeather API
app.get('/api/weather', (req, res, next) => {
  // Apply dynamic cache configuration
  cache(CONFIG.CACHE_DURATION)(req, res, next);
}, getLimiter(), async (req, res) => {
  try {
    // If using NWS, redirect to the appropriate NWS endpoint
    if (CONFIG.WEATHER_API_TYPE === 'nws') {
      return res.status(400).json({ 
        error: 'This endpoint is for OpenWeather API only',
        message: 'Please use /api/weather/points and /api/weather/forecast for NWS API'
      });
    }
    
    const location = req.query.location;
    
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    // Get API key from configuration
    const API_KEY = CONFIG.WEATHER_API_KEY;
    
    if (!API_KEY) {
      console.error('API key is missing');
      return res.status(500).json({ 
        error: 'Weather API key not configured', 
        message: 'Please configure API key using the /api/config endpoint' 
      });
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

    // Make request to configured Weather API
    const response = await axios.get(`${CONFIG.WEATHER_API_URL}/data/2.5/weather`, {
      params,
      timeout: 10000
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
      // Forward API error messages
      return res.status(error.response.status).json({
        error: `Weather service error: ${error.response.status}`,
        message: error.response?.data?.message || 'Unknown error'
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Static file serving for production builds
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../build'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    apiUrl: CONFIG.WEATHER_API_URL,
    apiType: CONFIG.WEATHER_API_TYPE
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Type: ${CONFIG.WEATHER_API_TYPE}`);
  console.log(`API URL: ${CONFIG.WEATHER_API_URL}`);
  console.log(`Visit http://localhost:${PORT}/health to check server status`);
});

module.exports = app; // For testing purposes