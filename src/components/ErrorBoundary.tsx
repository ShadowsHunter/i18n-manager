import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-background rounded-xl border border-error/30">
        {/* <div className="w-16 h-16 text-error mb-4"/> */}
        <div className="w-16 h-16 text-error mb-4">
          <AlertTriangle className="w-full h-full" />
        </div>

        <h2 className="text-2xl font-semibold text-text mb-2">
          Something went wrong
        </h2>

        <p className="text-text/70 text-center max-w-md mb-6">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <button
          onClick={this.handleReset}
          className="px-6 py-3 bg-cta text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
        >
          Try Again
        </button>

        {import.meta.env.DEV && (
          <details className="mt-6 w-full max-w-lg">
            <summary className="cursor-pointer text-sm text-text/50 hover:text-cta mb-2">
              Error Details
            </summary>
            <pre className="text-xs text-text/40 bg-secondary/50 p-4 rounded-lg overflow-auto">
              {error?.stack}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
