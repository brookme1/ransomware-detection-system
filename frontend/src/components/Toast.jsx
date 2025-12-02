/**
 * Ransomware Detection System - Toast Notification Component
 * Displays temporary notification messages with different types
 */

import React, { useEffect, useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react'

/**
 * Toast Component
 * @param {string} type - Toast type: 'success' | 'error' | 'warning' | 'info'
 * @param {string} message - Toast message text
 * @param {number} duration - Auto-dismiss duration in ms (default: 3000)
 * @param {Function} onClose - Callback when toast is closed
 * @param {boolean} closable - Show close button (default: true)
 * @param {string} position - Position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' (default: 'top-right')
 */
function Toast({ 
  type = 'info', 
  message, 
  duration = 3000, 
  onClose, 
  closable = true,
  position = 'top-right'
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Auto-dismiss after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, 300) // Wait for animation to complete
  }

  if (!isVisible) return null

  // Toast configurations by type
  const toastConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success-50 dark:bg-success-900/20',
      borderColor: 'border-success-200 dark:border-success-800',
      textColor: 'text-success-800 dark:text-success-200',
      iconColor: 'text-success-600 dark:text-success-400',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-danger-50 dark:bg-danger-900/20',
      borderColor: 'border-danger-200 dark:border-danger-800',
      textColor: 'text-danger-800 dark:text-danger-200',
      iconColor: 'text-danger-600 dark:text-danger-400',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning-50 dark:bg-warning-900/20',
      borderColor: 'border-warning-200 dark:border-warning-800',
      textColor: 'text-warning-800 dark:text-warning-200',
      iconColor: 'text-warning-600 dark:text-warning-400',
    },
    info: {
      icon: Info,
      bgColor: 'bg-primary-50 dark:bg-primary-900/20',
      borderColor: 'border-primary-200 dark:border-primary-800',
      textColor: 'text-primary-800 dark:text-primary-200',
      iconColor: 'text-primary-600 dark:text-primary-400',
    },
  }

  const config = toastConfig[type] || toastConfig.info
  const Icon = config.icon

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  return (
    <div
      className={`
        fixed ${positionClasses[position]} z-50
        ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`
          ${config.bgColor} ${config.borderColor} ${config.textColor}
          border rounded-lg shadow-lg
          px-4 py-3 pr-8
          min-w-[300px] max-w-[500px]
          flex items-start gap-3
        `}
      >
        {/* Icon */}
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Close button */}
        {closable && (
          <button
            onClick={handleClose}
            className={`
              ${config.iconColor} hover:opacity-70
              transition-opacity
              absolute top-3 right-3
            `}
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * ToastContainer Component
 * Manages multiple toast notifications in a stack
 */
export function ToastContainer({ toasts = [], onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          closable={toast.closable}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

/**
 * useToast Hook
 * Custom hook for managing toast notifications
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = (type, message, duration = 3000) => {
    const id = Date.now()
    const newToast = { id, type, message, duration, closable: true }
    
    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id)
    }, duration + 300) // Extra time for animation
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const success = (message, duration) => showToast('success', message, duration)
  const error = (message, duration) => showToast('error', message, duration)
  const warning = (message, duration) => showToast('warning', message, duration)
  const info = (message, duration) => showToast('info', message, duration)

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
  }
}

// Add custom animations to index.css or include here
const style = document.createElement('style')
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .animate-slide-in-right {
    animation: slideInRight 0.3s ease-out;
  }

  .animate-slide-out-right {
    animation: slideOutRight 0.3s ease-out;
  }
`
if (typeof document !== 'undefined') {
  document.head.appendChild(style)
}

export default Toast