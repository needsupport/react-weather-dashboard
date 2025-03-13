import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WeatherChart = React.memo(({ data, metrics }) => {
  const processedData = useMemo(() => {
    if (!data || !data.temperature) return [];
    
    return [{
      temperature: data.temperature,
      humidity: data.humidity,
      windSpeed: data.windSpeed
    }];
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
      </LineChart>
    </ResponsiveContainer>
  );
});

WeatherChart.displayName = 'WeatherChart';

export default WeatherChart;