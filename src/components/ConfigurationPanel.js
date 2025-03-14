import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Settings, Save, RefreshCw, Server } from 'lucide-react';
import { configureServerApi, getServerConfig, updateConfig } from './weatherDataUtils';

/**
 * ConfigurationPanel component for Weather API configuration
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onConfigSaved - Callback when configuration is saved
 * @param {boolean} props.isVisible - Whether the panel is visible
 * @param {Function} props.onClose - Callback to close the panel
 */
const ConfigurationPanel = ({ onConfigSaved, isVisible, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiType, setApiType] = useState('nws'); // Default to NWS
  const [apiUrl, setApiUrl] = useState('https://api.weather.gov');
  const [serverUrl, setServerUrl] = useState('http://localhost:3001');
  const [cacheDuration, setCacheDuration] = useState('10 minutes');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Load current configuration on mount
  useEffect(() => {
    if (isVisible) {
      fetchCurrentConfig();
    }
  }, [isVisible]);
  
  const fetchCurrentConfig = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      const config = await getServerConfig();
      
      if (config.apiUrl) setApiUrl(config.apiUrl);
      if (config.apiType) setApiType(config.apiType);
      if (config.cacheDuration) setCacheDuration(config.cacheDuration);
      
      setSuccessMessage('Current configuration loaded');
    } catch (error) {
      setErrorMessage('Failed to load configuration: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      // Update client-side configuration
      updateConfig({
        serverUrl,
        apiType,
        apiUrl: '/api/weather'
      });
      
      // Update server-side configuration
      const result = await configureServerApi({
        apiKey,
        apiUrl,
        apiType,
        cacheDuration
      });
      
      setSuccessMessage('Configuration saved successfully!');
      
      if (onConfigSaved) {
        onConfigSaved({
          serverUrl,
          apiUrl,
          apiType,
          isConfigured: true
        });
      }
    } catch (error) {
      setErrorMessage('Failed to save configuration: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Set the default URL based on the selected API type
  const handleApiTypeChange = (type) => {
    setApiType(type);
    if (type === 'nws') {
      setApiUrl('https://api.weather.gov');
    } else {
      setApiUrl('https://api.openweathermap.org/data/2.5/weather');
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Settings size={20} className="mr-2" />
            API Configuration
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weather API Service
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="apiType"
                  value="nws"
                  checked={apiType === 'nws'}
                  onChange={() => handleApiTypeChange('nws')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">National Weather Service (NWS)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="apiType"
                  value="openweather"
                  checked={apiType === 'openweather'}
                  onChange={() => handleApiTypeChange('openweather')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">OpenWeather</span>
              </label>
            </div>
          </div>
          
          {apiType === 'openweather' && (
            <div className="mb-4">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                OpenWeather API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your API key"
              />
              <p className="mt-1 text-xs text-gray-500">
                Get a key at <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">OpenWeatherMap</a>
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Weather API Endpoint
            </label>
            <input
              id="apiUrl"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="API URL"
            />
            {apiType === 'nws' && (
              <p className="mt-1 text-xs text-gray-500">
                The National Weather Service API is free and does not require an API key.
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Server URL
            </label>
            <input
              id="serverUrl"
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="http://localhost:3001"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="cacheDuration" className="block text-sm font-medium text-gray-700 mb-1">
              Cache Duration
            </label>
            <select
              id="cacheDuration"
              value={cacheDuration}
              onChange={(e) => setCacheDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="5 minutes">5 minutes</option>
              <option value="10 minutes">10 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
            </select>
          </div>
          
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={fetchCurrentConfig}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              type="button"
              onClick={() => window.open(`${serverUrl}/health`, '_blank')}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Server size={16} className="mr-2" />
              Check Server
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save size={16} className="mr-2" />
              Save Config
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ConfigurationPanel.propTypes = {
  onConfigSaved: PropTypes.func,
  isVisible: PropTypes.bool,
  onClose: PropTypes.func.isRequired
};

ConfigurationPanel.defaultProps = {
  isVisible: false,
  onConfigSaved: () => {}
};

export default ConfigurationPanel;