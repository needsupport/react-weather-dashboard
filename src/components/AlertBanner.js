import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, AlertCircle, Bell, Clock, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchNWSAlerts } from './weatherDataUtils';

/**
 * AlertBanner component for displaying weather alerts from the NWS API
 * 
 * @component
 * @param {Object} props
 * @param {string} props.location - Location coordinates (lat,lon)
 * @param {boolean} [props.autoRefresh=true] - Whether to automatically refresh alerts
 * @param {number} [props.refreshInterval=300000] - Refresh interval in milliseconds (default: 5 minutes)
 */
const AlertBanner = ({ location, autoRefresh = true, refreshInterval = 300000 }) => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedAlerts, setExpandedAlerts] = useState({});

  // Fetch alerts on component mount and when location changes
  useEffect(() => {
    if (location) {
      fetchAlerts();
    }
    
    // Set up auto-refresh if enabled
    let intervalId;
    if (autoRefresh && location) {
      intervalId = setInterval(fetchAlerts, refreshInterval);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [location, autoRefresh, refreshInterval]);

  // Fetch alerts from the API
  const fetchAlerts = async () => {
    if (!location || !location.includes(',')) {
      return;
    }
    
    try {
      setIsLoading(true);
      const alertData = await fetchNWSAlerts(location);
      setAlerts(alertData);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error);
      setError('Unable to fetch weather alerts');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle the expanded state of an alert
  const toggleAlert = (alertId) => {
    setExpandedAlerts(prev => ({
      ...prev,
      [alertId]: !prev[alertId]
    }));
  };

  // Format the alert date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get the appropriate color based on alert severity
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme':
        return 'bg-red-600 text-white';
      case 'severe':
        return 'bg-red-500 text-white';
      case 'moderate':
        return 'bg-orange-500 text-white';
      case 'minor':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  // Get the appropriate icon based on alert event type
  const getAlertIcon = (event, severity) => {
    // Default icon is AlertTriangle
    let Icon = AlertTriangle;
    let color = "currentColor";
    
    // Set color based on severity
    if (severity?.toLowerCase() === 'extreme' || severity?.toLowerCase() === 'severe') {
      color = "#ef4444"; // Red
    } else if (severity?.toLowerCase() === 'moderate') {
      color = "#f97316"; // Orange
    } else if (severity?.toLowerCase() === 'minor') {
      color = "#eab308"; // Yellow
    }
    
    return <Icon size={20} color={color} />;
  };

  // If no alerts, don't render anything
  if (alerts.length === 0 && !isLoading && !error) {
    return null;
  }

  return (
    <div className="my-4">
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      ) : isLoading && alerts.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-center">
            <span className="animate-pulse">Loading weather alerts...</span>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 font-medium flex items-center justify-between">
            <div className="flex items-center">
              <Bell size={16} className="mr-2 text-red-500" />
              <span>{alerts.length} Active Weather Alert{alerts.length !== 1 ? 's' : ''}</span>
            </div>
            <button 
              onClick={fetchAlerts}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Refresh
            </button>
          </div>
          
          <div className="divide-y divide-gray-200">
            {alerts.map(alert => (
              <div key={alert.id} className="px-4 py-3">
                <div 
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleAlert(alert.id)}
                >
                  <div className="flex items-start">
                    <div className="mt-1 mr-3">
                      {getAlertIcon(alert.event, alert.severity)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {alert.event}
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </h3>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <Clock size={14} className="mr-1" />
                        <span>Until {formatDate(alert.end)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {expandedAlerts[alert.id] ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedAlerts[alert.id] && (
                  <div className="mt-3 text-sm text-gray-700">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {alert.description && (
                        <div className="mb-3">
                          <h4 className="font-medium mb-1">Description:</h4>
                          <p className="whitespace-pre-line">{alert.description}</p>
                        </div>
                      )}
                      
                      {alert.instruction && (
                        <div>
                          <h4 className="font-medium mb-1 text-red-700">Instructions:</h4>
                          <p className="whitespace-pre-line">{alert.instruction}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-3 flex justify-between">
                        <div>
                          <span>Issued: {formatDate(alert.start)}</span>
                        </div>
                        <div>
                          <span>Source: National Weather Service</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

AlertBanner.propTypes = {
  location: PropTypes.string.isRequired,
  autoRefresh: PropTypes.bool,
  refreshInterval: PropTypes.number
};

export default AlertBanner;