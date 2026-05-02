import * as React from 'react';
import type {FallbackProps} from './Fallback';

const LazyFallback = React.lazy(
  () => import(/* webpackChunkName: "error-boundary-fallback" */ './Fallback'),
);

export interface ErrorBoundaryProps {
  /**
   * Optional name for the error boundary, used in console logs to make the
   * source of the error easier to identify.
   */
  name?: string;
  /**
   * Optional callback invoked when an error is caught. Useful for sending
   * errors to a monitoring service.
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /**
   * Custom render function for the error state. Receives the error and a
   * `reset` callback that clears the error state and re-renders children.
   */
  renderError?: (error: Error, reset: () => void) => React.ReactNode;
  /**
   * If `true`, renders a more compact fallback suitable for inline use.
   */
  compact?: boolean;
  /**
   * Hide the entire fallback (render `null`). Useful for non-critical UI
   * that should silently disappear on failure rather than show an error.
   */
  silent?: boolean;
  /**
   * If the value of this prop changes, the error state resets and children
   * re-render. Useful for re-trying when underlying inputs change.
   */
  resetKey?: unknown;
  children?: React.ReactNode;
}

export interface ErrorBoundaryState {
  error?: Error;
}

const printDebugHelp = (name: string | undefined, error: Error, errorInfo: React.ErrorInfo): void => {
  const label = name ? `[ErrorBoundary:${name}]` : '[ErrorBoundary]';
  const tag = '%c' + label;
  const tagStyle = 'background:#c33;color:#fff;padding:1px 6px;border-radius:3px;font-weight:bold;';
  console.error(tag, tagStyle, error?.message ?? error);
  if (error?.stack) console.error(error.stack);
  if (errorInfo?.componentStack) console.error('Component stack:', errorInfo.componentStack);
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {error};
  }

  state: ErrorBoundaryState = {};

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    printDebugHelp(this.props.name, error, errorInfo);
    try {
      this.props.onError?.(error, errorInfo);
    } catch {}
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({error: undefined});
  };

  render(): React.ReactNode {
    const {error} = this.state;
    if (!error) return this.props.children;
    if (this.props.silent) return null;
    if (this.props.renderError) return this.props.renderError(error, this.reset);
    const fallbackProps: FallbackProps = {
      name: this.props.name,
      compact: this.props.compact,
      error,
      reset: this.reset,
    };
    return (
      <React.Suspense fallback={null}>
        <LazyFallback {...fallbackProps} />
      </React.Suspense>
    );
  }
}
