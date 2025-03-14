import React, { useState, useRef } from 'react';
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
  useGeolocation 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
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

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm p-4 mb-4 border border-gray-200/50 flex justify-between items-center">
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
        
        <div className="relative">
          <button 
            className="px-3 py-1.5 rounded-lg bg-white/90 border border-gray-200 text-sm flex items-center hover:bg-gray-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onKeyDown={handleKeyDown}
            aria-label="Change location"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <MapPin size={14} className="mr-1 text-blue-500" />
            <span>Change</span>
          </button>
          
          <div 
            ref={menuRef}
            className={`${isMenuOpen ? '' : 'hidden'} absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-md border border-gray-200 p-1 z-10`} 
            role="menu"
          >
            <button 
              onClick={() => {
                handleGeolocation();
                setIsMenuOpen(false);
              }}
              disabled={useGeolocation}
              className="w-full text-left px-3 py-1.5 text-sm flex items-center rounded-md hover:bg-blue-50"
              role="menuitem"
              aria-label="Use my location"
            >
              <Navigation size={14} className={`mr-1 text-blue-500 ${useGeolocation ? 'animate-spin' : ''}`} />
              <span>My Location</span>
            </button>
            
            {['Seattle', 'Portland', 'San Francisco', 'Los Angeles'].map((city, index) => (
              <button 
                key={city}
                onClick={() => {
                  setLocation(city);
                  setIsMenuOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextItem = menuRef.current.querySelectorAll('button')[index + 1];
                    if (nextItem) nextItem.focus();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevItem = menuRef.current.querySelectorAll('button')[index - 1];
                    if (prevItem) prevItem.focus();
                  }
                }}
                className={`w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-blue-50 ${location === city ? 'font-medium text-blue-600' : ''}`}
                role="menuitem"
                aria-label={`Set location to ${city}`}
                aria-current={location === city ? 'location' : undefined}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
        
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
  useGeolocation: PropTypes.bool
};

WeatherHeader.defaultProps = {
  dailyData: [],
  isRefreshing: false,
  useGeolocation: false
};

export default WeatherHeader;