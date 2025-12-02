/**
 * Ransomware Detection System - Home Page
 * Main page for uploading and scanning files
 */

import React, { useState } from 'react'
import { Shield, Zap, Lock, CheckCircle } from 'lucide-react'
import FileUpload from '@components/FileUpload'
import ScanResult from '@components/ScanResult'
import { uploadFile } from '@services/api'

/**
 * HomePage Component
 * @param {Function} showToast - Toast notification function from App.jsx
 */
function HomePage({ showToast }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setScanResult(null) // Clear previous results
  }

  // Handle file upload and scanning
  const handleUpload = async (file) => {
    setUploading(true)
    setProgress(0)
    setStatus('Preparing file...')
    setScanResult(null)

    try {
      // Upload file with progress tracking
      const result = await uploadFile(file, (percent) => {
        setProgress(percent)
        
        // Update status based on progress
        if (percent < 30) {
          setStatus('Uploading file...')
        } else if (percent < 70) {
          setStatus('Analyzing file structure...')
        } else if (percent < 90) {
          setStatus('Running threat detection...')
        } else {
          setStatus('Finalizing analysis...')
        }
      })

      // Set scan result
      setScanResult(result)

      // Show notification based on result
      if (result.prediction?.toLowerCase() === 'malicious') {
        showToast(
          'error',
          `⚠️ Malicious file detected! Confidence: ${(result.confidence * 100).toFixed(1)}%`,
          5000
        )
      } else if (result.prediction?.toLowerCase() === 'safe') {
        showToast(
          'success',
          `✅ File is safe! Confidence: ${(result.confidence * 100).toFixed(1)}%`,
          5000
        )
      } else {
        showToast('info', 'Scan completed', 3000)
      }

    } catch (error) {
      console.error('Upload failed:', error)
      
      // Show error notification
      showToast(
        'error',
        error.message || 'Failed to scan file. Please try again.',
        5000
      )
      
      setScanResult(null)
    } finally {
      setUploading(false)
      setProgress(0)
      setStatus('')
    }
  }

  // Handle cancel upload
  const handleCancel = () => {
    setUploading(false)
    setProgress(0)
    setStatus('')
    showToast('info', 'Scan cancelled', 2000)
  }

  // Handle new scan
  const handleNewScan = () => {
    setScanResult(null)
    setSelectedFile(null)
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Hero Section */}
      {!scanResult && (
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Shield className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-white mb-4">
            Ransomware Detection System
          </h1>
          
          <p className="text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto mb-8">
            Upload your file for AI-powered threat analysis. Our advanced machine learning 
            system detects ransomware and malicious software with high accuracy.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <FeatureCard
              icon={Zap}
              title="Fast Analysis"
              description="Get results in under 3 seconds"
            />
            <FeatureCard
              icon={Lock}
              title="Secure Scanning"
              description="Files are analyzed safely and not stored"
            />
            <FeatureCard
              icon={CheckCircle}
              title="High Accuracy"
              description="AI-powered detection with 95%+ accuracy"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {!scanResult ? (
          /* File Upload Section */
          <div className="animate-slide-up">
            <FileUpload
              onFileSelect={handleFileSelect}
              onUpload={handleUpload}
              onCancel={handleCancel}
              uploading={uploading}
              progress={progress}
              status={status}
            />
          </div>
        ) : (
          /* Scan Result Section */
          <ScanResult
            result={scanResult}
            onNewScan={handleNewScan}
            showDetails={true}
          />
        )}
      </div>

      {/* Info Section */}
      {!scanResult && !uploading && (
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-3">
              📊 How It Works
            </h3>
            <div className="space-y-3 text-sm text-dark-700 dark:text-dark-300">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  1
                </span>
                <p>
                  <strong>Upload Your File:</strong> Drag and drop or browse to select a file 
                  (supports .exe, .dll, .js, .vbs, .ps1, .zip, .py)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  2
                </span>
                <p>
                  <strong>AI Analysis:</strong> Our system performs multiple checks including 
                  entropy analysis, signature matching, and machine learning classification
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  3
                </span>
                <p>
                  <strong>Get Results:</strong> Receive a detailed report with threat level, 
                  confidence score, and technical analysis
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-900 rounded-lg border border-gray-200 dark:border-dark-800">
            <p className="text-xs text-dark-600 dark:text-dark-400 text-center">
              🔒 <strong>Security Note:</strong> Files are scanned in a secure isolated environment. 
              Your files are analyzed but not stored permanently on our servers. 
              All file metadata and scan results are encrypted and handled according to our privacy policy.
            </p>
          </div>
        </div>
      )}

      {/* Statistics Section */}
      {!scanResult && !uploading && (
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Scans Today" value="1,234" />
            <StatBox label="Threats Detected" value="89" />
            <StatBox label="Detection Rate" value="95.2%" />
            <StatBox label="Avg Scan Time" value="2.1s" />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * FeatureCard Component
 */
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="card hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-dark-600 dark:text-dark-400">
        {description}
      </p>
    </div>
  )
}

/**
 * StatBox Component
 */
function StatBox({ label, value }) {
  return (
    <div className="card text-center">
      <p className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
        {value}
      </p>
      <p className="text-xs md:text-sm text-dark-600 dark:text-dark-400">
        {label}
      </p>
    </div>
  )
}

export default HomePage