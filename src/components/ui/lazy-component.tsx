"use client";

import React, { Suspense, ComponentType, useState, useEffect } from "react";
import { Spinner } from "@/components/loading/spinner";

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  timeout?: number;
  onError?: (error: Error) => void;
}

/**
 * LazyComponent wrapper that handles:
 * - Lazy loading with timeout
 * - Error boundary for failed loads
 * - Retry functionality
 *
 * Requirement 20.10: Show error with retry if lazy component fails to load within 10s
 */
export function LazyComponent({
  children,
  fallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner size="lg" />
    </div>
  ),
  timeout = 10000,
  onError,
}: LazyComponentProps) {
  const [hasError, setHasError] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    // Set timeout for lazy component loading
    const timeoutId = setTimeout(() => {
      setIsTimeout(true);
      setHasError(true);
      onError?.(new Error("Component failed to load within timeout"));
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [timeout, onError]);

  const handleRetry = () => {
    setHasError(false);
    setIsTimeout(false);
    // Force reload by reloading the page
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6 text-center">
        <div className="text-destructive">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {isTimeout ? "Component Load Timeout" : "Failed to Load Component"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isTimeout
              ? "The component took too long to load. Please check your connection and try again."
              : "An error occurred while loading this component."}
          </p>
        </div>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          aria-label="Retry loading component"
        >
          Retry
        </button>
      </div>
    );
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
}

/**
 * Error boundary for catching component load errors
 */
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    onError?: (error: Error) => void;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6 text-center">
          <div className="text-destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Component Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              An error occurred while loading this component.
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            aria-label="Retry loading component"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export { LazyErrorBoundary };
