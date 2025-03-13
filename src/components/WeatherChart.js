import React from 'react';
import { ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sun } from 'lucide-react';

const WeatherChart = ({ 
  viewMode, 
  chartData, 
  metrics, 
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
              <svg width="12" height="12" className="mr-1">
                <polygon points="6,0 12,10 0,10" fill="#fecaca" stroke="#f87171" strokeWidth="1.5" />
              </svg>
              <span className="text-gray-600">Hot</span>
            </div>
            <div className="flex items-center">
              <svg width="12" height="12" className="mr-1">
                <polygon points="0,2 12,2 6,12" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
              </svg>
              <span className="text-gray-600">Cold</span>
            </div>
            <div className="flex items-center">
              <svg width="12" height="12" className="mr-1">
                <rect x="1" y="1" width="10" height="10" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
              </svg>
              <span className="text-gray-600">Wet</span>
            </div>
            <div className="flex items-center">
              <svg width="12" height="12" className="mr-1">
                <polygon points="6,0 12,6 6,12 0,6" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5" />
              </svg>
              <span className="text-gray-600">Dry</span>
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
              <linearGradient id="tempRangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fdba74" stopOpacity={0.12}/>
                <stop offset="95%" stopColor="#fed7aa" stopOpacity={0.04}/>
              </linearGradient>
              <linearGradient id="precipRangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.12}/>
                <stop offset="95%" stopColor="#bfdbfe" stopOpacity={0.04}/>
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
            
            {/* Historical temperature range (only in 7-day view) */}
            {viewMode === '7-Day' && metrics.temperature && showHistoricalRange && (
              <Area
                type="monotone"
                dataKey="tempRangeMax"
                stackId="tempRange"
                stroke="none"
                fill="url(#tempRangeGradient)"
                yAxisId="temp"
              />
            )}
            
            {/* Historical precipitation range (only in 7-day view) */}
            {viewMode === '7-Day' && metrics.precipitation && showHistoricalRange && (
              <Area
                type="monotone"
                dataKey="precipRangeMax"
                stackId="precipRange"
                stroke="none"
                fill="url(#precipRangeGradient)"
                yAxisId="percent"
              />
            )}
            
            {/* Historical average temperature line */}
            {viewMode === '7-Day' && metrics.temperature && showHistoricalAvg && (
              <Line
                type="monotone"
                dataKey="tempAvg"
                stroke="#f97316"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                dot={false}
                yAxisId="temp"
                name="Avg Temp"
                unit="°F"
              />
            )}
            
            {/* Historical average precipitation line */}
            {viewMode === '7-Day' && metrics.precipitation && showHistoricalAvg && (
              <Line
                type="monotone"
                dataKey="precipAvg"
                stroke="#3b82f6"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                dot={false}
                yAxisId="percent"
                name="Avg Precip"
                unit="%"
              />
            )}
            
            {/* Main temperature data */}
            {metrics.temperature && (
              viewMode === 'Historical' ? (
                <Bar
                  dataKey="temperature"
                  fill="url(#tempGradient)"
                  stroke="#f97316"
                  strokeWidth={1}
                  yAxisId="temp"
                  name="Temperature"
                  unit="°F"
                  animationDuration={800}
                  animationEasing="ease-out"
                  radius={[4, 4, 0, 0]}
                />
              ) : (
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
                  animationDuration={800}
                  animationEasing="ease-out"
                  dot={(props) => {
                    // Custom dot for anomaly detection
                    if (viewMode === '7-Day' && showAnomalies) {
                      const dataIndex = props.index;
                      const isAnomaly = chartData[dataIndex]?.tempAnomaly;
                      const anomalyType = isAnomaly ? chartData[dataIndex]?.tempAnomalyType : null;
                      
                      if (isAnomaly) {
                        // Using different shapes based on anomaly type for better accessibility
                        if (anomalyType === 'hot') {
                          // Triangle pointing up for hot anomalies (red)
                          return (
                            <svg x={props.cx - 6} y={props.cy - 6} width={12} height={12} role="img" aria-label="Hot temperature anomaly">
                              <polygon 
                                points="6,0 12,10 0,10" 
                                fill="#fecaca" 
                                stroke="#f87171" 
                                strokeWidth="1.5"
                              />
                            </svg>
                          );
                        } else {
                          // Triangle pointing down for cold anomalies (blue)
                          return (
                            <svg x={props.cx - 6} y={props.cy - 6} width={12} height={12} role="img" aria-label="Cold temperature anomaly">
                              <polygon 
                                points="0,2 12,2 6,12" 
                                fill="#bfdbfe" 
                                stroke="#60a5fa" 
                                strokeWidth="1.5"
                              />
                            </svg>
                          );
                        }
                      }
                    }
                    
                    // Default dot
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill="#f97316"
                        stroke="#FFFFFF"
                        strokeWidth={1}
                      />
                    );
                  }}
                />
              )
            )}
            
            {/* Main precipitation data */}
            {metrics.precipitation && (
              viewMode === 'Historical' ? (
                <Bar
                  dataKey="precipitation"
                  fill="url(#precipGradient)"
                  stroke="#3b82f6"
                  strokeWidth={1}
                  yAxisId="percent"
                  name="Precipitation"
                  unit="%"
                  animationDuration={1000}
                  animationBegin={300}
                  animationEasing="ease-in-out"
                />
              ) : (
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
                  animationDuration={1000}
                  animationBegin={300}
                  animationEasing="ease-in-out"
                  dot={(props) => {
                    // Custom dot for anomaly detection
                    if (viewMode === '7-Day' && showAnomalies) {
                      const dataIndex = props.index;
                      const isAnomaly = chartData[dataIndex]?.precipAnomaly;
                      const anomalyType = isAnomaly ? chartData[dataIndex]?.precipAnomalyType : null;
                      
                      if (isAnomaly) {
                        // Using different shapes for precipitation anomalies
                        if (anomalyType === 'wet') {
                          // Square for wet anomalies (blue)
                          return (
                            <svg x={props.cx - 6} y={props.cy - 6} width={12} height={12} role="img" aria-label="Unusually wet precipitation anomaly">
                              <rect
                                x="1"
                                y="1"
                                width="10"
                                height="10"
                                fill="#bfdbfe"
                                stroke="#60a5fa"
                                strokeWidth="1.5"
                              />
                            </svg>
                          );
                        } else {
                          // Diamond for dry anomalies (amber)
                          return (
                            <svg x={props.cx - 6} y={props.cy - 6} width={12} height={12} role="img" aria-label="Unusually dry precipitation anomaly">
                              <polygon
                                points="6,0 12,6 6,12 0,6"
                                fill="#fef3c7"
                                stroke="#fbbf24"
                                strokeWidth="1.5"
                              />
                            </svg>
                          );
                        }
                      }
                    }
                    
                    // Default dot
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill="#3b82f6"
                        stroke="#FFFFFF"
                        strokeWidth={1}
                      />
                    );
                  }}
                />
              )
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
                animationDuration={1000}
                animationBegin={600}
                animationEasing="ease-in-out"
              />
            )}
            
            {/* Wind speed data */}
            {metrics.wind && (
              viewMode === 'Historical' ? (
                <Bar
                  dataKey="windSpeed"
                  fill="url(#windGradient)"
                  stroke="#10b981"
                  strokeWidth={1}
                  yAxisId="wind"
                  name="Wind Speed"
                  unit=" mph"
                  animationDuration={1200}
                  animationBegin={900}
                  animationEasing="ease-in-out"
                  radius={[4, 4, 0, 0]}
                />
              ) : (
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
                  animationDuration={1200}
                  animationBegin={900}
                  animationEasing="ease-in-out"
                />
              )
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