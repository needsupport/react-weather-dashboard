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
  API_TYPE: 'nws', // 'nws' or 'openweather'
  API_URL: '/api/weather',
  SERVER_URL: 'http://localhost:3001',
  TIMEOUT: 10000
};

/**
 * Updates the API configuration
 * 
 * @param {Object} config - Configuration options
 * @param {string} config.apiType - API type ('nws' or 'openweather')
 * @param {string} config.apiUrl - API endpoint path
 * @param {string} config.serverUrl - Server base URL
 * @param {number} config.timeout - Request timeout in ms
 */
export function updateConfig(config = {}) {
  if (config.apiType) CONFIG.API_TYPE = config.apiType;
  if (config.apiUrl) CONFIG.API_URL = config.apiUrl;
  if (config.serverUrl) CONFIG.SERVER_URL = config.serverUrl;
  if (config.timeout) CONFIG.TIMEOUT = config.timeout;
}

/**
 * Configures the server API with the provided key and endpoint
 * 
 * @param {Object} config - Server configuration
 * @param {string} config.apiKey - Weather API key (for OpenWeather)
 * @param {string} config.apiUrl - Weather API endpoint URL
 * @param {string} config.apiType - API type ('nws' or 'openweather')
 * @returns {Promise<Object>} - Configuration result
 */
