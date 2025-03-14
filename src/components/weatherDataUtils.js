import axios from 'axios';

class WeatherError extends Error {
  constructor(message, type = 'UNKNOWN', details = {}) {
    super(message);
    this.name = 'WeatherError';
    this.type = type;
    this.details = details;
  }
}

const CONFIG = {
  // Use relative URL that will be handled by proxy server
  API_URL: '/api/weather',
  TIMEOUT: 10000
};

export async function fetchRealWeatherData(location) {
  if (!location) {
    throw new WeatherError('Location is required', 'INVALID_INPUT');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    const response = await axios.get(CONFIG.API_URL, {
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