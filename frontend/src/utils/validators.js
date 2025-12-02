/**
 * Ransomware Detection System - File Validation Utilities
 * Validates files before upload to ensure security and compatibility
 */

// ============================================================
// Configuration
// ============================================================

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.exe', '.dll', '.js', '.vbs', '.ps1', '.zip', '.py']

// Maximum file size (100 MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100 MB in bytes

// Minimum file size (1 byte - must not be empty)
const MIN_FILE_SIZE = 1

// Dangerous file extensions (for warnings)
const DANGEROUS_EXTENSIONS = ['.exe', '.dll', '.vbs', '.ps1']

// MIME type whitelist
const ALLOWED_MIME_TYPES = [
  'application/x-msdownload',        // .exe
  'application/x-dosexec',           // .exe
  'application/x-executable',        // .exe
  'application/x-dll',               // .dll
  'application/javascript',          // .js
  'text/javascript',                 // .js
  'application/x-vbscript',          // .vbs
  'text/vbscript',                   // .vbs
  'application/x-powershell',        // .ps1
  'text/x-powershell',               // .ps1
  'application/zip',                 // .zip
  'application/x-zip-compressed',    // .zip
  'text/x-python',                   // .py
  'application/x-python-code',       // .py
  'application/octet-stream',        // Generic binary
]

// ============================================================
// File Validation Functions
// ============================================================

/**
 * Validate a file before upload
 * @param {File} file - File object to validate
 * @returns {Object} Validation result { valid, error, warnings }
 */
export const validateFile = (file) => {
  const result = {
    valid: false,
    error: null,
    warnings: [],
  }

  // Check if file exists
  if (!file) {
    result.error = 'No file selected'
    return result
  }

  // Validate file size
  const sizeValidation = validateFileSize(file.size)
  if (!sizeValidation.valid) {
    result.error = sizeValidation.error
    return result
  }

  // Validate file extension
  const extensionValidation = validateFileExtension(file.name)
  if (!extensionValidation.valid) {
    result.error = extensionValidation.error
    return result
  }

  // Add warnings for dangerous file types
  if (isDangerousFile(file.name)) {
    result.warnings.push(
      'This file type is potentially dangerous. Only upload if you trust the source.'
    )
  }

  // Validate file name
  const nameValidation = validateFileName(file.name)
  if (!nameValidation.valid) {
    result.error = nameValidation.error
    return result
  }

  // Validate MIME type (optional, as it can be spoofed)
  const mimeValidation = validateMimeType(file.type)
  if (!mimeValidation.valid) {
    result.warnings.push(
      `File type "${file.type}" may not be supported. Upload may fail.`
    )
  }

  // All validations passed
  result.valid = true
  return result
}

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {Object} Validation result
 */
