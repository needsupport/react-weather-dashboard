export const validateLocation = (location) => {
  if (!location || typeof location !== 'string') {
    throw new Error('Invalid location');
  }
  
  const sanitizedLocation = location.trim().replace(/[^a-zA-Z,\s]/g, '');
  return sanitizedLocation;
};

export const validateMetrics = (metrics) => {
  const validMetrics = ['temperature', 'precipitation', 'uvIndex', 'wind'];
  return Object.keys(metrics).every(metric => 
    validMetrics.includes(metric) && typeof metrics[metric] === 'boolean'
  );
};