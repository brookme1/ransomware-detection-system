/**
 * Ransomware Detection System - File Upload Component
 * Drag-and-drop file upload with validation and progress tracking
 */

import React, { useState, useRef } from 'react'
import { Upload, File, X, AlertTriangle } from 'lucide-react'
import { validateFile, formatFileSize, getAllowedExtensions } from '@utils/validators'
import { LoadingProgress, ScanningAnimation } from './LoadingSpinner'

/**
 * FileUpload Component
 * @param {Function} onFileSelect - Callback when file is selected
 * @param {Function} onUpload - Callback to handle file upload
 * @param {Function} onCancel - Callback when upload is cancelled
 * @param {boolean} uploading - Upload in progress state
 * @param {number} progress - Upload progress (0-100)
 * @param {string} status - Current status message
 */
function FileUpload({ 
  onFileSelect,
  onUpload,
  onCancel,
  uploading = false,
  progress = 0,
  status = ''
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState([])
  const [warnings, setWarnings] = useState([])
  const fileInputRef = useRef(null)

  // Handle file selection (from input or drag-drop)
  const handleFileSelection = (file) => {
    if (!file) return

    // Validate file
    const validation = validateFile(file)
    
    if (!validation.valid) {
      setErrors([validation.error])
      setWarnings([])
      setSelectedFile(null)
      if (onFileSelect) onFileSelect(null)
      return
    }

    // Set warnings if any
    setWarnings(validation.warnings || [])
    setErrors([])
    
    // Set selected file
    setSelectedFile(file)
    if (onFileSelect) onFileSelect(file)
  }

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    handleFileSelection(file)
  }

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  // Handle click to browse
  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  // Handle remove file
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setErrors([])
    setWarnings([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onFileSelect) onFileSelect(null)
  }

  // Handle upload button click
  const handleUploadClick = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile)
    }
  }

  // Handle cancel upload
  const handleCancelUpload = () => {
    if (onCancel) onCancel()
  }

  // Get allowed extensions for display
  const allowedExtensions = getAllowedExtensions().join(', ')

  // Show scanning animation when uploading
  if (uploading && progress > 0) {
    return (
      <div className="card">
        <ScanningAnimation fileName={selectedFile?.name || 'file'} />
        
        <LoadingProgress 
          progress={progress}
          text={status || 'Uploading and scanning file...'}
          showPercentage={true}
        />
        
        <button 
          onClick={handleCancelUpload}
          className="btn btn-secondary w-full mt-4"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Upload Zone */}
      {!selectedFile ? (
        <div
          className={`
            upload-zone
            ${dragActive ? 'upload-zone-active' : ''}
            ${errors.length > 0 ? 'border-danger-300 dark:border-danger-700' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          {/* Upload Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>

          {/* Upload Text */}
          <div className="text-center">
            <p className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
              {dragActive ? 'Drop file here' : 'Upload File for Scanning'}
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400 mb-1">
              Drag and drop or <span className="text-primary-600 dark:text-primary-400 font-medium">browse</span>
            </p>
            <p className="text-xs text-dark-500 dark:text-dark-500">
              Supported: {allowedExtensions}
            </p>
            <p className="text-xs text-dark-500 dark:text-dark-500 mt-1">
              Max file size: 100 MB
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".exe,.dll,.js,.vbs,.ps1,.zip,.py"
            className="hidden"
          />
        </div>
      ) : (
        /* Selected File Display */
        <div className="border-2 border-primary-200 dark:border-primary-800 rounded-xl p-4 bg-primary-50/50 dark:bg-primary-900/10">
          <div className="flex items-start gap-3">
            {/* File Icon */}
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <File className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-dark-900 dark:text-white truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-dark-600 dark:text-dark-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded-lg transition-colors"
              aria-label="Remove file"
              disabled={uploading}
            >
              <X className="w-5 h-5 text-dark-600 dark:text-dark-400 hover:text-danger-600 dark:hover:text-danger-400" />
            </button>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="alert alert-danger mt-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            {errors.map((error, index) => (
              <p key={index} className="text-sm">{error}</p>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="alert alert-warning mt-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            {warnings.map((warning, index) => (
              <p key={index} className="text-sm">{warning}</p>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !uploading && (
        <button
          onClick={handleUploadClick}
          className="btn btn-primary w-full mt-4"
          disabled={errors.length > 0}
        >
          <Upload className="w-5 h-5" />
          <span>Scan File</span>
        </button>
      )}

      {/* Info Footer */}
      {!selectedFile && (
        <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <p className="text-xs text-dark-600 dark:text-dark-400">
            <strong className="text-primary-600 dark:text-primary-400">ℹ️ Note:</strong> Files are analyzed using AI-powered detection. 
            Your files are scanned securely and are not stored permanently.
          </p>
        </div>
      )}
    </div>
  )
}

export default FileUpload