/**
 * Ransomware Detection System - Status Badge Component
 * Displays prediction status with icons and colors
 */

import React from 'react'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  AlertCircle,
  Shield,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react'

/**
 * StatusBadge Component
 * @param {string} prediction - Prediction status: 'Safe' | 'Malicious' | 'Unknown'
 * @param {number} confidence - Confidence score (0-1)
 * @param {string} riskLevel - Risk level: 'low' | 'medium' | 'high' | 'critical'
 * @param {boolean} showIcon - Show icon (default: true)
 * @param {boolean} showText - Show text (default: true)
 * @param {string} size - Size: 'sm' | 'md' | 'lg' (default: 'md')
 * @param {string} variant - Variant: 'default' | 'solid' | 'outline' (default: 'default')
 */
function StatusBadge({ 
  prediction, 
  confidence = null,
  riskLevel = null,
  showIcon = true,
  showText = true,
  size = 'md',
  variant = 'default'
}) {
  
  // Normalize prediction
  const pred = prediction?.toLowerCase()

  // Determine badge configuration
  let config = {
    text: 'Unknown',
    icon: AlertCircle,
    badge: 'badge-primary',
    color: 'text-primary-600',
    bgColor: 'bg-primary-100 dark:bg-primary-900/20',
    borderColor: 'border-primary-200 dark:border-primary-800',
    textColor: 'text-primary-700 dark:text-primary-300',
  }

  if (pred === 'safe') {
    config = {
      text: 'Safe',
      icon: confidence && confidence >= 0.95 ? ShieldCheck : CheckCircle,
      badge: 'badge-success',
      color: 'text-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900/20',
      borderColor: 'border-success-200 dark:border-success-800',
      textColor: 'text-success-700 dark:text-success-300',
    }
  } else if (pred === 'malicious') {
    // Determine icon based on risk level or confidence
    let Icon = XCircle
    if (riskLevel === 'critical' || (confidence && confidence >= 0.9)) {
      Icon = ShieldAlert
    }

    config = {
      text: 'Malicious',
      icon: Icon,
      badge: 'badge-danger',
      color: 'text-danger-600',
      bgColor: 'bg-danger-100 dark:bg-danger-900/20',
      borderColor: 'border-danger-200 dark:border-danger-800',
      textColor: 'text-danger-700 dark:text-danger-300',
    }
  } else if (pred === 'warning' || pred === 'suspicious') {
    config = {
      text: 'Suspicious',
      icon: AlertTriangle,
      badge: 'badge-warning',
      color: 'text-warning-600',
      bgColor: 'bg-warning-100 dark:bg-warning-900/20',
      borderColor: 'border-warning-200 dark:border-warning-800',
      textColor: 'text-warning-700 dark:text-warning-300',
    }
  }

  const Icon = config.icon

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'px-2 py-0.5 text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      container: 'px-3 py-1 text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      container: 'px-4 py-1.5 text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  }

  const sizeConfig = sizeClasses[size] || sizeClasses.md

  // Variant styles
  let variantClasses = ''
  
  if (variant === 'solid') {
    // Solid background with white text
    variantClasses = `${config.color.replace('text-', 'bg-').replace('-600', '-500')} text-white border-transparent`
  } else if (variant === 'outline') {
    // Outline with colored border
    variantClasses = `bg-transparent ${config.borderColor} ${config.textColor} border-2`
  } else {
    // Default - light background with colored text
    variantClasses = `${config.bgColor} ${config.borderColor} ${config.textColor} border`
  }

  // Add glow effect for critical threats
  const glowClass = (pred === 'malicious' && (riskLevel === 'critical' || (confidence && confidence >= 0.9))) 
    ? 'shadow-glow-danger' 
    : ''

  return (
    <span 
      className={`
        inline-flex items-center ${sizeConfig.gap} ${sizeConfig.container}
        rounded-full font-medium
        ${variantClasses}
        ${glowClass}
        transition-all duration-200
      `}
      title={confidence ? `Confidence: ${(confidence * 100).toFixed(1)}%` : undefined}
    >
      {showIcon && <Icon className={sizeConfig.icon} />}
      {showText && <span>{config.text}</span>}
    </span>
  )
}

/**
 * RiskLevelBadge Component
 * Displays risk level with appropriate styling
 */
export function RiskLevelBadge({ 
  riskLevel, 
  size = 'md',
  showIcon = true 
}) {
  const risk = riskLevel?.toLowerCase()

  let config = {
    text: 'Unknown',
    icon: Shield,
    badge: 'badge-primary',
  }

  if (risk === 'low') {
    config = {
      text: 'Low Risk',
      icon: Shield,
      badge: 'badge-success',
    }
  } else if (risk === 'medium') {
    config = {
      text: 'Medium Risk',
      icon: AlertCircle,
      badge: 'badge-warning',
    }
  } else if (risk === 'high') {
    config = {
      text: 'High Risk',
      icon: AlertTriangle,
      badge: 'badge-danger',
    }
  } else if (risk === 'critical') {
    config = {
      text: 'Critical',
      icon: ShieldAlert,
      badge: 'badge-danger glow-danger',
    }
  }

  const Icon = config.icon

  const sizeClasses = {
    sm: { container: 'text-xs', icon: 'w-3 h-3' },
    md: { container: 'text-sm', icon: 'w-4 h-4' },
    lg: { container: 'text-base', icon: 'w-5 h-5' },
  }

  const sizeConfig = sizeClasses[size] || sizeClasses.md

  return (
    <span className={`badge ${config.badge} ${sizeConfig.container}`}>
      {showIcon && <Icon className={sizeConfig.icon} />}
      <span>{config.text}</span>
    </span>
  )
}

/**
 * ConfidenceBadge Component
 * Displays confidence score with color coding
 */
export function ConfidenceBadge({ 
  confidence, 
  size = 'md',
  showLabel = false 
}) {
  if (confidence === null || confidence === undefined) {
    return <span className="badge badge-primary">N/A</span>
  }

  const percentage = (confidence * 100).toFixed(1)
  
  // Color based on confidence level
  let badge = 'badge-primary'
  if (confidence >= 0.9) {
    badge = 'badge-success'
  } else if (confidence >= 0.7) {
    badge = 'badge-primary'
  } else if (confidence >= 0.5) {
    badge = 'badge-warning'
  } else {
    badge = 'badge-danger'
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <span className={`badge ${badge} ${sizeClasses[size]}`}>
      {showLabel && <span className="font-normal">Confidence: </span>}
      <span className="font-semibold">{percentage}%</span>
    </span>
  )
}

/**
 * FileTypeBadge Component
 * Displays file type with icon
 */
export function FileTypeBadge({ fileType, size = 'md' }) {
  const type = fileType?.toUpperCase().replace('.', '')

  // Color coding by file type danger level
  let badge = 'badge-primary'
  const dangerousTypes = ['EXE', 'DLL', 'VBS', 'PS1']
  
  if (dangerousTypes.includes(type)) {
    badge = 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300 border border-danger-200 dark:border-danger-800'
  } else {
    badge = 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return (
    <span className={`inline-flex items-center rounded ${badge} ${sizeClasses[size]} font-mono font-semibold`}>
      {type || 'Unknown'}
    </span>
  )
}

export default StatusBadge