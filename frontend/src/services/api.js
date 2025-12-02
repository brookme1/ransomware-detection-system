/**
 * Ransomware Detection System - API Service
 * Handles all HTTP requests to the backend API
 */

import axios from 'axios'

// API Base URL (from environment variable or default)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (for auth tokens, logging, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('📤 API Request:', config.method.toUpperCase(), config.url)
    }

    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor (for error handling, logging, etc.)
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('📥 API Response:', response.status, response.config.url)
    }
    return response
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      console.error('❌ API Error:', error.response.status, error.response.data)
      
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - Please login')
          // Redirect to login if needed
          break
        case 403:
          console.error('Forbidden - Insufficient permissions')
          break
        case 404:
          console.error('Not Found - Resource does not exist')
          break
        case 500:
          console.error('Server Error - Please try again later')
          break
        default:
          console.error('Error:', error.response.data?.detail || error.message)
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ Network Error: No response from server')
      console.error('Please check if the backend server is running')
    } else {
      // Something else went wrong
      console.error('❌ Error:', error.message)
    }

    return Promise.reject(error)
  }
)

// ============================================================
// API Functions
// ============================================================

/**
 * Upload and scan a file for ransomware
 * @param {File} file - File to scan
 * @param {Function} onUploadProgress - Progress callback
 * @returns {Promise} Scan result
 */
export const uploadFile = async (file, onUploadProgress) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/api/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onUploadProgress(percentCompleted)
        }
      },
    })

    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get all scan history
 * @param {number} limit - Maximum number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise} Array of scan results
 */
export const getScans = async (limit = 100, offset = 0) => {
  try {
    const response = await apiClient.get('/api/scans', {
      params: { limit, offset },
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get a specific scan by ID
 * @param {number|string} scanId - Scan ID
 * @returns {Promise} Scan details
 */
export const getScanById = async (scanId) => {
  try {
    const response = await apiClient.get(`/api/scan/${scanId}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Check backend health status
 * @returns {Promise} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/api/health')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get statistics (if endpoint exists)
 * @returns {Promise} Statistics data
 */
export const getStatistics = async () => {
  try {
    const response = await apiClient.get('/api/statistics')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Handle API errors and return user-friendly messages
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleApiError = (error) => {
  let errorMessage = 'An unexpected error occurred'
  let errorDetails = null

  if (error.response) {
    // Server responded with error
    errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage
    errorDetails = error.response.data
  } else if (error.request) {
    // No response from server
    errorMessage = 'Cannot connect to server. Please check if the backend is running.'
    errorDetails = {
      type: 'network_error',
      message: 'No response from server',
      url: API_BASE_URL,
    }
  } else {
    // Request setup error
    errorMessage = error.message
  }

  const apiError = new Error(errorMessage)
  apiError.details = errorDetails
  apiError.originalError = error

  return apiError
}

/**
 * Test API connection
 * @returns {Promise<boolean>} Connection status
 */
export const testConnection = async () => {
  try {
    await checkHealth()
    console.log('✅ Backend connection successful')
    return true
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message)
    return false
  }
}

/**
 * Get API configuration
 * @returns {Object} API configuration
 */
export const getApiConfig = () => {
  return {
    baseURL: API_BASE_URL,
    timeout: apiClient.defaults.timeout,
    environment: import.meta.env.MODE,
  }
}

// ============================================================
// Export API client for custom requests
// ============================================================

export default apiClient

// ============================================================
// Usage Examples (for documentation)
// ============================================================

/*
// Example 1: Upload file
const file = document.querySelector('input[type="file"]').files[0]
try {
  const result = await uploadFile(file, (progress) => {
    console.log(`Upload progress: ${progress}%`)
  })
  console.log('Scan result:', result)
} catch (error) {
  console.error('Upload failed:', error.message)
}

// Example 2: Get scan history
try {
  const history = await getScans(50, 0)
  console.log('Scan history:', history)
} catch (error) {
  console.error('Failed to fetch history:', error.message)
}

// Example 3: Get specific scan
try {
  const scan = await getScanById(123)
  console.log('Scan details:', scan)
} catch (error) {
  console.error('Failed to fetch scan:', error.message)
}

// Example 4: Check health
try {
  const health = await checkHealth()
  console.log('Backend health:', health)
} catch (error) {
  console.error('Health check failed:', error.message)
}

// Example 5: Test connection
const isConnected = await testConnection()
if (isConnected) {
  console.log('Backend is ready!')
}
*/