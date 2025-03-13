import React, { useState, useEffect } from 'react';
import WeatherHeader from './WeatherHeader';
import WeatherCard from './WeatherCard';
import WeatherChart from './WeatherChart';
import { generateForecastData, generateHistoricalData, generateHistoricalRanges } from './weatherDataUtils';

// CSS variables for consistent theming
const cssVars = `
  :root {
    --color-sunny: #FBBF24;
    --color-rainy: #3B82F6;
    --color-cloudy: #6B7280;
    --color-bg-light: #F3F4F6;
    --color-text-dark: #1F2937;
    --color-text-light: #6B7280;
    --border-radius: 0.75rem;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

const WeatherDashboard = () => {
  // State variables
  const [metrics, setMetrics] = useState({ temperature: true, precipitation: true, uvIndex: true, wind: true });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('7-Day');
  const [location, setLocation] = useState('Seattle');
  const [dailyData, setDailyData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [historicalRanges, setHistoricalRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const [showHistoricalRange, setShowHistoricalRange] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [showHistoricalAvg, setShowHistoricalAvg] = useState(true);
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  const [unit, setUnit] = useState('F');
  const [error, setError] = useState(null);

  // Get data from local storage on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('weatherPrefs');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.metrics) setMetrics(prefs.metrics);
        if (prefs.viewMode) setViewMode(prefs.viewMode);
      } catch (error) {
        console.error("Error loading saved preferences:", error);
      }
    }
  }, []);

  // Load forecast data
  const loadForecastData = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const dailyForecast = generateForecastData(location, '7-Day');
        const hourlyForecast = generateForecastData(location, 'Hourly');
        const historical = generateHistoricalData(location);
        const ranges = generateHistoricalRanges(location, dailyForecast);
        
        setDailyData(dailyForecast);
        setHourlyData(hourlyForecast);
        setHistoricalData(historical);
        setHistoricalRanges(ranges);
        setIsLoading(false);
        setIsRefreshing(false);
      } catch (err) {
        console.error("Error loading forecast data:", err);
        setError("Failed to load weather data. Please try again.");
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }, 500);
  };

  // Add a refresh timer to update the weather data every hour
  useEffect(() => {
    // Initial load
    loadForecastData();
    
    // Set up a timer to refresh every hour
    const refreshTimer = setInterval(() => {
      loadForecastData();
    }, 60 * 60 * 1000); // 1 hour in milliseconds
    
    // Clean up the timer on component unmount
    return () => clearInterval(refreshTimer);
  }, [location]);
  
  // Handlers
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadForecastData();
  };

  const handleGeolocation = () => {
    setUseGeolocation(true);
    setTimeout(() => {
      setLocation('San Francisco'); // Simulated geolocation
      setUseGeolocation(false);
    }, 1000);
  };

  const handleChartClick = (data) => {
    try {
      if (data && data.activePayload && data.activePayload.length) {
        const clickedData = data.activePayload[0].payload;
        if (clickedData && clickedData.id) {
          setSelectedDay(clickedData.id);
          setShowDetails(true);
        }
      }
    } catch (error) {
      console.error("Error handling chart click:", error);
    }
  };

  const toggleMetric = (metric) => setMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  
  // Determine which dataset to use based on viewMode
  const currentData = viewMode === '7-Day' ? dailyData : 
                     viewMode === 'Hourly' ? hourlyData : 
                     historicalData;
                     
  const selectedForecast = selectedDay ? 
    (viewMode === 'Historical' ? 
      currentData.find(item => item.year === parseInt(selectedDay)) : 
      currentData.find(item => item.id === selectedDay)
    ) : null;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-['SF Pro Text',_-apple-system,_sans-serif] text-gray-900">
      <style>{cssVars}</style>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        
        {/* Header with Current Weather and Location Controls */}
        {!isLoading && dailyData.length > 0 && (
          <WeatherHeader 
            dailyData={dailyData}
            location={location}
            unit={unit}
            handleRefresh={handleRefresh}
            handleGeolocation={handleGeolocation}
            isRefreshing={isRefreshing}
            setLocation={setLocation}
            setUnit={setUnit}
            useGeolocation={useGeolocation}
          />
        )}

        {error ? (
          <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
            <p className="text-red-700 mb-3">{error}</p>
            <button 
              onClick={loadForecastData} 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              aria-label="Retry loading weather data"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-md">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading forecast for {location}...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Summary Cards */}
            {viewMode === '7-Day' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 overflow-x-auto pb-2">
                {dailyData.map((day, index) => (
                  <WeatherCard 
                    key={day.id}
                    day={day}
                    historicalRange={historicalRanges[index]}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    setShowDetails={setShowDetails}
                    unit={unit}
                    metrics={metrics}
                  />
                ))}
              </div>
            )}
            
            {/* Weather Chart */}
            <WeatherChart 
              viewMode={viewMode}
              currentData={currentData}
              metrics={metrics}
              historicalRanges={historicalRanges}
              showHistoricalRange={showHistoricalRange}
              showHistoricalAvg={showHistoricalAvg}
              showAnomalies={showAnomalies}
              selectedDate={selectedDate}
              handleChartClick={handleChartClick}
            />
            
            {/* View Controls */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">View Controls</h3>
                <button 
                  onClick={() => setOptionsExpanded(!optionsExpanded)}
                  className="text-blue-600 text-sm flex items-center"
                >
                  {optionsExpanded ? 'Hide options' : 'Show all options'}
                </button>
              </div>
              
              {/* View Mode Selection */}
              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-2">View Mode</h4>
                <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner mb-2">
                  <button 
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "7-Day" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-200"}`}
                    onClick={() => {setViewMode("7-Day"); setShowDetails(false);}}
                  >
                    7-Day
                  </button>
                  <button 
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "Hourly" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-200"}`}
                    onClick={() => {setViewMode("Hourly"); setShowDetails(false);}}
                  >
                    Hourly
                  </button>
                  <button 
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "Historical" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-200"}`}
                    onClick={() => {setViewMode("Historical"); setShowDetails(false);}}
                  >
                    Historical
                  </button>
                </div>
              </div>
              
              {/* Display Options */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Display Options</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries({
                    showHistoricalRange: "Show historical ranges",
                    showHistoricalAvg: "Show historical averages",
                    showAnomalies: "Highlight anomalies"
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between text-sm hover:bg-gray-100 p-2 rounded-lg cursor-pointer">
                      <span className="text-gray-800">{label}</span>
                      <input 
                        type="checkbox" 
                        checked={key === "showHistoricalRange" ? showHistoricalRange : 
                                key === "showHistoricalAvg" ? showHistoricalAvg : 
                                showAnomalies} 
                        onChange={() => {
                          if (key === "showHistoricalRange") setShowHistoricalRange(!showHistoricalRange);
                          else if (key === "showHistoricalAvg") setShowHistoricalAvg(!showHistoricalAvg);
                          else setShowAnomalies(!showAnomalies);
                        }}
                        className="h-4 w-4 text-blue-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Metrics Selection */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Metrics</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries({
                    temperature: "Temperature",
                    precipitation: "Precipitation",
                    uvIndex: "UV Index",
                    wind: "Wind Speed"
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between text-sm hover:bg-gray-100 p-2 rounded-lg cursor-pointer">
                      <span className="text-gray-800">{label}</span>
                      <input 
                        type="checkbox" 
                        checked={metrics[key]} 
                        onChange={() => toggleMetric(key)}
                        className="h-4 w-4 text-blue-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;