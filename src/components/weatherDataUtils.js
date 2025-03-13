import { cityData, calculatePercentile, findSimilarYear } from './weatherUtils';

// Generate forecast data for 7-day or hourly view
export const generateForecastData = (cityName, mode) => {
  const cityInfo = cityData[cityName] || cityData['Seattle'];
  const startDate = new Date();
  const data = [];
  const numItems = mode === '7-Day' ? 7 : 24;

  for (let i = 0; i < numItems; i++) {
    const currentDate = new Date(startDate);
    if (mode === '7-Day') currentDate.setDate(startDate.getDate() + i);
    else currentDate.setHours(startDate.getHours() + i);

    const avgs = cityInfo.averages;
    const randomTempVariation = (Math.random() * 4) - 2;
    const timeAdjustment = mode === 'Hourly' ? (currentDate.getHours() < 6 ? -3 : currentDate.getHours() < 12 ? 2 : currentDate.getHours() < 18 ? 5 : 0) : 0;

    const temperature = mode === '7-Day'
      ? { tempHigh: Math.round(avgs.tempHigh + randomTempVariation), tempLow: Math.round(avgs.tempLow + randomTempVariation) }
      : { temperature: Math.round((avgs.tempHigh + avgs.tempLow) / 2 + randomTempVariation + timeAdjustment) };

    const precipChance = Math.min(Math.max(avgs.precipChance + Math.floor(Math.random() * 30) - 15, 5), 95);
    const uvIndex = mode === '7-Day' ? avgs.uvIndex : Math.max(0, avgs.uvIndex + Math.floor(Math.random() * 3) - 1);
    
    // Generate wind data
    const windSpeed = Math.floor(Math.random() * 10) + avgs.windSpeed - 3;
    const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const windDirection = windDirections[Math.floor(Math.random() * windDirections.length)];

    const icon = precipChance > 50 ? 'rain' : precipChance > 30 ? 'cloud-drizzle' : 'sun';
    const displayDay = mode === '7-Day'
      ? currentDate.toLocaleDateString('en-US', { weekday: 'long' })
      : `${currentDate.getHours() % 12 || 12} ${currentDate.getHours() >= 12 ? 'PM' : 'AM'}`;

    data.push({
      id: `${mode}-${i}`,
      day: displayDay,
      date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...temperature,
      precipitation: { chance: precipChance },
      icon,
      uvIndex,
      wind: { speed: windSpeed, direction: windDirection },
    });
  }
  return data;
};

// Generate historical data for the past 20 years
export const generateHistoricalData = (cityName) => {
  const cityInfo = cityData[cityName] || cityData['Seattle'];
  const trends = cityInfo.historical;
  const data = [];
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 20;

  for (let year = startYear; year <= currentYear; year++) {
    // Calculate baseline values adjusting for trends over time
    const yearsSinceStart = year - startYear;
    const decadesSinceStart = yearsSinceStart / 10;
    
    // Apply trends with some random variation
    const tempHighBase = cityInfo.averages.tempHigh - (trends.tempTrend * 2) + (trends.tempTrend * decadesSinceStart);
    const tempLowBase = cityInfo.averages.tempLow - (trends.tempTrend * 2) + (trends.tempTrend * decadesSinceStart);
    const precipBase = cityInfo.averages.precipChance - (trends.precipTrend * 2) + (trends.precipTrend * decadesSinceStart);
    const uvBase = cityInfo.averages.uvIndex - (trends.uvTrend * 2) + (trends.uvTrend * decadesSinceStart);
    const windBase = cityInfo.averages.windSpeed - (trends.windTrend * 2) + (trends.windTrend * decadesSinceStart);
    
    // Add random variation for specific years
    const randomVariation = Math.random() * 6 - 3;
    const isExtreme = year === trends.extremes.hottest || 
                      year === trends.extremes.coldest || 
                      year === trends.extremes.wettest || 
                      year === trends.extremes.driest ||
                      year === trends.extremes.windiest;
    
    const extraVariation = isExtreme ? (Math.random() * 6) + 2 : 0;
    
    // Adjust values for extreme years
    let tempHigh = Math.round(tempHighBase + randomVariation);
    let tempLow = Math.round(tempLowBase + randomVariation);
    let precip = Math.round(precipBase + randomVariation);
    let uv = Math.max(1, Math.round((uvBase + randomVariation/3) * 10) / 10);
    let windSpeed = Math.max(1, Math.round(windBase + randomVariation));
    
    if (year === trends.extremes.hottest) {
      tempHigh += extraVariation;
      tempLow += extraVariation/2;
    } else if (year === trends.extremes.coldest) {
      tempHigh -= extraVariation;
      tempLow -= extraVariation/2;
    }
    
    if (year === trends.extremes.wettest) {
      precip += extraVariation * 3;
    } else if (year === trends.extremes.driest) {
      precip -= extraVariation * 3;
    }
    
    if (year === trends.extremes.windiest) {
      windSpeed += extraVariation;
    }
    
    // Ensure values are in reasonable ranges
    precip = Math.min(Math.max(precip, 0), 100);
    windSpeed = Math.min(Math.max(windSpeed, 1), 30);
    
    // Generate wind direction
    const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const windDirection = windDirections[Math.floor(Math.random() * windDirections.length)];
    
    // Create the data point
    data.push({
      year,
      tempHigh,
      tempLow,
      temp: Math.round((tempHigh + tempLow) / 2),
      precipitation: precip,
      uvIndex: uv,
      wind: { speed: windSpeed, direction: windDirection },
      isHottest: year === trends.extremes.hottest,
      isColdest: year === trends.extremes.coldest,
      isWettest: year === trends.extremes.wettest,
      isDriest: year === trends.extremes.driest,
      isWindiest: year === trends.extremes.windiest
    });
  }
  
  return data;
};

