class PerformanceLogger {
  static startTrace(traceName) {
    performance.mark(`${traceName}-start`);
  }

  static endTrace(traceName) {
    performance.mark(`${traceName}-end`);
    performance.measure(traceName, `${traceName}-start`, `${traceName}-end`);
    
    const entries = performance.getEntriesByName(traceName);
    if (entries.length) {
      console.log(`Performance: ${traceName} took ${entries[0].duration.toFixed(2)}ms`);
    }
  }

  static logError(error, context) {
    console.error('Error logged:', {
      message: error.message,
      stack: error.stack,
      context
    });
  }
}