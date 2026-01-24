import * as React from 'react';

const defaultRenderError = () => <h1>Something went wrong.</h1>;

export interface ErrorBoundaryProps {
  name?: string;
  onError?: (error: Error) => void;
  renderError?: (error: Error) => React.ReactNode;
  children?: React.ReactNode;
}

export interface ErrorBoundaryState {
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static defaultProps = {
    renderError: defaultRenderError,
  };

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  state: ErrorBoundaryState = {};

  componentDidCatch(error: Error, errorInfo: unknown) {
    const message = this.props.name ? `[${this.props.name}] ${error.message}` : error.message;
    console.error(message, error, errorInfo);
    if (this.props.onError) this.props.onError(error);
  }

  render() {
    if (this.state.error && this.props.renderError) {
      return this.props.renderError(this.state.error);
    }
    return this.props.children;
  }
}
