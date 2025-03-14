import React from 'react';
import PropTypes from 'prop-types';

/**
 * ErrorBoundary - Catches JavaScript errors in child component tree
 * 
 * @component
 * @example
 * <ErrorBoundary showDetails={false}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      errorInfo: null,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo, error });
    
    // Add actual error tracking service (e.g., Sentry)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container p-4 border border-red-300 bg-red-50 rounded-lg my-4">
          <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="mb-2">We've encountered an error in the application.</p>
          <p className="mb-4 text-red-800">{this.state.error?.message || 'Unknown error'}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()} 
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Refresh the page
            </button>
            <button 
              onClick={() => this.setState({ hasError: false })} 
              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Reset error state
            </button>
          </div>
          {this.props.showDetails && this.state.errorInfo && (
            <details className="mt-4 p-2 border border-gray-300 rounded bg-gray-50">
              <summary className="cursor-pointer text-sm text-gray-700">Error Details</summary>
              <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  showDetails: PropTypes.bool
};

ErrorBoundary.defaultProps = {
  showDetails: false
};

export default ErrorBoundary;