import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-6 text-center space-y-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">画面の表示で問題が発生しました</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              アプリ全体が停止しないよう保護しました。ページを再読み込みしてください。
            </p>
            {this.state.message && (
              <p className="text-xs text-red-600 dark:text-red-400 break-words">{this.state.message}</p>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full bg-primary-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-primary-700 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