export const validateFileSize = (size) => {
  if (!size || size < MIN_FILE_SIZE) {
    return {
      valid: false,
      error: 'File is empty or too small',
    }
  }

  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`,
    }
  }

  return { valid: true }
}

/**
 * Validate file extension
 * @param {string} filename - File name
 * @returns {Object} Validation result
 */
export const validateFileExtension = (filename) => {
  const extension = getFileExtension(filename)

  if (!extension) {
    return {
      valid: false,
      error: 'File has no extension',
    }
  }

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type "${extension}" is not supported. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Validate file name
 * @param {string} filename - File name
 * @returns {Object} Validation result
 */
export const validateFileName = (filename) => {
  if (!filename || filename.trim().length === 0) {
    return {
      valid: false,
      error: 'File name is empty',
    }
  }

  if (filename.length > 255) {
    return {
      valid: false,
      error: 'File name is too long (max 255 characters)',
    }
  }

  // Check for dangerous characters
  const dangerousChars = /[<>:"|?*\x00-\x1F]/
  if (dangerousChars.test(filename)) {
    return {
      valid: false,
      error: 'File name contains invalid characters',
    }
  }

  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return {
      valid: false,
      error: 'File name contains invalid path characters',
    }
  }

  return { valid: true }
}

/**
 * Validate MIME type
 * @param {string} mimeType - MIME type
 * @returns {Object} Validation result
 */
export const validateMimeType = (mimeType) => {
  // MIME type validation is optional as it can be spoofed
  // We use it as a secondary check
  
  if (!mimeType) {
    return { valid: true } // Allow if no MIME type
  }

  // Check if MIME type is in whitelist
  if (ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: true }
  }

  // Return warning but don't block
  return {
    valid: true,
    warning: `MIME type "${mimeType}" may not be supported`,
  }
}

/**
 * Validate multiple files
 * @param {FileList|Array} files - Files to validate
 * @returns {Object} Validation result
 */
export const validateFiles = (files) => {
  const results = []
  const errors = []
  const warnings = []

  if (!files || files.length === 0) {
    return {
      valid: false,
      error: 'No files selected',
      results: [],
    }
  }

  // Currently only support single file upload
  if (files.length > 1) {
    return {
      valid: false,
      error: 'Please upload only one file at a time',
      results: [],
    }
  }

  // Validate each file
  for (const file of files) {
    const result = validateFile(file)
    results.push({ file: file.name, ...result })

    if (!result.valid) {
      errors.push(`${file.name}: ${result.error}`)
    }

    if (result.warnings && result.warnings.length > 0) {
      warnings.push(...result.warnings.map(w => `${file.name}: ${w}`))
    }
  }

  return {
    valid: errors.length === 0,
    error: errors.length > 0 ? errors[0] : null,
    warnings,
    results,
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if file is a dangerous type
 * @param {string} filename - File name
 * @returns {boolean} True if dangerous
 */
export const isDangerousFile = (filename) => {
  const extension = getFileExtension(filename)
  return DANGEROUS_EXTENSIONS.includes(extension)
}

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension (lowercase with dot)
 */
export const getFileExtension = (filename) => {
  if (!filename) return ''
  
  const parts = filename.split('.')
  if (parts.length < 2) return ''
  
  return '.' + parts[parts.length - 1].toLowerCase()
}

/**
 * Format file size to human-readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Sanitize filename for safe display/storage
 * @param {string} filename - File name
 * @returns {string} Sanitized filename
 */
export const sanitizeFileName = (filename) => {
  if (!filename) return 'unnamed_file'
  
  // Remove path components
  filename = filename.split('/').pop().split('\\').pop()
  
  // Replace dangerous characters with underscores
  filename = filename.replace(/[<>:"|?*\x00-\x1F]/g, '_')
  
  // Remove leading/trailing dots and spaces
  filename = filename.replace(/^[.\s]+|[.\s]+$/g, '')
  
  // Limit length
  if (filename.length > 255) {
    const extension = getFileExtension(filename)
    const nameWithoutExt = filename.slice(0, filename.length - extension.length)
    filename = nameWithoutExt.slice(0, 250 - extension.length) + extension
  }
  
  return filename || 'unnamed_file'
}

/**
 * Check if file extension is allowed
 * @param {string} filename - File name
 * @returns {boolean} True if allowed
 */
export const isAllowedExtension = (filename) => {
  const extension = getFileExtension(filename)
  return ALLOWED_EXTENSIONS.includes(extension)
}

/**
 * Get allowed extensions list
 * @returns {Array} Array of allowed extensions
 */
export const getAllowedExtensions = () => {
  return [...ALLOWED_EXTENSIONS]
}

/**
 * Get maximum file size
 * @returns {number} Maximum file size in bytes
 */
export const getMaxFileSize = () => {
  return MAX_FILE_SIZE
}

/**
 * Get maximum file size formatted
 * @returns {string} Formatted maximum file size
 */
export const getMaxFileSizeFormatted = () => {
  return formatFileSize(MAX_FILE_SIZE)
}

/**
 * Detect if file is likely an archive bomb (zip bomb)
 * @param {File} file - File object
 * @returns {boolean} True if suspicious compression ratio
 */
export const isSuspiciousArchive = (file) => {
  // Basic check: if zip file is very small (< 1KB) but claims large size
  if (file.name.toLowerCase().endsWith('.zip') && file.size < 1024) {
    return true
  }
  
  // Additional checks would require actually reading the file
  return false
}

// ============================================================
// Export Configuration
// ============================================================

export const validationConfig = {
  allowedExtensions: ALLOWED_EXTENSIONS,
  maxFileSize: MAX_FILE_SIZE,
  minFileSize: MIN_FILE_SIZE,
  dangerousExtensions: DANGEROUS_EXTENSIONS,
  allowedMimeTypes: ALLOWED_MIME_TYPES,
}

// ============================================================
// Default Export
// ============================================================

export default {
  validateFile,
  validateFileSize,
  validateFileExtension,
  validateFileName,
  validateMimeType,
  validateFiles,
  isDangerousFile,
  getFileExtension,
  formatFileSize,
  sanitizeFileName,
  isAllowedExtension,
  getAllowedExtensions,
  getMaxFileSize,
  getMaxFileSizeFormatted,
  isSuspiciousArchive,
  validationConfig,
}