/**
 * Ransomware Detection System - Formatting Utilities
 * Functions for formatting dates, file sizes, numbers, and other display values
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

// ============================================================
// Date & Time Formatting
// ============================================================

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatString - Format pattern (default: 'MMM dd, yyyy HH:mm')
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy HH:mm') => {
  if (!date) return 'N/A'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    
    if (!isValid(dateObj)) {
      return 'Invalid Date'
    }
    
    return format(dateObj, formatString)
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid Date'
  }
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    
    if (!isValid(dateObj)) {
      return 'Invalid Date'
    }
    
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch (error) {
    console.error('Relative time formatting error:', error)
    return 'Invalid Date'
  }
}

/**
 * Format timestamp to short date (e.g., "Jan 15, 2024")
 * @param {string|Date} date - Date to format
 * @returns {string} Short date string
 */
export const formatShortDate = (date) => {
  return formatDate(date, 'MMM dd, yyyy')
}

/**
 * Format timestamp to full date (e.g., "January 15, 2024 10:30 AM")
 * @param {string|Date} date - Date to format
 * @returns {string} Full date string
 */
export const formatFullDate = (date) => {
  return formatDate(date, 'MMMM dd, yyyy hh:mm a')
}

/**
 * Format timestamp to time only (e.g., "10:30 AM")
 * @param {string|Date} date - Date to format
 * @returns {string} Time string
 */
export const formatTime = (date) => {
  return formatDate(date, 'hh:mm a')
}

/**
 * Format timestamp to ISO string
 * @param {string|Date} date - Date to format
 * @returns {string} ISO date string
 */
export const formatISODate = (date) => {
  if (!date) return null
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return dateObj.toISOString()
  } catch (error) {
    console.error('ISO date formatting error:', error)
    return null
  }
}

// ============================================================
// File Size Formatting
// ============================================================

/**
 * Format file size to human-readable string
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  if (bytes < 0) return 'Invalid Size'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  
  return `${value.toFixed(dm)} ${sizes[i]}`
}

/**
 * Format file size with color coding based on size
 * @param {number} bytes - Size in bytes
 * @returns {Object} { text, color, size }
 */
export const formatFileSizeWithColor = (bytes) => {
  const text = formatFileSize(bytes)
  let color = 'text-dark-600'
  
  // Color code based on size
  if (bytes < 1024 * 1024) {        // < 1 MB
    color = 'text-success-600'
  } else if (bytes < 10 * 1024 * 1024) {  // < 10 MB
    color = 'text-primary-600'
  } else if (bytes < 50 * 1024 * 1024) {  // < 50 MB
    color = 'text-warning-600'
  } else {                          // >= 50 MB
    color = 'text-danger-600'
  }
  
  return { text, color, size: bytes }
}

// ============================================================
// Number Formatting
// ============================================================

/**
 * Format number to percentage
 * @param {number} value - Value between 0 and 1
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {string} Formatted percentage (e.g., "95.5%")
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A'
  
  const percentage = value * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Format confidence score with color
 * @param {number} confidence - Confidence value (0-1)
 * @returns {Object} { text, color, value }
 */
export const formatConfidence = (confidence) => {
  if (confidence === null || confidence === undefined) {
    return { text: 'N/A', color: 'text-dark-500', value: 0 }
  }
  
  const percentage = (confidence * 100).toFixed(1)
  let color = 'text-dark-600'
  
  // Color code based on confidence
  if (confidence >= 0.9) {
    color = 'text-success-600 dark:text-success-400'
  } else if (confidence >= 0.7) {
    color = 'text-primary-600 dark:text-primary-400'
  } else if (confidence >= 0.5) {
    color = 'text-warning-600 dark:text-warning-400'
  } else {
    color = 'text-danger-600 dark:text-danger-400'
  }
  
  return { text: `${percentage}%`, color, value: confidence }
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "1,234,567")
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A'
  
  return num.toLocaleString()
}

/**
 * Format duration in seconds to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2.5s" or "1m 30s")
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0s'
  if (seconds < 0) return 'Invalid'
  
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  return `${hours}h ${remainingMinutes}m`
}

// ============================================================
// Status & Badge Formatting
// ============================================================

/**
 * Format prediction status with styling
 * @param {string} prediction - Prediction value (Safe/Malicious)
 * @returns {Object} { text, badge, icon, color }
 */
export const formatPrediction = (prediction) => {
  if (!prediction) {
    return {
      text: 'Unknown',
      badge: 'badge-primary',
      icon: '❓',
      color: 'text-dark-600',
    }
  }
  
  const pred = prediction.toLowerCase()
  
  if (pred === 'safe') {
    return {
      text: 'Safe',
      badge: 'badge-success',
      icon: '✅',
      color: 'text-success-600',
    }
  } else if (pred === 'malicious') {
    return {
      text: 'Malicious',
      badge: 'badge-danger',
      icon: '❌',
      color: 'text-danger-600',
    }
  } else {
    return {
      text: prediction,
      badge: 'badge-warning',
      icon: '⚠️',
      color: 'text-warning-600',
    }
  }
}