export async function configureServerApi(config = {}) {
  try {
    const response = await axios.post(`${CONFIG.SERVER_URL}/api/config`, {
      apiKey: config.apiKey,
      apiUrl: config.apiUrl,
      apiType: config.apiType,
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
 * Fetches weather data from National Weather Service API
 * 
 * This is a two-step process:
 * 1. Get grid information from /points endpoint
 * 2. Use returned forecast URL to get forecast data
 * 
 * @param {string} location - Location coordinates "lat,lon"
 * @returns {Promise<Object>} - Weather data object
 */
async function fetchNWSWeatherData(location) {
  if (!location || !location.includes(',')) {
    throw new WeatherError('Valid coordinates (lat,lon) are required for NWS API', 'INVALID_INPUT');
  }

  try {
    const [latitude, longitude] = location.split(',');
    
    // Step 1: Get grid information
    const pointsResponse = await axios.get(`${CONFIG.SERVER_URL}/api/weather/points`, {
      params: { latitude, longitude },
      timeout: CONFIG.TIMEOUT
    });

    if (!pointsResponse.data || !pointsResponse.data.properties) {
      throw new WeatherError('Invalid response from NWS Points API', 'INVALID_RESPONSE');
    }

    // Extract metadata from points response
    const properties = pointsResponse.data.properties;
    const forecastUrl = properties.forecast;
    const forecastHourlyUrl = properties.forecastHourly;
    const forecastGridDataUrl = properties.forecastGridData;
    const observationStationsUrl = properties.observationStations;
    const fireWeatherForecastUrl = properties.forecastZone;
    const county = properties.county;
    const relativeLocation = properties.relativeLocation?.properties;
    
    // Extract office and grid coordinates (for potential direct API calls)
    // URL format is like: https://api.weather.gov/gridpoints/TOP/31,80
    const gridpointParts = forecastGridDataUrl.split('/gridpoints/')[1].split('/');
    const office = gridpointParts[0];
    const gridCoordinates = gridpointParts[1];

    // Step 2: Get forecast using the URL from the points response
    const forecastResponse = await axios.get(`${CONFIG.SERVER_URL}/api/weather/forecast`, {
      params: { endpoint: forecastUrl },
      timeout: CONFIG.TIMEOUT
    });

    if (!forecastResponse.data || !forecastResponse.data.properties || !forecastResponse.data.properties.periods) {
      throw new WeatherError('Invalid response from NWS Forecast API', 'INVALID_RESPONSE');
    }

    // Step 3: Get hourly forecast for more detailed data
    let hourlyForecast = [];
    try {
      const hourlyResponse = await axios.get(`${CONFIG.SERVER_URL}/api/weather/forecast`, {
        params: { endpoint: forecastHourlyUrl },
        timeout: CONFIG.TIMEOUT
      });
      
      if (hourlyResponse.data?.properties?.periods) {
        hourlyForecast = hourlyResponse.data.properties.periods;
      }
    } catch (error) {
      console.warn('Could not fetch hourly forecast:', error.message);
      // Continue without hourly data
    }

    // Step 4: Get gridpoint data for detailed weather parameters
    let gridpointData = null;
    try {
      const gridpointResponse = await axios.get(`${CONFIG.SERVER_URL}/api/weather/gridpoints`, {
        params: { 
          office, 
          gridX: gridCoordinates.split(',')[0],
          gridY: gridCoordinates.split(',')[1]
        },
        timeout: CONFIG.TIMEOUT
      });
      
      if (gridpointResponse.data?.properties) {
        gridpointData = gridpointResponse.data.properties;
      }
    } catch (error) {
      console.warn('Could not fetch gridpoint data:', error.message);
      // Continue without gridpoint data
    }

    // Transform NWS forecast data to match app's expected format
    const periods = forecastResponse.data.properties.periods;
    const location = relativeLocation 
      ? `${relativeLocation.city}, ${relativeLocation.state}` 
      : "Unknown";
    
    // Create daily forecast from periods (NWS provides forecast periods that alternate day/night)
    const dailyForecasts = [];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      
      // Check if this is a daytime period
      if (!period.isDaytime && i > 0) continue;
      
      // Look for the corresponding night period
      const nightPeriod = periods[i + 1]?.isDaytime ? null : periods[i + 1];
      
      const date = new Date(period.startTime);
      const dayOfWeek = days[date.getDay()];
      
      // Extract additional data from gridpoint if available
      const additionalData = gridpointData ? {
        dewpoint: gridpointData.dewpoint?.values.find(v => 
          new Date(v.validTime.split('/')[0]).toDateString() === date.toDateString()
        )?.value,
        relativeHumidity: gridpointData.relativeHumidity?.values.find(v => 
          new Date(v.validTime.split('/')[0]).toDateString() === date.toDateString()
        )?.value,
        probabilityOfPrecipitation: gridpointData.probabilityOfPrecipitation?.values.find(v => 
          new Date(v.validTime.split('/')[0]).toDateString() === date.toDateString()
        )?.value,
        skyCover: gridpointData.skyCover?.values.find(v => 
          new Date(v.validTime.split('/')[0]).toDateString() === date.toDateString()
        )?.value,
        pressure: gridpointData.pressure?.values.find(v => 
          new Date(v.validTime.split('/')[0]).toDateString() === date.toDateString()
        )?.value
      } : {};
      
      dailyForecasts.push({
        id: `day-${i}`,
        day: period.name.includes('Night') ? period.name.replace(' Night', '') : period.name,
        fullDay: dayOfWeek,
        date: date.toLocaleDateString(),
        tempHigh: period.temperature,
        tempLow: nightPeriod ? nightPeriod.temperature : period.temperature - 10, // Fallback if no night data
        precipitation: { 
          chance: period.probabilityOfPrecipitation?.value || additionalData.probabilityOfPrecipitation || 0
        },
        uvIndex: 5, // NWS doesn't provide UV index directly
        wind: { 
          speed: parseWindSpeed(period.windSpeed), 
          direction: period.windDirection || 'N'
        },
        icon: getNWSIconType(period.icon, period.shortForecast),
        detailedForecast: period.detailedForecast,
        shortForecast: period.shortForecast,
        humidity: additionalData.relativeHumidity,
        dewpoint: additionalData.dewpoint,
        pressure: additionalData.pressure,
        skyCover: additionalData.skyCover
      });
      
      // Only take the first 7 days
      if (dailyForecasts.length >= 7) break;
    }

    // Transform hourly data
    const hourlyData = hourlyForecast.map(hour => ({
      id: `hour-${new Date(hour.startTime).getTime()}`,
      time: new Date(hour.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: hour.temperature,
      icon: getNWSIconType(hour.icon, hour.shortForecast),
      shortForecast: hour.shortForecast,
      windSpeed: parseWindSpeed(hour.windSpeed),
      windDirection: hour.windDirection,
      isDaytime: hour.isDaytime
    })).slice(0, 24); // Limit to next 24 hours
    
    return {
      daily: dailyForecasts,
      hourly: hourlyData,
      historical: [],
      historicalRanges: [],
      location: location,
      metadata: {
        office,
        gridX: gridCoordinates.split(',')[0],
        gridY: gridCoordinates.split(',')[1],
        timezone: forecastResponse.data.properties.timezone,
        updated: forecastResponse.data.properties.updated,
        county,
        observationStationsUrl,
        fireWeatherForecastUrl
      }
    };
  } catch (error) {
    if (error instanceof WeatherError) throw error;
    
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
 * Fetches alerts from National Weather Service
 * 
 * @param {string} location - Location coordinates "lat,lon"
 * @returns {Promise<Array>} - Array of weather alerts
 */
export async function fetchNWSAlerts(location) {
  if (!location || !location.includes(',')) {
    throw new WeatherError('Valid coordinates (lat,lon) are required for NWS API', 'INVALID_INPUT');
  }

  try {
    const [latitude, longitude] = location.split(',');
    
    // Get alerts for the area
    const alertsResponse = await axios.get(`${CONFIG.SERVER_URL}/api/weather/alerts`, {
      params: { 
        latitude,
        longitude,
        status: 'actual'
      },
      timeout: CONFIG.TIMEOUT
    });

    if (!alertsResponse.data || !alertsResponse.data.features) {
      return [];
    }

    // Transform alerts data to a simpler format
    return alertsResponse.data.features.map(alert => ({
      id: alert.properties.id,
      headline: alert.properties.headline,
      description: alert.properties.description,
      instruction: alert.properties.instruction,
      severity: alert.properties.severity,
      event: alert.properties.event,
      start: alert.properties.effective,
      end: alert.properties.ends || alert.properties.expires,
      status: alert.properties.status,
      messageType: alert.properties.messageType,
      category: alert.properties.category,
      urgency: alert.properties.urgency,
      certainty: alert.properties.certainty
    }));
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    // Return empty array rather than failing the entire app
    return [];
  }
}

/**
 * Fetches forecast discussion from National Weather Service
 * 
 * @param {string} office - NWS office code (e.g., 'LWX')
 * @returns {Promise<Object>} - Forecast discussion data
 */
export async function fetchNWSForecastDiscussion(office) {
  if (!office) {
    throw new WeatherError('Office code is required', 'INVALID_INPUT');
  }

  try {
    const response = await axios.get(`${CONFIG.SERVER_URL}/api/weather/discussion`, {
      params: { office },
      timeout: CONFIG.TIMEOUT
    });

    if (!response.data || !response.data.properties) {
      throw new WeatherError('Invalid response from NWS Discussion API', 'INVALID_RESPONSE');
    }

    return {
      text: response.data.properties.text,
      issuanceTime: response.data.properties.issuanceTime,
      productName: response.data.properties.productName
    };
  } catch (error) {
    if (error instanceof WeatherError) throw error;
    console.error('Failed to fetch forecast discussion:', error);
    throw new WeatherError('Failed to fetch forecast discussion', 'API_ERROR');
  }
}

/**
 * Fetches weather data from OpenWeather API
 * 
 * @param {string} location - Location name or coordinates
 * @returns {Promise<Object>} - Weather data object
 */
async function fetchOpenWeatherData(location) {
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
 * Fetches weather data from the configured API
 * 
 * @param {string} location - Location name or coordinates
 * @returns {Promise<Object>} - Weather data object
 */
export async function fetchRealWeatherData(location) {
  // Use the appropriate API based on configuration
  if (CONFIG.API_TYPE === 'nws') {
    return fetchNWSWeatherData(location);
  } else {
    return fetchOpenWeatherData(location);
  }
}

/**
 * Parses wind speed from NWS format
 * 
 * @param {string} windSpeed - Wind speed string from NWS (e.g., "5 to 10 mph")
 * @returns {number} - Average wind speed
 */
function parseWindSpeed(windSpeed) {
  if (!windSpeed) return 0;
  
  // Extract numbers from the string
  const matches = windSpeed.match(/\d+/g);
  if (!matches || matches.length === 0) return 0;
  
  // If range (e.g., "5 to 10 mph"), take average
  if (matches.length >= 2) {
    return (parseInt(matches[0]) + parseInt(matches[1])) / 2;
  }
  
  // Single number
  return parseInt(matches[0]);
}

/**
 * Maps NWS icon URL or short forecast to icon type for WeatherCard
 * 
 * @param {string} iconUrl - Icon URL from NWS API
 * @param {string} shortForecast - Short forecast text
 * @returns {string} - Icon type for WeatherCard
 */
function getNWSIconType(iconUrl, shortForecast) {
  if (!iconUrl && !shortForecast) return 'cloud';
  
  const forecast = shortForecast ? shortForecast.toLowerCase() : '';
  
  // Check the icon URL for clues
  if (iconUrl) {
    if (iconUrl.includes('rain') || iconUrl.includes('shower')) {
      return 'rain';
    } else if (iconUrl.includes('snow')) {
      return 'snow';
    } else if (iconUrl.includes('cloud')) {
      return 'cloud';
    } else if (iconUrl.includes('sun') || iconUrl.includes('clear')) {
      return 'sun';
    }
  }
  
  // Fallback to text description
  if (forecast.includes('rain') || forecast.includes('shower')) {
    return 'rain';
  } else if (forecast.includes('snow')) {
    return 'snow';
  } else if (forecast.includes('cloud')) {
    return 'cloud';
  } else if (forecast.includes('sun') || forecast.includes('clear')) {
    return 'sun';
  }
  
  // Default fallback
  return 'cloud';
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