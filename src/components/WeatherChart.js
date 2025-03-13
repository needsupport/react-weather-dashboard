import React, { useMemo } from 'react';
import { ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeatherChart = ({ 
  viewMode, 
  currentData, 
  metrics, 
  historicalRanges, 
  showHistoricalRange, 
  showHistoricalAvg, 
  showAnomalies, 
  selectedDate, 
  handleChartClick 
}) => {
  // Simplified tooltip
  const SimplifiedTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    const temp = payload.find(p => p.dataKey === "temperature");
    const precip = payload.find(p => p.dataKey === "precipitation");
    
    return (
      <div>
        <div className="mt-2 text-xs text-gray-500 italic">
          Click on chart to see details
        </div>
        <div className="bg-white/95 p-3 border rounded-md shadow-md max-w-xs backdrop-blur-sm">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          
          {temp && (
            <p className="text-sm flex items-center mb-1">
              <span className="inline-block w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mr-2"></span>
              {temp.value}°F
            </p>
          )}
          
          {precip && (
            <p className="text-sm flex items-center">
              <span className="inline-block w-2 h-2 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full mr-2"></span>
              {precip.value}% 
            </p>
          )}
        </div>
      </div>
    );
  };

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!currentData || !currentData.length) return [];
    
    if (viewMode === 'Historical') {
      return currentData.map(item => ({
        name: item.year.toString(),
        temperature: metrics.temperature ? item.temp : null,
        precipitation: metrics.precipitation ? item.precipitation : null,
        uvIndex: metrics.uvIndex ? (item.uvIndex * 10) : null, // Scale for better visibility
        windSpeed: metrics.wind ? item.wind.speed : null,
        id: item.year.toString(),
        isHottest: item.isHottest,
        isColdest: item.isColdest,
        isWettest: item.isWettest,
        isDriest: item.isDriest,
        isWindiest: item.isWindiest
      }));
    }
    
    if (viewMode === '7-Day') {
      // Enhanced chart data for 7-day view with historical context
      return currentData.map((day, index) => {
        const histData = historicalRanges[index] || {};
        
        return {
          name: day.day || '',
          // Main forecast data
          temperature: day.tempHigh || 0,
          precipitation: day.precipitation?.chance || 0,
          uvIndex: (day.uvIndex || 0) * 10, // Scale for better visibility
          windSpeed: metrics.wind ? day.wind.speed : null,
          windDirection: day.wind.direction,
          id: day.id || '',
          // Historical ranges for temperature
          tempRangeMin: histData.tempRange?.min,
          tempRangeMax: histData.tempRange?.max,
          tempAvg: histData.tempRange?.avg,
          // Historical ranges for precipitation
          precipRangeMin: histData.precipRange?.min,
          precipRangeMax: histData.precipRange?.max,
          precipAvg: histData.precipRange?.avg,
          // Anomaly data
          tempAnomaly: histData.anomalies?.temp,
          precipAnomaly: histData.anomalies?.precip,
          uvAnomaly: histData.anomalies?.uv,
          tempAnomalyType: histData.anomalies?.tempType,
          precipAnomalyType: histData.anomalies?.precipType,
          uvAnomalyType: histData.anomalies?.uvType,
          // Stats
          stats: histData.stats
        };
      });
    }
    
    // Hourly view data
    return currentData.map(day => ({
      name: day.day || '',
      temperature: day.temperature || 0,
      precipitation: day.precipitation?.chance || 0,
      uvIndex: (day.uvIndex || 0) * 10, // Scale for better visibility
      windSpeed: metrics.wind ? day.wind.speed : null,
      windDirection: day.wind?.direction,
      id: day.id || ''
    }));
  }, [currentData, viewMode, metrics, historicalRanges]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-5 border border-gray-100/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {viewMode === 'Historical' 
            ? 'Historical Weather Trends' 
            : `${viewMode} Forecast`}
        </h3>
        {viewMode === 'Historical' && (
          <div className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">
            2005-2025 data for {selectedDate}
          </div>
        )}
        {viewMode === '7-Day' && showAnomalies && (
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-red-200 rounded-full mr-1"></span>
              <span className="text-gray-600">Hot</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-blue-200 rounded-full mr-1"></span>
              <span className="text-gray-600">Cold</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="h-80">
        {viewMode === '7-Day' && metrics.uvIndex && (
          <div className="mb-2 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block">
            Note: UV Index values are scaled (×10) for better visibility on chart
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%" className="touch-pan-x">
          <ComposedChart 
            data={chartData} 
            margin={{ top: 10, right: 30, left: 10, bottom: viewMode === 'Hourly' ? 40 : 20 }}
            onClick={handleChartClick}
            aria-label={`${viewMode} weather forecast chart`}
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#fed7aa" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#bfdbfe" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#fef3c7" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#d1fae5" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#1F2937' }}
              tickLine={{ stroke: '#d1d5db' }}
              tickFormatter={(value) => viewMode === 'Historical' ? value : value.substring(0, 3)}
              angle={viewMode === 'Hourly' ? -25 : 0}
              textAnchor={viewMode === 'Hourly' ? 'end' : 'middle'}
              height={viewMode === 'Hourly' ? 60 : 30}
              minTickGap={viewMode === 'Hourly' ? 15 : 5}
            />
            
            {metrics.temperature && (
              <YAxis 
                yAxisId="temp"
                orientation="left"
                domain={['auto', 'auto']}
                tick={{ fill: '#1F2937' }}
                tickLine={{ stroke: '#d1d5db' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
            )}
            
            {(metrics.precipitation || metrics.uvIndex || metrics.wind) && (
              <YAxis 
                yAxisId="percent"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: '#1F2937' }}
                tickLine={{ stroke: '#d1d5db' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
            )}
            
            {metrics.wind && (
              <YAxis
                yAxisId="wind"
                orientation="right"
                domain={[0, 30]}
                tick={{ fill: '#1F2937' }}
                tickLine={{ stroke: '#d1d5db' }}
                axisLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => `${value}`}
                tickCount={6}
                dx={35}
              />
            )}
            
            {/* Main temperature data */}
            {metrics.temperature && (
              <Area 
                type="monotone" 
                dataKey="temperature" 
                stroke="#f97316" 
                strokeWidth={2}
                fill="url(#tempGradient)"
                yAxisId="temp"
                name="Temperature" 
                unit="°F"
                activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
              />
            )}
            
            {/* Main precipitation data */}
            {metrics.precipitation && (
              <Area 
                type="monotone" 
                dataKey="precipitation" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#precipGradient)"
                yAxisId="percent"
                name="Precipitation" 
                unit="%"
                activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
              />
            )}
            
            {/* UV index data */}
            {metrics.uvIndex && (
              <Line 
                type="monotone" 
                dataKey="uvIndex"
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#f59e0b', strokeWidth: 1, stroke: '#fff' }}
                yAxisId="percent"
                name="UV Index" 
                unit=""
              />
            )}
            
            {/* Wind speed data */}
            {metrics.wind && (
              <Line 
                type="monotone" 
                dataKey="windSpeed"
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }}
                yAxisId="wind"
                name="Wind Speed" 
                unit=" mph"
              />
            )}
            
            <Tooltip content={SimplifiedTooltip} wrapperStyle={{ outline: 'none' }} />
            <Legend 
              verticalAlign="bottom"
              height={24}
              formatter={(value) => (
                <span className="text-xs flex items-center px-2 py-0.5 bg-gray-50 rounded-full">
                  {value}
                </span>
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {viewMode === 'Historical' && (
        <div className="mt-4 bg-amber-50 p-3 rounded-lg border border-amber-100">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Click on any year to see detailed conditions for that specific year.
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherChart;