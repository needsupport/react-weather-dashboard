// City data with historical averages and trends
export const cityData = {
  'Seattle': { 
    averages: { tempLow: 42, tempHigh: 52, precipChance: 70, uvIndex: 3, windSpeed: 8 },
    historical: { 
      tempTrend: -0.5, // degrees per decade (cooling)
      precipTrend: 1.8, // percent per decade (more rain)
      uvTrend: 0.4,    // index points per decade (higher UV)
      windTrend: 0.3,   // mph per decade (slightly windier)
      extremes: { hottest: 2018, coldest: 2008, wettest: 2017, driest: 2015, windiest: 2014 }
    },
    // Monthly historical data (average for March)
    marchData: {
      avgTemp: 48,
      tempRange: { min: 39, max: 57 },
      avgPrecip: 65,
      precipRange: { min: 40, max: 90 },
      avgUV: 3.5,
      uvRange: { min: 2, max: 5 },
      // Statistical data for each day in March (for precision)
      daily: [
        // Sample data for March 9th through 15th
        { date: "Mar 9", tempMean: 47, precipMean: 68, uvMean: 3.2, tempSD: 3.2, precipSD: 12, uvSD: 0.8, 
          tempPercentiles: [42, 44, 46, 47, 49, 51, 54], precipPercentiles: [45, 55, 62, 68, 74, 80, 88], 
          yearlyData: [
            {year: 2005, temp: 45, precip: 72}, {year: 2010, temp: 46, precip: 65}, 
            {year: 2015, temp: 48, precip: 60}, {year: 2020, temp: 49, precip: 75}
          ]},
        { date: "Mar 10", tempMean: 47.5, precipMean: 66, uvMean: 3.3, tempSD: 3.4, precipSD: 11, uvSD: 0.7 },
        { date: "Mar 11", tempMean: 48, precipMean: 64, uvMean: 3.4, tempSD: 3.1, precipSD: 13, uvSD: 0.9 },
        { date: "Mar 12", tempMean: 48.5, precipMean: 62, uvMean: 3.6, tempSD: 2.9, precipSD: 14, uvSD: 0.8 },
        { date: "Mar 13", tempMean: 49, precipMean: 60, uvMean: 3.7, tempSD: 3.0, precipSD: 12, uvSD: 0.7 },
        { date: "Mar 14", tempMean: 49.5, precipMean: 58, uvMean: 3.8, tempSD: 3.3, precipSD: 10, uvSD: 0.9 },
        { date: "Mar 15", tempMean: 50, precipMean: 56, uvMean: 3.9, tempSD: 3.5, precipSD: 11, uvSD: 1.0 }
      ]
    }
  },
  'Portland': { 
    averages: { tempLow: 45, tempHigh: 55, precipChance: 60, uvIndex: 4, windSpeed: 7 },
    historical: { 
      tempTrend: 0.4, 
      precipTrend: 1.2, 
      uvTrend: 0.5,
      windTrend: 0.2,
      extremes: { hottest: 2021, coldest: 2011, wettest: 2017, driest: 2014, windiest: 2021 }
    }
  },
  'San Francisco': { 
    averages: { tempLow: 50, tempHigh: 63, precipChance: 40, uvIndex: 5, windSpeed: 12 },
    historical: { 
      tempTrend: 0.7, 
      precipTrend: -2.0, 
      uvTrend: 0.6,
      windTrend: 0.4,
      extremes: { hottest: 2022, coldest: 2010, wettest: 2019, driest: 2013, windiest: 2019 }
    }
  },
  'Los Angeles': { 
    averages: { tempLow: 55, tempHigh: 70, precipChance: 20, uvIndex: 7, windSpeed: 6 },
    historical: { 
      tempTrend: 0.9, 
      precipTrend: -3.5, 
      uvTrend: 0.8,
      windTrend: -0.2,
      extremes: { hottest: 2023, coldest: 2011, wettest: 2010, driest: 2022, windiest: 2010 }
    }
  }
};

// Helper function to calculate percentile
export const calculatePercentile = (value, percentiles) => {
  if (!percentiles || percentiles.length === 0) return 50;
  
  // If value is less than the lowest percentile
  if (value < percentiles[0]) return 0;
  
  // If value is greater than the highest percentile
  if (value > percentiles[percentiles.length - 1]) return 100;
  
  // Find where the value fits between percentiles
  for (let i = 0; i < percentiles.length - 1; i++) {
    if (value >= percentiles[i] && value <= percentiles[i + 1]) {
      // Calculate the exact percentile using linear interpolation
      const percentileStep = 100 / (percentiles.length - 1);
      const lowerPercentile = i * percentileStep;
      const ratio = (value - percentiles[i]) / (percentiles[i + 1] - percentiles[i]);
      return Math.round(lowerPercentile + ratio * percentileStep);
    }
  }
  
  return 50; // Default fallback
};

// Helper function to find the most similar historical year
export const findSimilarYear = (temp, precip, yearlyData) => {
  if (!yearlyData || yearlyData.length === 0) {
    return { year: null, similarity: "unknown" };
  }
  
  // Calculate similarity score for each year (lower is better)
  const scoredYears = yearlyData.map(yearData => {
    // Calculate Euclidean distance (normalized)
    const tempDiff = Math.abs(temp - yearData.temp) / 10; // Normalize by typical range
    const precipDiff = Math.abs(precip - yearData.precip) / 30; // Normalize by typical range
    const score = Math.sqrt(tempDiff * tempDiff + precipDiff * precipDiff);
    
    return {
      year: yearData.year,
      score: score
    };
  });
  
  // Sort by score (ascending)
  scoredYears.sort((a, b) => a.score - b.score);
  
  // Determine similarity rating
  let similarity;
  if (scoredYears[0].score < 0.1) similarity = "very high";
  else if (scoredYears[0].score < 0.2) similarity = "high";
  else if (scoredYears[0].score < 0.3) similarity = "moderate";
  else similarity = "low";
  
  return {
    year: scoredYears[0].year,
    similarity: similarity
  };
};

// Render trend indicator helper
export const renderTrendIndicator = (value, unit = "") => {
  const numValue = parseFloat(value);
  if (numValue > 0) {
    return {
      direction: "up",
      value: `+${value}${unit}`,
      color: "text-red-500"
    };
  } else if (numValue < 0) {
    return {
      direction: "down",
      value: `${value}${unit}`,
      color: "text-blue-500"
    };
  }
  return {
    direction: "neutral",
    value: `No change`,
    color: "text-gray-500"
  };
};

// Convert temperature between Fahrenheit and Celsius
export const convertTemp = (f, unit) => unit === 'C' ? Math.round((f - 32) * 5 / 9) : f;