/**
 * Format risk level with styling
 * @param {string} riskLevel - Risk level (low/medium/high/critical)
 * @returns {Object} { text, badge, color }
 */
export const formatRiskLevel = (riskLevel) => {
  if (!riskLevel) {
    return {
      text: 'Unknown',
      badge: 'badge-primary',
      color: 'text-dark-600',
    }
  }
  
  const level = riskLevel.toLowerCase()
  
  switch (level) {
    case 'low':
      return {
        text: 'Low',
        badge: 'badge-success',
        color: 'text-success-600',
      }
    case 'medium':
      return {
        text: 'Medium',
        badge: 'badge-warning',
        color: 'text-warning-600',
      }
    case 'high':
      return {
        text: 'High',
        badge: 'badge-danger',
        color: 'text-danger-600',
      }
    case 'critical':
      return {
        text: 'Critical',
        badge: 'badge-danger glow-danger',
        color: 'text-danger-700',
      }
    default:
      return {
        text: riskLevel,
        badge: 'badge-primary',
        color: 'text-primary-600',
      }
  }
}

// ============================================================
// String Formatting
// ============================================================

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export const truncateString = (str, maxLength = 50, suffix = '...') => {
  if (!str) return ''
  if (str.length <= maxLength) return str
  
  return str.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Format file hash for display (shorten)
 * @param {string} hash - File hash
 * @param {number} length - Length to show (default: 16)
 * @returns {string} Shortened hash
 */
export const formatHash = (hash, length = 16) => {
  if (!hash) return 'N/A'
  if (hash.length <= length) return hash
  
  return `${hash.slice(0, length)}...`
}

/**
 * Format file type (remove dot, uppercase)
 * @param {string} fileType - File type with dot (e.g., ".exe")
 * @returns {string} Formatted type (e.g., "EXE")
 */
export const formatFileType = (fileType) => {
  if (!fileType) return 'Unknown'
  
  return fileType.replace('.', '').toUpperCase()
}

// ============================================================
// List Formatting
// ============================================================

/**
 * Format array to comma-separated string
 * @param {Array} arr - Array to format
 * @param {number} maxItems - Maximum items to show
 * @returns {string} Formatted string
 */
export const formatList = (arr, maxItems = 5) => {
  if (!arr || arr.length === 0) return 'None'
  
  if (arr.length <= maxItems) {
    return arr.join(', ')
  }
  
  const visible = arr.slice(0, maxItems)
  const remaining = arr.length - maxItems
  
  return `${visible.join(', ')} and ${remaining} more`
}

// ============================================================
// Combined Formatters
// ============================================================

/**
 * Format scan result for display
 * @param {Object} scan - Scan object
 * @returns {Object} Formatted scan data
 */
export const formatScanResult = (scan) => {
  if (!scan) return null
  
  return {
    id: scan.id || scan.scan_id,
    fileName: scan.file_name || 'Unknown',
    fileType: formatFileType(scan.file_type),
    fileSize: formatFileSize(scan.file_size),
    fileSizeColor: formatFileSizeWithColor(scan.file_size),
    prediction: formatPrediction(scan.prediction),
    confidence: formatConfidence(scan.confidence),
    riskLevel: formatRiskLevel(scan.risk_level),
    timestamp: formatDate(scan.timestamp),
    relativeTime: formatRelativeTime(scan.timestamp),
    duration: formatDuration(scan.scan_duration),
    hash: formatHash(scan.file_hash),
    hashFull: scan.file_hash,
  }
}

// ============================================================
// Validation & Safety
// ============================================================

/**
 * Safely format any value (fallback to string)
 * @param {any} value - Value to format
 * @returns {string} Formatted value
 */
export const formatSafe = (value) => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  
  return String(value)
}

// ============================================================
// Export all formatters
// ============================================================

export default {
  // Date & Time
  formatDate,
  formatRelativeTime,
  formatShortDate,
  formatFullDate,
  formatTime,
  formatISODate,
  
  // File Size
  formatFileSize,
  formatFileSizeWithColor,
  
  // Numbers
  formatPercentage,
  formatConfidence,
  formatNumber,
  formatDuration,
  
  // Status
  formatPrediction,
  formatRiskLevel,
  
  // Strings
  truncateString,
  capitalize,
  formatHash,
  formatFileType,
  formatList,
  
  // Combined
  formatScanResult,
  formatSafe,
}