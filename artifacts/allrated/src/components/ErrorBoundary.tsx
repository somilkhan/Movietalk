import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: send to Sentry/Datadog in production
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex flex-col items-center justify-center bg-[#07070b] text-white px-6 text-center">
            <h1 className="font-display text-4xl mb-4">Something went wrong</h1>
            <p className="text-white/50 mb-6 max-w-md">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full bg-[#4752c4] text-black font-semibold hover:bg-[#3d47b0] transition-colors"
            >
              Reload Page
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
