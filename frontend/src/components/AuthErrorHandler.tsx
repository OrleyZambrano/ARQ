import React from 'react';
import { clearAuthStorage } from '../utils/authUtils';

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

interface AuthErrorHandlerState {
  hasError: boolean;
  error: Error | null;
}

class AuthErrorHandler extends React.Component<AuthErrorHandlerProps, AuthErrorHandlerState> {
  constructor(props: AuthErrorHandlerProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AuthErrorHandlerState {
    // Verifica si es un error de autenticación
    if (error.message?.includes('refresh') || 
        error.message?.includes('token') || 
        error.message?.includes('auth')) {
      clearAuthStorage();
      return { hasError: true, error };
    }
    return { hasError: false, error: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (error.message?.includes('refresh') || 
        error.message?.includes('token') || 
        error.message?.includes('auth')) {
      console.error('Auth error caught:', error, errorInfo);
      clearAuthStorage();
    }
  }

  handleRetry = () => {
    clearAuthStorage();
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Error de Sesión
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Tu sesión ha expirado. Por favor, recarga la página para continuar.
                </p>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={this.handleRetry}
                >
                  Recargar Página
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorHandler;
