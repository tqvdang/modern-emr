import React from 'react';
import { AppError } from '@/lib/errorHandling';

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: AppError; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = error instanceof AppError 
      ? error 
      : new AppError(error.message || 'An unexpected error occurred', 500, 'UNKNOWN_ERROR', false);
    
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return React.createElement(this.props.fallback, { 
          error: this.state.error, 
          retry: this.retry 
        });
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: AppError;
  retry: () => void;
}

export function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  const getErrorIcon = (statusCode: number) => {
    if (statusCode >= 500) {
      return (
        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }

    return (
      <svg className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getErrorTitle = (statusCode: number, code?: string) => {
    switch (code) {
      case 'NETWORK_ERROR': return 'Connection Problem';
      case 'AUTH_ERROR': return 'Authentication Required';
      case 'AUTHORIZATION_ERROR': return 'Access Denied';
      case 'NOT_FOUND': return 'Not Found';
      case 'VALIDATION_ERROR': return 'Invalid Data';
      case 'RATE_LIMIT': return 'Too Many Requests';
      default:
        if (statusCode >= 500) return 'Server Error';
        if (statusCode >= 400) return 'Client Error';
        return 'Something Went Wrong';
    }
  };

  const getErrorMessage = (error: AppError) => {
    if (error.isOperational) {
      return error.message;
    }
    return 'An unexpected error occurred. Our team has been notified and is working to fix this issue.';
  };

  const getRetryMessage = (code?: string) => {
    switch (code) {
      case 'NETWORK_ERROR': 
        return 'Check your internet connection and try again.';
      case 'RATE_LIMIT': 
        return 'Please wait a moment before trying again.';
      default: 
        return 'Please try again or contact support if the problem persists.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            {getErrorIcon(error.statusCode)}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {getErrorTitle(error.statusCode, error.code)}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
          
          {error.code && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-xs text-gray-500">Error Code: {error.code}</p>
              {error.timestamp && (
                <p className="text-xs text-gray-500">
                  Time: {error.timestamp.toLocaleString()}
                </p>
              )}
            </div>
          )}
          
          <p className="mt-4 text-sm text-gray-500">
            {getRetryMessage(error.code)}
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={retry}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Homepage
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh Page
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact support at{' '}
            <a href="mailto:support@emr.com" className="text-blue-600 hover:text-blue-800">
              support@emr.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Simplified error boundary for specific components
export function ComponentErrorBoundary({ 
  children, 
  componentName = 'Component' 
}: { 
  children: React.ReactNode; 
  componentName?: string; 
}) {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {componentName} Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={retry}
                  className="text-sm bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded-md"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}