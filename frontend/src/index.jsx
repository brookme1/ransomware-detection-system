/**
 * Ransomware Detection System - React Entry Point
 * Initializes React app and renders to DOM
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Error boundary component for catching React errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-danger-600 dark:text-danger-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
              
              {/* Error Message */}
              <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-dark-600 dark:text-dark-300 mb-6">
                The application encountered an unexpected error.
              </p>
              
              {/* Error Details (Development only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-gray-100 dark:bg-dark-900 rounded-lg p-4 mb-4 text-left">
                  <p className="font-mono text-sm text-danger-600 dark:text-danger-400 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-dark-600 dark:text-dark-400">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-dark-600 dark:text-dark-400 overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              {/* Reload Button */}
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary w-full"
              >
                Reload Application
              </button>
              
              {/* Contact Support */}
              <p className="mt-4 text-sm text-dark-500 dark:text-dark-400">
                If this problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Render React app to DOM
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)

// Hot Module Replacement (HMR) for development
if (import.meta.hot) {
  import.meta.hot.accept()
}

// Log app initialization (development only)
if (import.meta.env.DEV) {
  console.log('🚀 Ransomware Detection System initialized')
  console.log('📊 Environment:', import.meta.env.MODE)
  console.log('🔗 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000')
}

// Performance monitoring (optional)
if (import.meta.env.PROD) {
  // Report Web Vitals in production
  if ('web-vitals' in window) {
    const reportWebVitals = (metric) => {
      console.log(metric)
      // Send to analytics service
      // Example: analytics.track('Web Vitals', metric)
    }
    
    // Uncomment to enable Web Vitals tracking
    // import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    //   getCLS(reportWebVitals)
    //   getFID(reportWebVitals)
    //   getFCP(reportWebVitals)
    //   getLCP(reportWebVitals)
    //   getTTFB(reportWebVitals)
    // })
  }
}

// Service Worker registration (for PWA)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration)
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error)
      })
  })
}

// Handle offline/online events
window.addEventListener('online', () => {
  console.log('🌐 Connection restored')
  // Show toast notification: "You're back online"
})

window.addEventListener('offline', () => {
  console.log('📡 Connection lost')
  // Show toast notification: "You're offline"
})

// Prevent default drag and drop on document (security)
document.addEventListener('dragover', (e) => {
  e.preventDefault()
})

document.addEventListener('drop', (e) => {
  e.preventDefault()
})

// Log unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // Send to error tracking service
  // Example: Sentry.captureException(event.reason)
})

// Keyboard shortcuts (optional)
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K - Focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    // Implement search focus logic
    console.log('Search shortcut triggered')
  }
  
  // Ctrl/Cmd + / - Show keyboard shortcuts
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault()
    console.log('Keyboard shortcuts help')
  }
})