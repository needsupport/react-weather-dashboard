import React, { useState, useEffect, useCallback, useMemo } from 'react';
import WeatherHeader from './WeatherHeader';
import WeatherCard from './WeatherCard';
import WeatherChart from './WeatherChart';
import { 
  generateForecastData, 
  generateHistoricalData, 
  generateHistoricalRanges,
  fetchRealWeatherData
} from './weatherDataUtils';

const WeatherDashboard = () => {
  const [metrics, setMetrics] = useState({
    temperature: true, 
    precipitation: true, 
    uvIndex: true, 
    wind: true
  });
  const [viewMode, setViewMode] = useState('7-Day');
  const [location, setLocation] = useState('');
  const [geolocationError, setGeolocationError] = useState(null);

  const [weatherData, setWeatherData] = useState({
    daily: [],
    hourly: [],
    historical: [],
    historicalRanges: []
  });

  const [uiState, setUiState] = useState({
    isLoading: true,
    isRefreshing: false,
    selectedDay: null,
    showDetails: false,
    error: null
  });

  const [preferences, setPreferences] = useState({
    unit: 'F',
    showHistoricalRange: true,
    showAnomalies: true,
    showHistoricalAvg: true
  });

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        const data = await fetchRealWeatherData(location);
        if (isMounted) {
          setWeatherData(data);
          setUiState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        if (isMounted) {
          setUiState(prev => ({
            ...prev, 
            error: error.message,
            isLoading: false
          }));
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [location]);

  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeolocationError('Geolocation not supported');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setGeolocationError('Geolocation request timed out');
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude},${longitude}`);
        setGeolocationError(null);
      },
      (error) => {
        clearTimeout(timeoutId);
        setGeolocationError(`Geolocation error: ${error.message}`);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 5000, 
        maximumAge: 0 
      }
    );
  }, []);

  const toggleMetric = (metric) => {
    setMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  return (
    <div className="weather-dashboard">
      {uiState.error && (
        <div className="error-message">
          {uiState.error}
          <button onClick={() => setUiState(prev => ({ ...prev, error: null }))}>Dismiss</button>
        </div>
      )}

      {uiState.isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <WeatherHeader 
            location={location}
            onGeolocationRequest={handleGeolocation}
            geolocationError={geolocationError}
          />
          <WeatherChart 
            data={weatherData.daily}
            metrics={metrics}
          />
        </>
      )}
    </div>
  );
};

export default WeatherDashboard;