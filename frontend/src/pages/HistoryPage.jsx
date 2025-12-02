/**
 * Ransomware Detection System - History Page
 * Displays scan history and allows viewing scan details
 */

import React, { useEffect, useState } from 'react'
import ScanHistory from '@components/ScanHistory'
import ScanResult from '@components/ScanResult'
import { getScans, getScanById } from '@services/api'

function HistoryPage({ showToast }) {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedScan, setSelectedScan] = useState(null)
  const [limit] = useState(200)

  const fetchScans = async () => {
    setLoading(true)
    try {
      const data = await getScans(limit, 0)

      // API may return an array or an object with scans property
      if (Array.isArray(data)) {
        setScans(data)
      } else if (data && Array.isArray(data.scans)) {
        setScans(data.scans)
      } else if (data && data.results && Array.isArray(data.results)) {
        setScans(data.results)
      } else {
        setScans([])
      }
    } catch (error) {
      console.error('Failed to fetch scans', error)
      showToast && showToast('error', error.message || 'Failed to load scan history', 4000)
      setScans([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleViewDetails = async (scan) => {
    // If scan already has details, show it; otherwise fetch by id
    if (!scan) return

    const id = scan.id || scan.scan_id || scan._id
    if (!id) {
      setSelectedScan(scan)
      return
    }

    try {
      const details = await getScanById(id)
      setSelectedScan(details)
    } catch (error) {
      console.error('Failed to fetch scan details', error)
      showToast && showToast('error', error.message || 'Failed to fetch scan details', 4000)
    }
  }

  const handleRefresh = () => {
    fetchScans()
    showToast && showToast('info', 'Refreshing history...', 1500)
  }

  const handleCloseDetails = () => {
    setSelectedScan(null)
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">Scan History</h1>
        <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">Browse previous scans and view detailed analysis.</p>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {!selectedScan ? (
          <ScanHistory
            scans={scans}
            loading={loading}
            onViewDetails={handleViewDetails}
            onRefresh={handleRefresh}
          />
        ) : (
          <div>
            <button
              onClick={handleCloseDetails}
              className="btn btn-ghost mb-4"
            >
              ← Back to History
            </button>

            <ScanResult
              result={selectedScan}
              onNewScan={() => {}}
              showDetails={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage
