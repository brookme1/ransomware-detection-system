/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // Dark mode configuration
  darkMode: 'class', // Enable class-based dark mode
  
  theme: {
    extend: {
      // Custom colors for the application
      colors: {
        // Primary brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main primary color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        
        // Status colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Main success color
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Main danger color
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Main warning color
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        
        // Dark mode colors
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      
      // Custom spacing
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      
      // Custom border radius
      borderRadius: {
        '4xl': '2rem',
      },
      
      // Custom font families
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'Fira Code',
          'Consolas',
          'Monaco',
          'Courier New',
          'monospace',
        ],
      },
      
      // Custom font sizes
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      
      // Custom box shadows
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.5)',
      },
      
      // Custom animations
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      
      // Custom keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Custom z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      // Custom backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      
      // Custom max widths
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      // Custom min heights
      minHeight: {
        'screen-75': '75vh',
        'screen-50': '50vh',
      },
      
      // Custom transitions
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      
      // Custom aspect ratios
      aspectRatio: {
        '4/3': '4 / 3',
        '21/9': '21 / 9',
      },
    },
  },
  
  // Plugins
  plugins: [
    // Form styles plugin (optional, uncomment if needed)
    // require('@tailwindcss/forms'),
    
    // Typography plugin (optional, uncomment if needed)
    // require('@tailwindcss/typography'),
    
    // Line clamp plugin (optional, uncomment if needed)
    // require('@tailwindcss/line-clamp'),
    
    // Aspect ratio plugin (optional, uncomment if needed)
    // require('@tailwindcss/aspect-ratio'),
  ],
  
  // Safelist (classes that should never be purged)
  safelist: [
    'bg-success-500',
    'bg-danger-500',
    'bg-warning-500',
    'bg-primary-500',
    'text-success-500',
    'text-danger-500',
    'text-warning-500',
    'text-primary-500',
    'border-success-500',
    'border-danger-500',
    'border-warning-500',
    'border-primary-500',
  ],
}