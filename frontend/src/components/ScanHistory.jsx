/**
 * Ransomware Detection System - Scan History Component
 * Displays table/list of all scan results with filtering and sorting
 */

import React, { useState } from 'react'
import { 
  FileText, 
  Search, 
  Filter,
  ArrowUpDown,
  Eye,
  Download,
  Trash2,
  Calendar,
  TrendingUp
} from 'lucide-react'
import StatusBadge, { FileTypeBadge, ConfidenceBadge } from './StatusBadge'
import { LoadingTable } from './LoadingSpinner'
import { 
  formatDate, 
  formatRelativeTime, 
  formatFileSize,
  truncateString 
} from '@utils/formatters'

/**
 * ScanHistory Component
 * @param {Array} scans - Array of scan results
 * @param {boolean} loading - Loading state
 * @param {Function} onViewDetails - Callback to view scan details
 * @param {Function} onRefresh - Callback to refresh history
 */
function ScanHistory({ 
  scans = [], 
  loading = false, 
  onViewDetails,
  onRefresh 
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, safe, malicious
  const [sortBy, setSortBy] = useState('timestamp') // timestamp, filename, confidence
  const [sortOrder, setSortOrder] = useState('desc') // asc, desc
  const [viewMode, setViewMode] = useState('table') // table, cards

  // Filter scans
  const filteredScans = scans.filter(scan => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        scan.file_name?.toLowerCase().includes(query) ||
        scan.file_type?.toLowerCase().includes(query) ||
        scan.prediction?.toLowerCase().includes(query)
      
      if (!matchesSearch) return false
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'safe' && scan.prediction?.toLowerCase() !== 'safe') return false
      if (filterStatus === 'malicious' && scan.prediction?.toLowerCase() !== 'malicious') return false
    }

    return true
  })

  // Sort scans
  const sortedScans = [...filteredScans].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'timestamp':
        comparison = new Date(a.timestamp) - new Date(b.timestamp)
        break
      case 'filename':
        comparison = (a.file_name || '').localeCompare(b.file_name || '')
        break
      case 'confidence':
        comparison = (a.confidence || 0) - (b.confidence || 0)
        break
      default:
        comparison = 0
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Toggle sort order
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Statistics
  const totalScans = scans.length
  const maliciousCount = scans.filter(s => s.prediction?.toLowerCase() === 'malicious').length
  const safeCount = scans.filter(s => s.prediction?.toLowerCase() === 'safe').length
  const detectionRate = totalScans > 0 ? ((maliciousCount / totalScans) * 100).toFixed(1) : 0

  if (loading) {
    return (
      <div className="card">
        <LoadingTable rows={10} columns={5} />
      </div>
    )
  }

  if (scans.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400 dark:text-dark-500" />
        </div>
        <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
          No Scan History
        </h3>
        <p className="text-dark-600 dark:text-dark-400 mb-4">
          Scan your first file to see results here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={FileText}
          label="Total Scans"
          value={totalScans}
          color="primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Malicious Detected"
          value={maliciousCount}
          color="danger"
        />
        <StatCard
          icon={Calendar}
          label="Detection Rate"
          value={`${detectionRate}%`}
          color="warning"
        />
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 dark:text-dark-500" />
            <input
              type="text"
              placeholder="Search by filename, type, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-dark-500 dark:text-dark-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="safe">Safe Only</option>
              <option value="malicious">Malicious Only</option>
            </select>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn btn-secondary"
            >
              Refresh
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-dark-600 dark:text-dark-400">
          Showing {sortedScans.length} of {totalScans} scans
        </div>
      </div>

      {/* Results */}
      {sortedScans.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-dark-600 dark:text-dark-400">
            No results found for your search
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <button
                    onClick={() => handleSort('filename')}
                    className="flex items-center gap-1 hover:text-primary-600"
                  >
                    File Name
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th>Type</th>
                <th>
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-primary-600"
                  >
                    Status
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort('confidence')}
                    className="flex items-center gap-1 hover:text-primary-600"
                  >
                    Confidence
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center gap-1 hover:text-primary-600"
                  >
                    Date
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedScans.map((scan) => (
                <tr key={scan.id || scan.scan_id}>
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-dark-400 flex-shrink-0" />
                      <span className="truncate max-w-[200px]" title={scan.file_name}>
                        {scan.file_name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <FileTypeBadge fileType={scan.file_type} size="sm" />
                  </td>
                  <td>
                    <StatusBadge
                      prediction={scan.prediction}
                      confidence={scan.confidence}
                      riskLevel={scan.risk_level}
                      size="sm"
                    />
                  </td>
                  <td>
                    <ConfidenceBadge confidence={scan.confidence} size="sm" />
                  </td>
                  <td className="text-sm">
                    <div className="flex flex-col">
                      <span className="text-dark-900 dark:text-white">
                        {formatRelativeTime(scan.timestamp)}
                      </span>
                      <span className="text-xs text-dark-500 dark:text-dark-500">
                        {formatDate(scan.timestamp, 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(scan)}
                          className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card View (Mobile) */
        <div className="grid gap-4">
          {sortedScans.map((scan) => (
            <ScanCard
              key={scan.id || scan.scan_id}
              scan={scan}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * StatCard Component - Statistics display card
 */
function StatCard({ icon: Icon, label, value, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    danger: 'bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400',
    success: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
    warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
  }

  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-dark-600 dark:text-dark-400">{label}</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * ScanCard Component - Card view for mobile
 */
function ScanCard({ scan, onViewDetails }) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText className="w-5 h-5 text-dark-400 flex-shrink-0" />
          <span className="font-semibold text-dark-900 dark:text-white truncate">
            {scan.file_name}
          </span>
        </div>
        <FileTypeBadge fileType={scan.file_type} size="sm" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <StatusBadge
          prediction={scan.prediction}
          confidence={scan.confidence}
          riskLevel={scan.risk_level}
          size="sm"
        />
        <ConfidenceBadge confidence={scan.confidence} size="sm" />
      </div>

      <div className="flex items-center justify-between text-sm text-dark-600 dark:text-dark-400">
        <span>{formatRelativeTime(scan.timestamp)}</span>
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(scan)}
            className="btn btn-secondary btn-sm"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ScanHistory