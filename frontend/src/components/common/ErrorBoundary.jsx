import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Automatically reload on chunk loading error if not reloaded yet
    const errorStr = String(error?.message || error || '');
    const isChunkError = errorStr.includes('Failed to fetch dynamically imported module') ||
                         errorStr.includes('Failed to load module script') ||
                         errorStr.includes('Unexpected token');
    
    if (isChunkError) {
      const reloaded = sessionStorage.getItem('cocoveera_eb_chunk_retry') === 'true';
      if (!reloaded) {
        sessionStorage.setItem('cocoveera_eb_chunk_retry', 'true');
        console.warn('ErrorBoundary detected stale chunk loading error. Auto refreshing...');
        window.location.reload();
      }
    }
  }

  handleReset = () => {
    sessionStorage.removeItem('cocoveera_eb_chunk_retry');
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-6 text-center bg-white rounded-[24px] border border-stone-200 shadow-sm my-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="font-poppins font-extrabold text-stone-900 text-lg mb-2">Something went wrong</h3>
          <p className="text-stone-500 text-sm max-w-md mb-6 font-medium">
            An unexpected error occurred in this section of the page. You can try reloading or resetting the view.
          </p>
          <button
            onClick={this.handleReset}
            className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-xs font-bold py-3 px-6 rounded-[14px] transition-all shadow-md shadow-[#2E7D32]/10"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