// Advanced statistical algorithms for the 7-day forecast
export const generateHistoricalRanges = (cityName, forecastData) => {
  const cityInfo = cityData[cityName] || cityData['Seattle'];
  const marchData = cityInfo.marchData || (cityData['Seattle'] ? cityData['Seattle'].marchData : {});
  const dailyData = marchData.daily || [];
  
  return forecastData.map((day, index) => {
    // Find the matching historical data for this date
    const dayData = dailyData[Math.min(index, dailyData.length - 1)] || dailyData[0] || {
      tempMean: 50, precipMean: 50, uvMean: 3, 
      tempSD: 3, precipSD: 10, uvSD: 0.5
    };
    
    // Algorithm 1: Z-Score Calculation
    const tempZScore = (day.tempHigh - dayData.tempMean) / dayData.tempSD;
    const precipZScore = (day.precipitation.chance - dayData.precipMean) / dayData.precipSD;
    const uvZScore = (day.uvIndex - dayData.uvMean) / dayData.uvSD;
    
    // Algorithm 2: Percentile Ranking
    const tempPercentile = calculatePercentile(day.tempHigh, dayData.tempPercentiles || 
      [dayData.tempMean - 2*dayData.tempSD, dayData.tempMean - dayData.tempSD, 
       dayData.tempMean - 0.5*dayData.tempSD, dayData.tempMean, 
       dayData.tempMean + 0.5*dayData.tempSD, dayData.tempMean + dayData.tempSD, 
       dayData.tempMean + 2*dayData.tempSD]);
    
    const precipPercentile = calculatePercentile(day.precipitation.chance, dayData.precipPercentiles || 
      [dayData.precipMean - 2*dayData.precipSD, dayData.precipMean - dayData.precipSD, 
       dayData.precipMean - 0.5*dayData.precipSD, dayData.precipMean, 
       dayData.precipMean + 0.5*dayData.precipSD, dayData.precipMean + dayData.precipSD, 
       dayData.precipMean + 2*dayData.precipSD]);
    
    // Algorithm 3: Anomaly Detection (using Z-score)
    const tempAnomaly = Math.abs(tempZScore) > 1.5;
    const precipAnomaly = Math.abs(precipZScore) > 1.5;
    const uvAnomaly = Math.abs(uvZScore) > 1.5;
    
    // Calculate anomaly direction
    const tempAnomalyType = day.tempHigh > dayData.tempMean ? 'hot' : 'cold';
    const precipAnomalyType = day.precipitation.chance > dayData.precipMean ? 'wet' : 'dry';
    const uvAnomalyType = day.uvIndex > dayData.uvMean ? 'high' : 'low';
    
    // Algorithm 4: Historical Year Comparison
    const similarYear = dayData.yearlyData ? 
      findSimilarYear(day.tempHigh, day.precipitation.chance, dayData.yearlyData) : 
      { year: 2015, similarity: "moderate" };
    
    return {
      id: day.id,
      date: day.date,
      day: day.day,
      // Historical temperature range and statistics
      tempRange: {
        min: Math.round(dayData.tempMean - 1.5 * dayData.tempSD),
        max: Math.round(dayData.tempMean + 1.5 * dayData.tempSD),
        avg: Math.round(dayData.tempMean)
      },
      // Historical precipitation range and statistics
      precipRange: {
        min: Math.round(dayData.precipMean - 1.5 * dayData.precipSD),
        max: Math.round(dayData.precipMean + 1.5 * dayData.precipSD),
        avg: Math.round(dayData.precipMean)
      },
      // Historical UV range and statistics
      uvRange: {
        min: Math.max(1, Math.round((dayData.uvMean - dayData.uvSD) * 10) / 10),
        max: Math.round((dayData.uvMean + dayData.uvSD) * 10) / 10,
        avg: Math.round(dayData.uvMean * 10) / 10
      },
      // Statistical measurements
      stats: {
        tempZScore: Math.round(tempZScore * 10) / 10,
        precipZScore: Math.round(precipZScore * 10) / 10,
        uvZScore: Math.round(uvZScore * 10) / 10,
        tempPercentile: tempPercentile,
        precipPercentile: precipPercentile,
        similarYear: similarYear
      },
      // Anomaly flags
      anomalies: {
        temp: tempAnomaly,
        precip: precipAnomaly,
        uv: uvAnomaly,
        tempType: tempAnomalyType,
        precipType: precipAnomalyType,
        uvType: uvAnomalyType
      }
    };
  });
};
