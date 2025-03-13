import React from 'react';
import { Droplet, Thermometer, Sun, MapPin, RefreshCw, Navigation } from 'lucide-react';
import { convertTemp } from './weatherUtils';

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
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm p-4 mb-4 border border-gray-200/50 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="text-3xl font-bold text-gray-900">{convertTemp(dailyData[0].tempHigh, unit)}°{unit}</div>
        <div>
          <span className="text-sm text-gray-500">{dailyData[0].date} • {location}</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center text-sm">
              <Droplet size={14} className="text-blue-500 mr-1" />
              {dailyData[0].precipitation.chance}%
            </span>
            <span className="flex items-center text-sm">
              <Sun size={14} className="text-yellow-500 mr-1" />
              UV {dailyData[0].uvIndex}
            </span>
          </div>
        </div>
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
            onClick={() => document.getElementById('location-menu')?.classList.toggle('hidden')}
            aria-label="Change location"
            aria-expanded={!document.getElementById('location-menu')?.classList.contains('hidden')}
            aria-haspopup="true"
          >
            <MapPin size={14} className="mr-1 text-blue-500" />
            <span>Change</span>
          </button>
          
          <div id="location-menu" className="hidden absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-md border border-gray-200 p-1 z-10" role="menu">
            <button 
              onClick={handleGeolocation} 
              disabled={useGeolocation}
              className="w-full text-left px-3 py-1.5 text-sm flex items-center rounded-md hover:bg-blue-50"
              role="menuitem"
              aria-label="Use my location"
            >
              <Navigation size={14} className={`mr-1 text-blue-500 ${useGeolocation ? 'animate-spin' : ''}`} />
              <span>My Location</span>
            </button>
            
            {['Seattle', 'Portland', 'San Francisco', 'Los Angeles'].map(city => (
              <button 
                key={city}
                onClick={() => {
                  setLocation(city);
                  document.getElementById('location-menu')?.classList.add('hidden');
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

export default WeatherHeader;