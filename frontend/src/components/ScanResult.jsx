/**
 * Ransomware Detection System - Scan Result Component
 * Displays detailed scan results with analysis information
 */

import React, { useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText, 
  Hash, 
  Clock, 
  Shield,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react'
import StatusBadge, { 
  RiskLevelBadge, 
  ConfidenceBadge, 
  FileTypeBadge 
} from './StatusBadge'
import { 
  formatDate, 
  formatRelativeTime, 
  formatFileSize,
  formatDuration,
  formatHash,
  truncateString
} from '@utils/formatters'

/**
 * ScanResult Component
 * @param {Object} result - Scan result data
 * @param {Function} onNewScan - Callback to start new scan
 * @param {boolean} showDetails - Show detailed analysis (default: true)
 */
function ScanResult({ result, onNewScan, showDetails = true }) {
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!result) return null

  // Destructure result data
  const {
    file_name,
    file_hash,
    file_size,
    file_type,
    prediction,
    confidence,
    risk_level,
    scan_duration,
    timestamp,
    detection_details = {},
    detection_method
  } = result

  // Determine if result is malicious
  const isMalicious = prediction?.toLowerCase() === 'malicious'
  const isSafe = prediction?.toLowerCase() === 'safe'

  // Copy hash to clipboard
  const handleCopyHash = () => {
    navigator.clipboard.writeText(file_hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Main Result Card */}
      <div className={`
        card border-2
        ${isMalicious ? 'border-danger-200 dark:border-danger-800 bg-danger-50/50 dark:bg-danger-900/10' : ''}
        ${isSafe ? 'border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-900/10' : ''}
      `}>
        {/* Header with Icon */}
        <div className="text-center mb-6">
          {isMalicious ? (
            <div className="w-20 h-20 mx-auto mb-4 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-danger-600 dark:text-danger-400" />
            </div>
          ) : isSafe ? (
            <div className="w-20 h-20 mx-auto mb-4 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-success-600 dark:text-success-400" />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto mb-4 bg-warning-100 dark:bg-warning-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-warning-600 dark:text-warning-400" />
            </div>
          )}

          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">
            {isMalicious ? 'Threat Detected!' : isSafe ? 'File is Safe' : 'Scan Complete'}
          </h2>
          
          <p className="text-dark-600 dark:text-dark-400 mb-4">
            {isMalicious 
              ? 'This file has been identified as malicious. Do not execute or open it.'
              : isSafe
              ? 'No threats detected. This file appears to be safe.'
              : 'Analysis complete. Review the details below.'}
          </p>

          {/* Status Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <StatusBadge 
              prediction={prediction}
              confidence={confidence}
              riskLevel={risk_level}
              size="lg"
            />
            <ConfidenceBadge confidence={confidence} size="lg" showLabel />
            {risk_level && <RiskLevelBadge riskLevel={risk_level} size="lg" />}
          </div>
        </div>

        {/* File Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
          <InfoItem 
            icon={FileText} 
            label="File Name" 
            value={truncateString(file_name, 40)}
            fullValue={file_name}
          />
          <InfoItem 
            icon={FileText} 
            label="File Type" 
            value={<FileTypeBadge fileType={file_type} size="sm" />}
          />
          <InfoItem 
            icon={Shield} 
            label="File Size" 
            value={formatFileSize(file_size)}
          />
          <InfoItem 
            icon={Clock} 
            label="Scan Duration" 
            value={formatDuration(scan_duration)}
          />
          <InfoItem 
            icon={Clock} 
            label="Scanned" 
            value={formatRelativeTime(timestamp)}
            subtitle={formatDate(timestamp)}
          />
          <InfoItem 
            icon={Shield} 
            label="Detection Method" 
            value={detection_method || 'Machine Learning'}
          />
        </div>

        {/* File Hash */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-900 rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Hash className="w-4 h-4 text-dark-500 dark:text-dark-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-dark-600 dark:text-dark-400">SHA256 Hash</p>
                <p className="font-mono text-xs text-dark-900 dark:text-white truncate">
                  {formatHash(file_hash, 32)}
                </p>
              </div>
            </div>
            <button
              onClick={handleCopyHash}
              className="p-2 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg transition-colors flex-shrink-0"
              title="Copy full hash"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success-600" />
              ) : (
                <Copy className="w-4 h-4 text-dark-600 dark:text-dark-400" />
              )}
            </button>
          </div>
        </div>

        {/* New Scan Button */}
        {onNewScan && (
          <button
            onClick={onNewScan}
            className="btn btn-primary w-full mt-4"
          >
            Scan Another File
          </button>
        )}
      </div>

      {/* Detailed Analysis (Expandable) */}
      {showDetails && detection_details && Object.keys(detection_details).length > 0 && (
        <div className="card">
          <button
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-800 rounded-lg transition-colors"
          >
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">
              Detailed Analysis
            </h3>
            {detailsExpanded ? (
              <ChevronUp className="w-5 h-5 text-dark-600 dark:text-dark-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-dark-600 dark:text-dark-400" />
            )}
          </button>

          {detailsExpanded && (
            <div className="mt-4 space-y-4 animate-slide-down">
              {/* Entropy Analysis */}
              {detection_details.entropy_score !== undefined && (
                <DetailSection title="Entropy Analysis">
                  <DetailItem 
                    label="Overall Entropy"
                    value={detection_details.entropy_score?.toFixed(2)}
                    description="High entropy (>7.0) may indicate encryption or packing"
                    warning={detection_details.entropy_score > 7.0}
                  />
                </DetailSection>
              )}

              {/* Suspicious Strings */}
              {detection_details.suspicious_strings && detection_details.suspicious_strings.length > 0 && (
                <DetailSection title="Suspicious Strings">
                  <div className="flex flex-wrap gap-2">
                    {detection_details.suspicious_strings.map((str, index) => (
                      <span key={index} className="badge badge-warning text-xs">
                        {str}
                      </span>
                    ))}
                  </div>
                </DetailSection>
              )}

              {/* PE Analysis */}
              {detection_details.pe_analysis && (
                <DetailSection title="PE File Analysis">
                  <div className="space-y-2">
                    {detection_details.pe_analysis.num_sections && (
                      <DetailItem 
                        label="Number of Sections"
                        value={detection_details.pe_analysis.num_sections}
                      />
                    )}
                    {detection_details.pe_analysis.high_entropy_sections !== undefined && (
                      <DetailItem 
                        label="High Entropy Sections"
                        value={detection_details.pe_analysis.high_entropy_sections}
                        warning={detection_details.pe_analysis.high_entropy_sections > 0}
                      />
                    )}
                    {detection_details.pe_analysis.packed_sections !== undefined && (
                      <DetailItem 
                        label="Packed Sections"
                        value={detection_details.pe_analysis.packed_sections}
                        warning={detection_details.pe_analysis.packed_sections > 0}
                      />
                    )}
                  </div>
                </DetailSection>
              )}

              {/* Archive Analysis */}
              {detection_details.archive_analysis && (
                <DetailSection title="Archive Analysis">
                  <div className="space-y-2">
                    {detection_details.archive_analysis.file_count && (
                      <DetailItem 
                        label="Files in Archive"
                        value={detection_details.archive_analysis.file_count}
                      />
                    )}
                    {detection_details.archive_analysis.is_zip_bomb && (
                      <div className="alert alert-danger text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Potential zip bomb detected!</span>
                      </div>
                    )}
                  </div>
                </DetailSection>
              )}

              {/* Hash Match */}
              {detection_details.hash_match && (
                <DetailSection title="Signature Match">
                  <div className="alert alert-danger">
                    <XCircle className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Known Ransomware Detected</p>
                      {detection_details.ransomware_family && (
                        <p className="text-sm">Family: {detection_details.ransomware_family}</p>
                      )}
                    </div>
                  </div>
                </DetailSection>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * InfoItem Component - Display key-value information
 */
function InfoItem({ icon: Icon, label, value, subtitle, fullValue }) {
  const [showFull, setShowFull] = useState(false)

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-dark-500 dark:text-dark-400 mb-1">
          {label}
        </p>
        <p 
          className="text-sm font-semibold text-dark-900 dark:text-white break-words"
          title={fullValue}
          onClick={() => fullValue && setShowFull(!showFull)}
        >
          {showFull && fullValue ? fullValue : value}
        </p>
        {subtitle && (
          <p className="text-xs text-dark-500 dark:text-dark-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * DetailSection Component - Expandable detail section
 */
function DetailSection({ title, children }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-dark-900 rounded-lg">
      <h4 className="text-sm font-semibold text-dark-900 dark:text-white mb-3">
        {title}
      </h4>
      {children}
    </div>
  )
}

/**
 * DetailItem Component - Individual detail item
 */
function DetailItem({ label, value, description, warning = false }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-dark-700 dark:text-dark-300">{label}</p>
        {description && (
          <p className="text-xs text-dark-500 dark:text-dark-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <span className={`text-sm font-semibold ${warning ? 'text-danger-600 dark:text-danger-400' : 'text-dark-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  )
}

export default ScanResult