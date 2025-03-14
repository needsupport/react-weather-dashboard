import axios from 'axios';

class WeatherError extends Error {
  constructor(message, type = 'UNKNOWN', details = {}) {
    super(message);
    this.name = 'WeatherError';
    this.type = type;
    this.details = details;
  }
}

// Default configuration
let CONFIG = {
  API_URL: '/api/weather',
  SERVER_URL: 'http://localhost:3001',
  TIMEOUT: 10000
};

/**
 * Updates the API configuration
 * 
 * @param {Object} config - Configuration options
 * @param {string} config.apiUrl - API endpoint path
 * @param {string} config.serverUrl - Server base URL
 * @param {number} config.timeout - Request timeout in ms
 */
export function updateConfig(config = {}) {
  if (config.apiUrl) CONFIG.API_URL = config.apiUrl;
  if (config.serverUrl) CONFIG.SERVER_URL = config.serverUrl;
  if (config.timeout) CONFIG.TIMEOUT = config.timeout;
}

/**
 * Configures the server API with the provided key and endpoint
 * 
 * @param {Object} config - Server configuration
 * @param {string} config.apiKey - Weather API key
 * @param {string} config.apiUrl - Weather API endpoint URL
 * @returns {Promise<Object>} - Configuration result
 */
export async function configureServerApi(config = {}) {
  try {
    const response = await axios.post(`${CONFIG.SERVER_URL}/api/config`, {
      apiKey: config.apiKey,
      apiUrl: config.apiUrl,
      cacheDuration: config.cacheDuration,
      rateLimitWindowMs: config.rateLimitWindowMs,
      rateLimitMaxRequests: config.rateLimitMaxRequests
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to configure API:', error);
    throw new WeatherError(
      'Failed to configure API server', 
      'CONFIG_ERROR',
      { originalError: error.message }
    );
  }
}

/**
 * Get current server configuration
 * 
 * @returns {Promise<Object>} - Current configuration
 */
export async function getServerConfig() {
  try {
    const response = await axios.get(`${CONFIG.SERVER_URL}/api/config`);
    return response.data;
  } catch (error) {
    console.error('Failed to get configuration:', error);
    throw new WeatherError(
      'Failed to retrieve API configuration', 
      'CONFIG_ERROR',
      { originalError: error.message }
    );
  }
}

/**
 * Fetches weather data for a location
 * 
 * @param {string} location - Location name or coordinates
 * @returns {Promise<Object>} - Weather data object
 */
export async function fetchRealWeatherData(location) {
  if (!location) {
    throw new WeatherError('Location is required', 'INVALID_INPUT');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    const response = await axios.get(`${CONFIG.SERVER_URL}${CONFIG.API_URL}`, {
      signal: controller.signal,
      params: {
        location: location
      }
    });

    clearTimeout(timeoutId);

    if (!response.data) {
      throw new WeatherError('No weather data available', 'NO_DATA');
    }

    // Transform the API response to match component expectations
    return {
      daily: [{
        id: 'today',
        day: 'Today',
        date: new Date().toLocaleDateString(),
        tempHigh: response.data.temperature,
        tempLow: response.data.temperature - 10, // Estimate for demo
        precipitation: { 
          chance: response.data.humidity // Use humidity as precipitation chance for demo
        },
        uvIndex: 5, // Default UV value since API doesn't provide it
        wind: { 
          speed: response.data.windSpeed, 
          direction: 'NE' // Default direction since API doesn't provide it
        },
        icon: getIconFromDescription(response.data.description)
      }],
      hourly: [],
      historical: [],
      historicalRanges: []
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new WeatherError('Request timed out', 'TIMEOUT');
    }

    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new WeatherError(
          `Server error: ${error.response.status}`, 
          'SERVER_ERROR', 
          { status: error.response.status }
        );
      }
      if (error.request) {
        throw new WeatherError('No response from server', 'NO_RESPONSE');
      }
    }

    throw new WeatherError(error.message, 'UNKNOWN_ERROR');
  }
}

/**
 * Helper function to convert weather description to icon type
 * 
 * @param {string} description - Weather description from API
 * @returns {string} - Icon type for WeatherCard
 */
function getIconFromDescription(description = '') {
  const desc = description.toLowerCase();
  
  if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
    return 'rain';
  } else if (desc.includes('cloud')) {
    return 'cloud';
  } else if (desc.includes('snow')) {
    return 'snow';
  } else if (desc.includes('clear') || desc.includes('sun')) {
    return 'sun';
  }
  
  return 'cloud'; // Default
}

export function generateHistoricalData() {
  // Empty stub function to be implemented later
  return [];
}

export function generateHistoricalRanges() {
  // Empty stub function to be implemented later
  return [];
}