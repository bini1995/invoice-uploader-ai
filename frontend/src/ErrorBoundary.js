import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.lastPath = window.location.pathname;
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error', error, info);
  }

  componentDidUpdate() {
    if (this.state.hasError && this.lastPath !== window.location.pathname) {
      this.setState({ hasError: false });
      this.lastPath = window.location.pathname;
    }
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Try refreshing.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
