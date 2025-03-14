import React from 'react';
import { Droplet, Sun, Wind, Cloud } from 'lucide-react';
import { convertTemp } from './weatherUtils';
import PropTypes from 'prop-types';

/**
 * WeatherCard - Displays weather information for a specific day
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.day - Weather data for the specific day
 * @param {string} props.day.id - Unique identifier for the day
 * @param {string} props.day.day - Name of the day (e.g., "Monday")
 * @param {string} props.day.date - Formatted date string
 * @param {number} props.day.tempHigh - High temperature for the day
 * @param {number} props.day.tempLow - Low temperature for the day
 * @param {Object} props.day.precipitation - Precipitation data
 * @param {number} props.day.precipitation.chance - Chance of precipitation (0-100)
 * @param {number} props.day.uvIndex - UV index value
 * @param {Object} props.day.wind - Wind data
 * @param {number} props.day.wind.speed - Wind speed
 * @param {string} props.day.wind.direction - Wind direction
 * @param {string} props.day.icon - Weather icon type ("sun", "rain", "cloud", "snow")
 * @param {Object|null} props.historicalRange - Historical weather data for comparison
 * @param {string|number} props.selectedDay - Currently selected day ID
 * @param {Function} props.setSelectedDay - Function to select a day
 * @param {Function} props.setShowDetails - Function to toggle detail view
 * @param {'C'|'F'} props.unit - Temperature unit
 * @param {Object} props.metrics - Which metrics to display
 * @returns {JSX.Element}
 */
const WeatherCard = ({ 
  day, 
  historicalRange, 
  selectedDay, 
  setSelectedDay, 
  setShowDetails,
  unit,
  metrics
}) => {
  /**
   * Renders the appropriate weather icon based on icon type
   * 
   * @param {string} iconType - Type of weather icon to render
   * @param {number} size - Size of the icon in pixels
   * @returns {JSX.Element|null} The rendered icon component
   */
  const renderWeatherIcon = (iconType, size = 24) => {
    if (!iconType) return null;
    
    // Map icon types to colors
    const iconColors = {
      'sun': '#FBBF24',  // Yellow
      'rain': '#3B82F6', // Blue
      'snow': '#E5E7EB', // Light gray
      'cloud': '#9CA3AF', // Medium gray
      'default': '#6B7280' // Dark gray
    };
    
    const color = iconColors[iconType] || iconColors.default;
    
    // Map icon types to components
    switch (iconType) {
      case 'rain':
        return <Droplet size={size} style={{ color }} aria-label="Rain" />;
      case 'sun':
        return <Sun size={size} style={{ color }} aria-label="Sunny" />;
      case 'cloud':
        return <Cloud size={size} style={{ color }} aria-label="Cloudy" />;
      case 'snow':
        return <Droplet size={size} style={{ color }} aria-label="Snow" />;
      default:
        return <Cloud size={size} style={{ color: iconColors.default }} aria-label="Weather" />;
    }
  };

  // Safely access nested properties
  const precipChance = day?.precipitation?.chance || 0;
  const windDirection = day?.wind?.direction || '';
  const windSpeed = day?.wind?.speed || 0;

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm p-3 border ${selectedDay === day.id ? 'border-blue-400' : 'border-gray-200'} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => {setSelectedDay(day.id); setShowDetails(true);}}
      role="button"
      aria-label={`View details for ${day.day}`}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-gray-900">{day.day.substring(0, 3)}</p>
        <span className="text-xs text-gray-500">{day.date}</span>
      </div>
      <div className="flex items-center justify-center py-2">
        {renderWeatherIcon(day.icon, 36)}
      </div>
      <p className="text-center font-bold">{convertTemp(day.tempHigh, unit)}°{unit}</p>
      <p className="text-center text-xs text-gray-500">{convertTemp(day.tempLow, unit)}°{unit}</p>
      <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
        <span className="flex items-center">
          <Droplet size={10} className="text-blue-500 mr-1" />
          {precipChance}%
        </span>
        <span className="flex items-center">
          <Sun size={10} className="text-yellow-500 mr-1" />
          {day.uvIndex}
        </span>
      </div>
      {metrics.wind && (
        <div className="flex items-center mt-1 text-xs text-gray-600">
          <Wind size={10} className="text-green-500 mr-1" />
          <span>{windDirection} {unit === 'C' ? Math.round(windSpeed * 1.60934) : windSpeed} {unit === 'C' ? 'km/h' : 'mph'}</span>
        </div>
      )}
      {historicalRange?.anomalies?.temp && (
        <div className={`mt-1 text-xs font-medium text-center ${
          historicalRange.anomalies.tempType === 'hot' ? 'text-red-500' : 'text-blue-500'
        }`}>
          {historicalRange.anomalies.tempType === 'hot' ? '↑ Unusually warm' : '↓ Unusually cool'}
        </div>
      )}
    </div>
  );
};

WeatherCard.propTypes = {
  day: PropTypes.shape({
    id: PropTypes.string.isRequired,
    day: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    tempHigh: PropTypes.number.isRequired,
    tempLow: PropTypes.number.isRequired,
    precipitation: PropTypes.shape({
      chance: PropTypes.number
    }),
    uvIndex: PropTypes.number,
    wind: PropTypes.shape({
      speed: PropTypes.number,
      direction: PropTypes.string
    }),
    icon: PropTypes.string
  }).isRequired,
  historicalRange: PropTypes.object,
  selectedDay: PropTypes.string,
  setSelectedDay: PropTypes.func.isRequired,
  setShowDetails: PropTypes.func.isRequired,
  unit: PropTypes.oneOf(['C', 'F']).isRequired,
  metrics: PropTypes.shape({
    temperature: PropTypes.bool,
    precipitation: PropTypes.bool,
    uvIndex: PropTypes.bool,
    wind: PropTypes.bool
  })
};

WeatherCard.defaultProps = {
  selectedDay: null,
  historicalRange: null,
  metrics: {
    temperature: true,
    precipitation: true,
    uvIndex: true,
    wind: true
  }
};

export default React.memo(WeatherCard);