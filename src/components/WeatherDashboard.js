import React, { useReducer, useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import WeatherHeader from './WeatherHeader';
import WeatherCard from './WeatherCard';
import WeatherChart from './WeatherChart';
import ForecastDiscussion from './ForecastDiscussion';
import ConfigurationPanel from './ConfigurationPanel';
import { Settings, MapPin } from 'lucide-react';
import { 
  fetchRealWeatherData,
  getServerConfig
} from './weatherDataUtils';

/**
 * Initial state for the reducer
 */
const initialState = {
  metrics: { 
    temperature: true, 
    precipitation: true, 
    uvIndex: true, 
    wind: true 
  },
  viewMode: '7-Day',
  location: {
    display: 'Seattle, WA', // Human-readable location
    coords: '47.6062,-122.3321' // Lat,lon for NWS API
  },
  geolocationError: null,
  weatherData: {
    daily: [],
    hourly: [],
    historical: [],
    historicalRanges: [],
    metadata: null
  },
  ui: { 
    isLoading: true,
    isRefreshing: false,
    selectedDay: null,
    showDetails: false,
    error: null,
    showConfigPanel: false
  },
  preferences: { 
    unit: 'F',
    showHistoricalRange: true,
    showAnomalies: true,
    showHistoricalAvg: true
  },
  config: {
    isConfigured: false,
    serverUrl: 'http://localhost:3001',
    apiUrl: 'https://api.weather.gov',
    apiType: 'nws'
  }
};

/**
 * Reducer function for managing weather dashboard state
 * 
 * @param {Object} state - Current state
 * @param {Object} action - Action to perform
 * @returns {Object} - New state
 */
function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'SET_WEATHER_DATA':
      return { ...state, weatherData: action.payload };
    case 'SET_UI_STATE':
      return { ...state, ui: { ...state.ui, ...action.payload } };
    case 'SET_GEOLOCATION_ERROR':
      return { ...state, geolocationError: action.payload };
    case 'TOGGLE_METRIC':
      return { 
        ...state, 
        metrics: { 
          ...state.metrics, 
          [action.payload]: !state.metrics[action.payload] 
        } 
      };
    case 'SET_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_SELECTED_DAY':
      return { 
        ...state, 
        ui: { 
          ...state.ui, 
          selectedDay: action.payload,
          showDetails: action.payload !== null
        } 
      };
    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    default:
      return state;
  }
}

/**
 * Common city coordinates for quick selection
 */
const CITY_COORDINATES = {
  'Seattle, WA': '47.6062,-122.3321',
  'Portland, OR': '45.5152,-122.6784',
  'San Francisco, CA': '37.7749,-122.4194',
  'Los Angeles, CA': '34.0522,-118.2437',
  'New York, NY': '40.7128,-74.0060',
  'Chicago, IL': '41.8781,-87.6298',
  'Miami, FL': '25.7617,-80.1918',
  'Denver, CO': '39.7392,-104.9903'
};

/**
 * WeatherDashboard - Main component for displaying weather information
 * 
 * @component
 * @returns {JSX.Element}
 */
