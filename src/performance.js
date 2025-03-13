const performanceMetrics = {
  startTracking: (metricName) => {
    performance.mark(`${metricName}-start`);
  },
  endTracking: (metricName) => {
    performance.mark(`${metricName}-end`);
    performance.measure(metricName, `${metricName}-start`, `${metricName}-end`);
    
    const entries = performance.getEntriesByName(metricName);
    if (entries.length > 0) {
      console.log(`${metricName} duration: ${entries[0].duration}ms`);
    }
  }
};

export default performanceMetrics;