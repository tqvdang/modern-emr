export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp: Date;
  requestId?: string;
  userId?: string;
  context?: Record<string, any>;
}

export class AppError extends Error {
  public readonly code?: string;
  public readonly statusCode: number;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly userId?: string;
  public readonly context?: Record<string, any>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    this.context = context;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorInfo {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      requestId: this.requestId,
      userId: this.userId,
      context: this.context
    };
  }
}

export class ValidationError extends AppError {
  public readonly validationErrors: Record<string, string[]>;

  constructor(message: string, validationErrors: Record<string, string[]>, context?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', true, context);
    this.validationErrors = validationErrors;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed', context?: Record<string, any>) {
    super(message, 0, 'NETWORK_ERROR', true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, 401, 'AUTH_ERROR', true, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, any>) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', context?: Record<string, any>) {
    super(`${resource} not found`, 404, 'NOT_FOUND', true, context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', context?: Record<string, any>) {
    super(message, 409, 'CONFLICT_ERROR', true, context);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context?: Record<string, any>) {
    super(message, 429, 'RATE_LIMIT', true, context);
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error', context?: Record<string, any>) {
    super(message, 500, 'SERVER_ERROR', false, context);
  }
}

// Error handling utilities
export class ErrorHandler {
  private static errorReportingService?: (error: AppError) => Promise<void>;
  private static userNotificationService?: (message: string, type: 'error' | 'warning') => void;

  static setErrorReportingService(service: (error: AppError) => Promise<void>) {
    this.errorReportingService = service;
  }

  static setUserNotificationService(service: (message: string, type: 'error' | 'warning') => void) {
    this.userNotificationService = service;
  }

  static async handleError(error: unknown): Promise<AppError> {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = this.convertToAppError(error);
    } else {
      appError = new AppError('An unknown error occurred', 500, 'UNKNOWN_ERROR', false);
    }

    // Log error
    this.logError(appError);

    // Report to external service if available
    if (this.errorReportingService && !appError.isOperational) {
      try {
        await this.errorReportingService(appError);
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError);
      }
    }

    // Show user notification
    this.notifyUser(appError);

    return appError;
  }

  private static convertToAppError(error: Error): AppError {
    // Handle fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new NetworkError('Unable to connect to server. Please check your internet connection.');
    }

    // Handle specific error types
    if (error.message.includes('401')) {
      return new AuthenticationError('Your session has expired. Please log in again.');
    }

    if (error.message.includes('403')) {
      return new AuthorizationError('You do not have permission to perform this action.');
    }

    if (error.message.includes('404')) {
      return new NotFoundError('The requested resource was not found.');
    }

    if (error.message.includes('409')) {
      return new ConflictError('The resource already exists or there is a conflict.');
    }

    if (error.message.includes('429')) {
      return new RateLimitError('Too many requests. Please wait before trying again.');
    }

    // Default to server error
    return new ServerError(error.message || 'An unexpected error occurred');
  }

  private static logError(error: AppError) {
    const logLevel = error.statusCode >= 500 ? 'error' : 'warn';
    const logData = {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      stack: error.stack,
      context: error.context
    };

    if (logLevel === 'error') {
      console.error('Application Error:', logData);
    } else {
      console.warn('Application Warning:', logData);
    }
  }

  private static notifyUser(error: AppError) {
    if (!this.userNotificationService) return;

    let userMessage: string;
    let type: 'error' | 'warning' = 'error';

    switch (error.code) {
      case 'VALIDATION_ERROR':
        userMessage = 'Please check your input and try again.';
        type = 'warning';
        break;
      case 'NETWORK_ERROR':
        userMessage = 'Connection problem. Please check your internet connection.';
        break;
      case 'AUTH_ERROR':
        userMessage = 'Please log in to continue.';
        break;
      case 'AUTHORIZATION_ERROR':
        userMessage = 'You do not have permission to perform this action.';
        type = 'warning';
        break;
      case 'NOT_FOUND':
        userMessage = 'The requested item was not found.';
        type = 'warning';
        break;
      case 'RATE_LIMIT':
        userMessage = 'Too many requests. Please wait before trying again.';
        type = 'warning';
        break;
      default:
        userMessage = error.isOperational 
          ? error.message 
          : 'Something went wrong. Our team has been notified.';
    }

    this.userNotificationService(userMessage, type);
  }

  static createErrorBoundary(fallbackComponent: React.ComponentType<{ error: AppError }>) {
    return class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { error: AppError | null }
    > {
      constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { error: null };
      }

      static getDerivedStateFromError(error: Error): { error: AppError } {
        return { error: ErrorHandler.convertToAppError(error) };
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        ErrorHandler.handleError(error);
      }

      render() {
        if (this.state.error) {
          return React.createElement(fallbackComponent, { error: this.state.error });
        }

        return this.props.children;
      }
    };
  }
}

// Async error handling wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      await ErrorHandler.handleError(error);
      return null;
    }
  };
}

// React hook for error handling
export function useErrorHandler() {
  const handleError = async (error: unknown) => {
    return await ErrorHandler.handleError(error);
  };

  const handleAsyncOperation = async <T>(
    operation: () => Promise<T>,
    onError?: (error: AppError) => void
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      const appError = await handleError(error);
      onError?.(appError);
      return null;
    }
  };

  return { handleError, handleAsyncOperation };
}