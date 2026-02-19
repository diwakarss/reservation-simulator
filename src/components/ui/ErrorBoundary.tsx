'use client';

/**
 * ErrorBoundary
 *
 * Catches React errors and displays a fallback UI instead of crashing.
 * Provides a "Try Again" button to reset the error state.
 */

import React, { Component, ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Optional fallback UI (defaults to built-in error display) */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-deep-purple p-4">
          <div className="max-w-md text-center">
            <div className="mb-6">
              <span className="text-6xl">⚠️</span>
            </div>

            <h2 className="mb-4 font-orbitron text-2xl font-bold text-highlight-red">
              Something went wrong
            </h2>

            <p className="mb-6 font-rajdhani text-muted-text">
              The simulation encountered an unexpected error.
              Your progress may have been saved automatically.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer font-rajdhani text-sm text-muted-text/60 hover:text-muted-text">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-highlight-red">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="primary" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="ghost" onClick={this.handleReload}>
                Reload Page
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-text/40">
              If this keeps happening, try clearing your browser cache.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
