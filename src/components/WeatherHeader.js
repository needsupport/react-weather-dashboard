import React, { useState, useRef, useEffect } from 'react';
import { Droplet, Thermometer, Sun, MapPin, RefreshCw, Navigation } from 'lucide-react';
import { convertTemp } from './weatherUtils';
import PropTypes from 'prop-types';

/**
 * WeatherHeader - Displays current weather information and controls
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.dailyData - Array of weather data objects
 * @param {string} props.location - Current location name
 * @param {string} props.unit - Temperature unit ('F' or 'C')
 * @param {Function} props.handleRefresh - Function to refresh weather data
 * @param {Function} props.handleGeolocation - Function to use device geolocation
 * @param {boolean} props.isRefreshing - Indicates if refresh is in progress
 * @param {Function} props.setLocation - Function to update location
 * @param {Function} props.setUnit - Function to update temperature unit
 * @param {boolean} props.useGeolocation - Indicates if geolocation is in use
 * @param {string} props.apiType - Type of API being used ('nws' or 'openweather')
 * @returns {JSX.Element}
 */
const WeatherHeader = ({ 
  dailyData, 
  location, 
  unit, 
  handleRefresh, 
  handleGeolocation, 
  isRefreshing, 
  setLocation, 
  setUnit, 
  useGeolocation,
  apiType
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsMenuOpen(false);
    } else if (e.key === 'ArrowDown' && isMenuOpen && menuRef.current) {
      e.preventDefault();
      const firstItem = menuRef.current.querySelector('button');
      if (firstItem) firstItem.focus();
    }
  };

  // Safely access nested properties with optional chaining
  const currentDay = dailyData && dailyData.length > 0 ? dailyData[0] : null;

  const getDetailedForecast = () => {
    if (!currentDay || !currentDay.detailedForecast) return null;
    return currentDay.detailedForecast;
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm p-4 mb-4 border border-gray-200/50">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {currentDay && (
            <>
              <div className="text-3xl font-bold text-gray-900">{convertTemp(currentDay.tempHigh, unit)}°{unit}</div>
              <div>
                <span className="text-sm text-gray-500">{currentDay.date} • {location}</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center text-sm">
                    <Droplet size={14} className="text-blue-500 mr-1" />
                    {currentDay.precipitation?.chance || 0}%
                  </span>
                  <span className="flex items-center text-sm">
                    <Sun size={14} className="text-yellow-500 mr-1" />
                    UV {currentDay.uvIndex || 0}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white/90 border border-gray-200 hover:bg-gray-50"
            aria-label="Refresh weather data"
          >
            <RefreshCw size={16} className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setUnit(unit === 'F' ? 'C' : 'F')}
            className="px-3 py-1.5 rounded-lg bg-white/90 border border-gray-200 text-sm flex items-center hover:bg-gray-50"
            aria-label={`Switch to ${unit === 'F' ? 'Celsius' : 'Fahrenheit'}`}
          >
            <Thermometer size={14} className="mr-1 text-red-500" />
            °{unit === 'F' ? 'C' : 'F'}
          </button>
        </div>
      </div>
      
      {/* Display NWS detailed forecast if available */}
      {apiType === 'nws' && getDetailedForecast() && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-gray-700">
          <h3 className="font-semibold mb-1 text-blue-800">Today's Forecast</h3>
          <p>{getDetailedForecast()}</p>
        </div>
      )}
    </div>
  );
};

WeatherHeader.propTypes = {
  dailyData: PropTypes.array,
  location: PropTypes.string.isRequired,
  unit: PropTypes.oneOf(['F', 'C']).isRequired,
  handleRefresh: PropTypes.func.isRequired,
  handleGeolocation: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool,
  setLocation: PropTypes.func.isRequired,
  setUnit: PropTypes.func.isRequired,
  useGeolocation: PropTypes.bool,
  apiType: PropTypes.oneOf(['nws', 'openweather'])
};

WeatherHeader.defaultProps = {
  dailyData: [],
  isRefreshing: false,
  useGeolocation: false,
  apiType: 'nws'
};

export default WeatherHeader;