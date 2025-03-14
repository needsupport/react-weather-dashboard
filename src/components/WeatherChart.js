import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

/**
 * WeatherChart - Renders weather data visualizations
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.data - Array of weather data objects
 * @param {Object} props.metrics - Object indicating which metrics to display
 * @returns {JSX.Element}
 */
const WeatherChart = React.memo(({ data, metrics }) => {
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    // Transform the data for the chart
    return data.map(day => ({
      name: day.day,
      temperature: day.tempHigh,
      precipitation: day.precipitation?.chance || 0,
      windSpeed: day.wind?.speed || 0,
      uvIndex: day.uvIndex || 0
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        
        {metrics.temperature && (
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#8884d8" 
            name="Temperature" 
          />
        )}
        
        {metrics.wind && (
          <Line 
            type="monotone" 
            dataKey="windSpeed" 
            stroke="#82ca9d" 
            name="Wind Speed" 
          />
        )}

        {metrics.precipitation && (
          <Line 
            type="monotone" 
            dataKey="precipitation" 
            stroke="#ffc658" 
            name="Precipitation %" 
          />
        )}

        {metrics.uvIndex && (
          <Line 
            type="monotone" 
            dataKey="uvIndex" 
            stroke="#ff8042" 
            name="UV Index" 
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
});

WeatherChart.displayName = 'WeatherChart';

WeatherChart.propTypes = {
  data: PropTypes.array,
  metrics: PropTypes.shape({
    temperature: PropTypes.bool,
    precipitation: PropTypes.bool, 
    uvIndex: PropTypes.bool,
    wind: PropTypes.bool
  })
};

WeatherChart.defaultProps = {
  data: [],
  metrics: {
    temperature: true,
    precipitation: true,
    uvIndex: true,
    wind: true
  }
};

export default WeatherChart;