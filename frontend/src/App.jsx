/**
 * Ransomware Detection System - Main App Component
 * Handles routing, layout, and global state
 */

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import Toast from './components/Toast'

function App() {
  // Global state
  const [darkMode, setDarkMode] = useState(false)
  const [toast, setToast] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      showToast('success', 'Connection restored')
    }

    const handleOffline = () => {
      setIsOnline(false)
      showToast('warning', 'You are offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)

    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Show toast notification
  const showToast = (type, message, duration = 3000) => {
    setToast({ type, message, id: Date.now() })
    
    // Auto-dismiss after duration
    setTimeout(() => {
      setToast(null)
    }, duration)
  }

  // Close toast manually
  const closeToast = () => {
    setToast(null)
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 transition-colors duration-200">
        {/* Navigation Bar */}
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-warning-500 text-white px-4 py-2 text-center text-sm font-medium">
            ⚠️ You are currently offline. Some features may be unavailable.
          </div>
        )}

        {/* Main Content */}
        <main className="container-responsive py-8">
          <Routes>
            {/* Home Page - File Upload & Scan */}
            <Route 
              path="/" 
              element={<HomePage showToast={showToast} />} 
            />

            {/* History Page - Scan Results */}
            <Route 
              path="/history" 
              element={<HistoryPage showToast={showToast} />} 
            />

            {/* Redirect unknown routes to home */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-800 mt-auto">
          <div className="container-responsive py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-dark-600 dark:text-dark-400 text-sm">
                  © 2024 Ransomware Detection System. All rights reserved.
                </p>
                <p className="text-dark-500 dark:text-dark-500 text-xs mt-1">
                  AI-powered threat analysis and protection
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <a 
                  href="#" 
                  className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Privacy Policy
                </a>
                <a 
                  href="#" 
                  className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Terms of Service
                </a>
                <a 
                  href="#" 
                  className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Documentation
                </a>
              </div>
            </div>

            {/* Version & Status */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-800 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-dark-500 dark:text-dark-500">
              <div className="flex items-center gap-4">
                <span>Version {import.meta.env.VITE_APP_VERSION || '1.0.0'}</span>
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success-500' : 'bg-danger-500'}`}></span>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div>
                Powered by AI & Machine Learning
              </div>
            </div>
          </div>
        </footer>

        {/* Toast Notifications */}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={closeToast}
          />
        )}
      </div>
    </Router>
  )
}

export default App