const WeatherDashboard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const { 
    metrics, 
    location, 
    geolocationError, 
    weatherData, 
    ui, 
    preferences,
    viewMode,
    config
  } = state;

  // Check server configuration on mount
  useEffect(() => {
    const checkServerConfig = async () => {
      try {
        const serverConfig = await getServerConfig();
        dispatch({ 
          type: 'SET_CONFIG', 
          payload: { 
            isConfigured: true,
            apiUrl: serverConfig.apiUrl,
            apiType: serverConfig.apiType
          } 
        });
      } catch (error) {
        console.warn('Could not get server config:', error);
        // Show configuration panel if server is not reachable
        dispatch({ 
          type: 'SET_UI_STATE', 
          payload: { showConfigPanel: true } 
        });
      }
    };
    
    checkServerConfig();
  }, []);

  // Fetch weather data when location changes
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      if (!isMounted) return;
      
      // Show loading state
      dispatch({ 
        type: 'SET_UI_STATE', 
        payload: { isLoading: true, error: null } 
      });
      
      try {
        // For NWS API, we need to use coordinates
        const locationParam = config.apiType === 'nws' ? location.coords : location.display;
        const data = await fetchRealWeatherData(locationParam);
        
        // If the API returns a location, update the display name
        if (data.location) {
          dispatch({ 
            type: 'SET_LOCATION', 
            payload: { ...location, display: data.location } 
          });
        }
        
        if (isMounted) {
          dispatch({ type: 'SET_WEATHER_DATA', payload: data });
          dispatch({ 
            type: 'SET_UI_STATE', 
            payload: { isLoading: false } 
          });
        }
      } catch (error) {
        if (isMounted) {
          dispatch({ 
            type: 'SET_UI_STATE', 
            payload: {
              error: error.message,
              isLoading: false
            }
          });
        }
      }
    };

    // Only fetch if configured
    if (config.isConfigured) {
      fetchData();
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [location.coords, config.isConfigured, config.apiType]);

  /**
   * Handles geolocation request
   */
  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      dispatch({ 
        type: 'SET_GEOLOCATION_ERROR', 
        payload: 'Geolocation not supported' 
      });
      return;
    }

    // Show refreshing state
    dispatch({ 
      type: 'SET_UI_STATE', 
      payload: { isRefreshing: true } 
    });

    const GEOLOCATION_TIMEOUT = 10000; // 10 seconds
    const timeoutId = setTimeout(() => {
      dispatch({ 
        type: 'SET_GEOLOCATION_ERROR', 
        payload: 'Geolocation request timed out' 
      });
      dispatch({ 
        type: 'SET_UI_STATE', 
        payload: { isRefreshing: false } 
      });
    }, GEOLOCATION_TIMEOUT);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        const coords = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        dispatch({ 
          type: 'SET_LOCATION', 
          payload: { 
            coords: coords,
            display: 'Your Location'
          }
        });
        dispatch({ 
          type: 'SET_GEOLOCATION_ERROR', 
          payload: null 
        });
        dispatch({ 
          type: 'SET_UI_STATE', 
          payload: { isRefreshing: false } 
        });
        setShowLocationSelector(false);
      },
      (error) => {
        clearTimeout(timeoutId);
        dispatch({ 
          type: 'SET_GEOLOCATION_ERROR', 
          payload: `Geolocation error: ${error.message}` 
        });
        dispatch({ 
          type: 'SET_UI_STATE', 
          payload: { isRefreshing: false } 
        });
      },
      { 
        enableHighAccuracy: true, 
        timeout: 5000, 
        maximumAge: 0 
      }
    );
  }, []);

  /**
   * Toggles a metric display
   * 
   * @param {string} metric - Metric name to toggle
   */
  const toggleMetric = useCallback((metric) => {
    dispatch({ type: 'TOGGLE_METRIC', payload: metric });
  }, []);

  /**
   * Sets the temperature unit
   * 
   * @param {string} unit - Temperature unit ('F' or 'C')
   */
  const setUnit = useCallback((unit) => {
    dispatch({ 
      type: 'SET_PREFERENCES', 
      payload: { unit } 
    });
  }, []);

  /**
   * Sets the currently selected day
   * 
   * @param {string} dayId - ID of the day to select
   */
  const setSelectedDay = useCallback((dayId) => {
    dispatch({ type: 'SET_SELECTED_DAY', payload: dayId });
  }, []);

  /**
   * Toggles detail view visibility
   * 
   * @param {boolean} show - Whether to show details
   */
  const setShowDetails = useCallback((show) => {
    dispatch({ 
      type: 'SET_UI_STATE', 
      payload: { showDetails: show } 
    });
  }, []);

  /**
   * Changes the location
   * 
   * @param {string} cityName - Display name of the city
   * @param {string} coords - Coordinates of the city
   */
  const setLocation = useCallback((cityName, coords) => {
    dispatch({ 
      type: 'SET_LOCATION', 
      payload: { 
        display: cityName,
        coords: coords || CITY_COORDINATES[cityName] || cityName
      } 
    });
    setShowLocationSelector(false);
  }, []);

  /**
   * Refreshes the weather data
   */
  const handleRefresh = useCallback(() => {
    dispatch({ 
      type: 'SET_UI_STATE', 
      payload: { isRefreshing: true } 
    });
    
    // Re-fetch data for current location
    const locationParam = config.apiType === 'nws' ? location.coords : location.display;
    
    fetchRealWeatherData(locationParam)
      .then(data => {
        // If the API returns a location, update the display name
        if (data.location) {
          dispatch({ 
            type: 'SET_LOCATION', 
            payload: { ...location, display: data.location } 
          });
        }
        
        dispatch({ type: 'SET_WEATHER_DATA', payload: data });
        dispatch({ 
          type: 'SET_UI_STATE', 
          payload: { isRefreshing: false, error: null } 
        });
      })
      .catch(error => {
        dispatch({ 
          type: 'SET_UI_STATE', 
          payload: { 
            isRefreshing: false,
            error: error.message
          } 
        });
      });
  }, [location, config.apiType]);

  /**
   * Shows the configuration panel
   */
  const showConfigPanel = useCallback(() => {
    dispatch({ 
      type: 'SET_UI_STATE', 
      payload: { showConfigPanel: true } 
    });
  }, []);

  /**
   * Handles configuration save
   */
  const handleConfigSaved = useCallback((newConfig) => {
    dispatch({ 
      type: 'SET_CONFIG', 
      payload: newConfig 
    });
    dispatch({ 
      type: 'SET_UI_STATE', 
      payload: { showConfigPanel: false } 
    });
    // Trigger a data refresh
    if (newConfig.isConfigured) {
      handleRefresh();
    }
  }, [handleRefresh]);

  return (
    <div className="weather-dashboard p-4 max-w-6xl mx-auto">
      {ui.error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{ui.error}</span>
          <button 
            onClick={() => dispatch({ 
              type: 'SET_UI_STATE', 
              payload: { error: null } 
            })}
            className="bg-transparent text-red-700 font-semibold py-1 px-2 border border-red-500 rounded hover:bg-red-500 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {!config.isConfigured && !ui.showConfigPanel && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>Weather API is not configured. Please click the button to set it up.</span>
          <button 
            onClick={showConfigPanel}
            className="bg-yellow-200 text-yellow-800 font-semibold py-1 px-4 border border-yellow-500 rounded hover:bg-yellow-300 flex items-center"
          >
            <Settings size={16} className="mr-2" />
            Configure API
          </button>
        </div>
      )}

      <ConfigurationPanel 
        isVisible={ui.showConfigPanel}
        onClose={() => dispatch({ 
          type: 'SET_UI_STATE', 
          payload: { showConfigPanel: false } 
        })}
        onConfigSaved={handleConfigSaved}
      />

      {ui.isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading weather data...</span>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Weather Dashboard</h1>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowLocationSelector(!showLocationSelector)}
                  className="bg-gray-100 text-gray-700 font-semibold py-1 px-3 border border-gray-300 rounded hover:bg-gray-200 flex items-center"
                >
                  <MapPin size={16} className="mr-2" />
                  {location.display}
                </button>
                
                {showLocationSelector && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-md border border-gray-200 p-1 z-10">
                    <button 
                      onClick={handleGeolocation}
                      className="w-full text-left px-3 py-1.5 text-sm flex items-center rounded-md hover:bg-blue-50"
                    >
                      <MapPin size={14} className="mr-1 text-blue-500" />
                      My Location
                    </button>
                    <div className="my-1 border-t border-gray-100"></div>
                    {Object.keys(CITY_COORDINATES).map((city) => (
                      <button 
                        key={city}
                        onClick={() => setLocation(city, CITY_COORDINATES[city])}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-blue-50 ${location.display === city ? 'font-medium text-blue-600' : ''}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={showConfigPanel}
                className="bg-gray-100 text-gray-700 font-semibold py-1 px-3 border border-gray-300 rounded hover:bg-gray-200 flex items-center"
              >
                <Settings size={16} className="mr-2" />
                Settings
              </button>
            </div>
          </div>

          <WeatherHeader 
            dailyData={weatherData.daily}
            location={location.display}
            unit={preferences.unit}
            handleRefresh={handleRefresh}
            handleGeolocation={handleGeolocation}
            isRefreshing={ui.isRefreshing}
            setLocation={setLocation}
            setUnit={setUnit}
            useGeolocation={Boolean(geolocationError)}
            apiType={config.apiType}
          />
          
          <div className="my-6">
            <WeatherChart 
              data={weatherData.daily}
              metrics={metrics}
            />
          </div>
          
          {weatherData.daily && weatherData.daily.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mt-6">
              {weatherData.daily.map(day => (
                <WeatherCard
                  key={day.id}
                  day={day}
                  historicalRange={weatherData.historicalRanges.find(hr => hr.dayId === day.id)}
                  selectedDay={ui.selectedDay}
                  setSelectedDay={setSelectedDay}
                  setShowDetails={setShowDetails}
                  unit={preferences.unit}
                  metrics={metrics}
                />
              ))}
            </div>
          ) : config.isConfigured ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">No weather data available. Try refreshing or changing location.</p>
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">Please configure the Weather API to view weather data.</p>
              <button 
                onClick={showConfigPanel}
                className="mt-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600"
              >
                Configure API
              </button>
            </div>
          )}
          
          {/* Add Forecast Discussion component if using NWS API and metadata exists */}
          {config.apiType === 'nws' && weatherData.metadata && weatherData.metadata.office && (
            <ForecastDiscussion office={weatherData.metadata.office} />
          )}
        </>
      )}
    </div>
  );
};

export default WeatherDashboard;