import React from 'react';
import { Droplet, Sun, Wind } from 'lucide-react';
import { convertTemp } from './weatherUtils';

const WeatherCard = ({ 
  day, 
  historicalRange, 
  selectedDay, 
  setSelectedDay, 
  setShowDetails,
  unit,
  metrics
}) => {
  const renderWeatherIcon = (iconType, size = 24) => {
    if (!iconType) return null;
    
    const color = iconType === 'sun' ? '#FBBF24' : 
                  iconType === 'rain' ? '#3B82F6' : 
                  '#6B7280';
                  
    return iconType === 'rain' ? <Droplet size={size} style={{ color }} aria-label="Rain" /> :
           iconType === 'sun' ? <Sun size={size} style={{ color }} aria-label="Sunny" /> :
           <Droplet size={size} style={{ color }} aria-label="Drizzle" />;
  };

  return (
    <div 
      key={day.id} 
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
          {day.precipitation.chance}%
        </span>
        <span className="flex items-center">
          <Sun size={10} className="text-yellow-500 mr-1" />
          {day.uvIndex}
        </span>
      </div>
      {metrics.wind && (
        <div className="flex items-center mt-1 text-xs text-gray-600">
          <Wind size={10} className="text-green-500 mr-1" />
          <span>{day.wind.direction} {unit === 'C' ? Math.round(day.wind.speed * 1.60934) : day.wind.speed} {unit === 'C' ? 'km/h' : 'mph'}</span>
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

export default WeatherCard;