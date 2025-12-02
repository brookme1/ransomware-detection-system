/**
 * Ransomware Detection System - Navigation Bar Component
 * Responsive navbar with logo, navigation links, and dark mode toggle
 */

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Shield, 
  Home, 
  History, 
  Menu, 
  X, 
  Sun, 
  Moon 
} from 'lucide-react'

/**
 * Navbar Component
 * @param {boolean} darkMode - Current dark mode state
 * @param {Function} toggleDarkMode - Function to toggle dark mode
 */
function Navbar({ darkMode, toggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path
  }

  // Close mobile menu when link is clicked
  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 sticky top-0 z-40 shadow-sm">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            onClick={handleLinkClick}
          >
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-dark-900 dark:text-white">
                Ransomware Detector
              </h1>
              <p className="text-xs text-dark-600 dark:text-dark-400">
                AI-Powered Protection
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink 
              to="/" 
              icon={Home} 
              label="Scan File" 
              isActive={isActive('/')}
            />
            <NavLink 
              to="/history" 
              icon={History} 
              label="History" 
              isActive={isActive('/history')}
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-warning-500" />
              ) : (
                <Moon className="w-5 h-5 text-primary-600" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-dark-900 dark:text-white" />
              ) : (
                <Menu className="w-6 h-6 text-dark-900 dark:text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-dark-800 bg-white dark:bg-dark-900 animate-slide-down">
          <div className="container-responsive py-4 space-y-1">
            <MobileNavLink
              to="/"
              icon={Home}
              label="Scan File"
              isActive={isActive('/')}
              onClick={handleLinkClick}
            />
            <MobileNavLink
              to="/history"
              icon={History}
              label="History"
              isActive={isActive('/history')}
              onClick={handleLinkClick}
            />
          </div>
        </div>
      )}
    </nav>
  )
}

/**
 * Desktop Navigation Link Component
 */
function NavLink({ to, icon: Icon, label, isActive }) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        font-medium text-sm transition-all
        ${isActive 
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
          : 'text-dark-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  )
}

/**
 * Mobile Navigation Link Component
 */
function MobileNavLink({ to, icon: Icon, label, isActive, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        font-medium transition-all
        ${isActive 
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
          : 'text-dark-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  )
}

export default Navbar