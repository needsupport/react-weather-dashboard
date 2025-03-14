import { 
  calculatePercentile, 
  convertTemp, 
  findSimilarYear, 
  renderTrendIndicator,
  TYPICAL_TEMPERATURE_RANGE,
  TYPICAL_PRECIPITATION_RANGE,
  SIMILARITY_THRESHOLD
} from './weatherUtils';

describe('calculatePercentile', () => {
  test('returns 50 for empty percentiles array', () => {
    expect(calculatePercentile(75, [])).toBe(50);
  });
  
  test('returns 0 for value below lowest percentile', () => {
    expect(calculatePercentile(10, [20, 40, 60, 80])).toBe(0);
  });
  
  test('returns 100 for value above highest percentile', () => {
    expect(calculatePercentile(90, [20, 40, 60, 80])).toBe(100);
  });
  
  test('returns correct percentile for value in range', () => {
    expect(calculatePercentile(40, [20, 40, 60, 80])).toBe(33);
    expect(calculatePercentile(50, [20, 40, 60, 80])).toBe(50);
    expect(calculatePercentile(60, [20, 40, 60, 80])).toBe(67);
  });

  test('handles interpolation correctly', () => {
    expect(calculatePercentile(30, [20, 40, 60, 80])).toBe(17);
    expect(calculatePercentile(50, [20, 40, 60, 80])).toBe(50);
    expect(calculatePercentile(70, [20, 40, 60, 80])).toBe(83);
  });

  test('handles percentiles of length 1', () => {
    expect(calculatePercentile(10, [20])).toBe(0);
    expect(calculatePercentile(30, [20])).toBe(100);
    expect(calculatePercentile(20, [20])).toBe(100);
  });

  test('handles null or undefined parameters', () => {
    expect(calculatePercentile(null, [20, 40, 60])).toBe(0);
    expect(calculatePercentile(undefined, [20, 40, 60])).toBe(0);
    expect(calculatePercentile(30, null)).toBe(50);
    expect(calculatePercentile(30, undefined)).toBe(50);
  });
});

describe('convertTemp', () => {
  test('converts F to C correctly', () => {
    expect(convertTemp(32, 'C')).toBe(0);
    expect(convertTemp(212, 'C')).toBe(100);
    expect(convertTemp(98.6, 'C')).toBe(37);
  });
  
  test('handles C to F conversions', () => {
    expect(convertTemp(0, 'F')).toBe(32);
    expect(convertTemp(100, 'F')).toBe(212);
    expect(convertTemp(37, 'F')).toBe(99);
  });

  test('returns same value if already in correct unit', () => {
    // These values are already in the target unit range
    expect(convertTemp(32, 'F')).toBe(32);
    expect(convertTemp(20, 'C')).toBe(20);
  });

  test('handles edge cases', () => {
    expect(convertTemp(null, 'F')).toBe(0);
    expect(convertTemp(undefined, 'C')).toBe(0);
    expect(convertTemp('not a number', 'F')).toBe(0);
  });

  test('rounds values correctly', () => {
    expect(convertTemp(56.78, 'C')).toBe(14);
    expect(convertTemp(20.3, 'F')).toBe(68);
  });
});

describe('findSimilarYear', () => {
  const testYearlyData = [
    { year: 2018, temp: 70, precip: 20 },
    { year: 2019, temp: 65, precip: 40 },
    { year: 2020, temp: 60, precip: 60 },
    { year: 2021, temp: 55, precip: 80 }
  ];

  test('handles empty or null data', () => {
    expect(findSimilarYear(70, 20, [])).toEqual({ year: null, similarity: 'unknown' });
    expect(findSimilarYear(70, 20, null)).toEqual({ year: null, similarity: 'unknown' });
  });

  test('finds exact match correctly', () => {
    const result = findSimilarYear(70, 20, testYearlyData);
    expect(result.year).toBe(2018);
    expect(result.similarity).toBe('very high');
  });

  test('finds closest match correctly', () => {
    const result = findSimilarYear(64, 42, testYearlyData);
    expect(result.year).toBe(2019);
  });

  test('classifies similarity correctly', () => {
    // Very similar to 2018
    expect(findSimilarYear(69, 22, testYearlyData).similarity).toBe('very high');
    
    // Somewhat similar to 2019
    expect(findSimilarYear(66, 50, testYearlyData).similarity).toBe('moderate');
    
    // Not very similar to any year
    expect(findSimilarYear(80, 90, testYearlyData).similarity).toBe('low');
  });

  test('uses normalization factors correctly', () => {
    // The temperature difference is more significant than precipitation difference
    // because TYPICAL_TEMPERATURE_RANGE (10) is smaller than TYPICAL_PRECIPITATION_RANGE (30)
    const tempFocused = findSimilarYear(67, 70, testYearlyData);
    expect(tempFocused.year).toBe(2019); // Closer in temperature
    
    const precipFocused = findSimilarYear(62, 35, testYearlyData);
    expect(precipFocused.year).toBe(2019); // Closer in precipitation
  });
});

describe('renderTrendIndicator', () => {
  test('handles positive trends', () => {
    const result = renderTrendIndicator(0.5, '°F');
    expect(result.direction).toBe('up');
    expect(result.value).toBe('+0.5°F');
    expect(result.color).toBe('text-red-500');
  });

  test('handles negative trends', () => {
    const result = renderTrendIndicator(-1.2, '%');
    expect(result.direction).toBe('down');
    expect(result.value).toBe('-1.2%');
    expect(result.color).toBe('text-blue-500');
  });

  test('handles zero/no change', () => {
    const result = renderTrendIndicator(0);
    expect(result.direction).toBe('neutral');
    expect(result.value).toBe('No change');
    expect(result.color).toBe('text-gray-500');
  });

  test('handles string parameters', () => {
    const result = renderTrendIndicator('2.5', 'mph');
    expect(result.direction).toBe('up');
    expect(result.value).toBe('+2.5mph');
  });

  test('handles invalid inputs', () => {
    const result = renderTrendIndicator('not a number');
    expect(result.direction).toBe('neutral');
    expect(result.value).toBe('No change');
  });
});