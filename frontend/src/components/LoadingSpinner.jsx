/**
 * Ransomware Detection System - Loading Spinner Component
 * Displays loading states with various sizes and styles
 */

import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * LoadingSpinner Component
 * @param {string} size - Size variant: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @param {string} color - Color variant: 'primary' | 'white' | 'success' | 'danger' (default: 'primary')
 * @param {string} text - Optional loading text
 * @param {boolean} fullScreen - Show as full screen overlay
 * @param {string} className - Additional CSS classes
 */
function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text = null, 
  fullScreen = false,
  className = '' 
}) {
  
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  // Color classes
  const colorClasses = {
    primary: 'text-primary-500',
    white: 'text-white',
    success: 'text-success-500',
    danger: 'text-danger-500',
    warning: 'text-warning-500',
  }

  // Text size classes
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }

  const spinnerSize = sizeClasses[size] || sizeClasses.md
  const spinnerColor = colorClasses[color] || colorClasses.primary
  const textSize = textSizeClasses[size] || textSizeClasses.md

  // Full screen overlay variant
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-scale-in">
          <Loader2 className={`${sizeClasses.xl} ${spinnerColor} animate-spin`} />
          {text && (
            <p className="text-lg font-medium text-dark-900 dark:text-white">
              {text}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Inline variant
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Loader2 className={`${spinnerSize} ${spinnerColor} animate-spin`} />
      {text && (
        <span className={`${textSize} font-medium text-dark-700 dark:text-dark-300`}>
          {text}
        </span>
      )}
    </div>
  )
}

/**
 * LoadingDots Component - Alternative loading animation
 * Three animated dots
 */
export function LoadingDots({ color = 'primary', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }

  const colorClasses = {
    primary: 'bg-primary-500',
    white: 'bg-white',
    success: 'bg-success-500',
    danger: 'bg-danger-500',
  }

  const dotSize = sizeClasses[size] || sizeClasses.md
  const dotColor = colorClasses[color] || colorClasses.primary

  return (
    <div className="flex items-center gap-1.5">
      <div className={`${dotSize} ${dotColor} rounded-full animate-bounce`} 
           style={{ animationDelay: '0s' }} />
      <div className={`${dotSize} ${dotColor} rounded-full animate-bounce`} 
           style={{ animationDelay: '0.15s' }} />
      <div className={`${dotSize} ${dotColor} rounded-full animate-bounce`} 
           style={{ animationDelay: '0.3s' }} />
    </div>
  )
}

/**
 * LoadingProgress Component - Progress bar with percentage
 */
export function LoadingProgress({ 
  progress = 0, 
  text = 'Loading...', 
  showPercentage = true 
}) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
          {text}
        </span>
        {showPercentage && (
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="progress-bar">
        <div 
          className="progress-bar-fill bg-gradient-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

/**
 * LoadingSkeleton Component - Skeleton loader for content
 */
export function LoadingSkeleton({ 
  className = '', 
  variant = 'rectangular',
  count = 1 
}) {
  const variants = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
  }

  const skeletonClass = variants[variant] || variants.rectangular

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 dark:bg-dark-700 animate-pulse ${skeletonClass} ${className}`}
        />
      ))}
    </>
  )
}

/**
 * LoadingCard Component - Full card loading state
 */
export function LoadingCard({ rows = 3 }) {
  return (
    <div className="card space-y-4">
      <LoadingSkeleton className="h-6 w-3/4" />
      {[...Array(rows)].map((_, index) => (
        <LoadingSkeleton key={index} className="h-4" />
      ))}
    </div>
  )
}

/**
 * LoadingTable Component - Table skeleton loader
 */
export function LoadingTable({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4">
        {[...Array(columns)].map((_, index) => (
          <LoadingSkeleton key={index} className="h-8 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {[...Array(columns)].map((_, colIndex) => (
            <LoadingSkeleton key={colIndex} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * ScanningAnimation Component - Special animation for file scanning
 */
export function ScanningAnimation({ fileName = 'file' }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Animated scanner */}
      <div className="relative w-24 h-24">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-900 rounded-full" />
        
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
        
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-10 h-10 text-primary-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
            />
          </svg>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className="text-lg font-semibold text-dark-900 dark:text-white mb-1">
          Scanning File...
        </p>
        <p className="text-sm text-dark-600 dark:text-dark-400">
          {fileName}
        </p>
        <LoadingDots color="primary" size="sm" className="mt-2 justify-center" />
      </div>
    </div>
  )
}

export default LoadingSpinner