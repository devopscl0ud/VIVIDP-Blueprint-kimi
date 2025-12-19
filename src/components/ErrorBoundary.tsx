import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch React errors and display a fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-deep-space flex items-center justify-center p-4">
                    <div className="glass max-w-md w-full p-8 rounded-xl text-center">
                        <div className="text-6xl mb-4">💥</div>
                        <h1 className="text-2xl font-bold mb-2 text-white">Something went wrong</h1>
                        <p className="text-gray-400 mb-6">
                            An unexpected error occurred. We've been notified and are working on a fix.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                                <p className="text-red-400 font-mono text-sm break-all">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-32">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
