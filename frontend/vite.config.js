import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Babel configuration for React
      babel: {
        plugins: [],
      },
    }),
  ],

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true, // Listen on all addresses (0.0.0.0)
    open: true, // Auto-open browser on server start
    cors: true, // Enable CORS
    
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Backend URL
        changeOrigin: true,
        secure: false,
        // Optionally rewrite path
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },

    // Hot Module Replacement
    hmr: {
      overlay: true, // Show error overlay
    },
  },

  // Preview server configuration (for production build preview)
  preview: {
    port: 4173,
    host: true,
    open: true,
    cors: true,
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Set to true for debugging production
    minify: 'terser', // Use terser for minification
    
    // Terser minification options
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },

    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'clsx'],
          'utils-vendor': ['axios', 'date-fns'],
        },
        // Asset file naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },

    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Asset inline limit (files smaller than this will be inlined as base64)
    assetsInlineLimit: 4096, // 4KB
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lucide-react',
      'clsx',
      'date-fns',
    ],
    exclude: [],
  },

  // Define global constants
  define: {
    // API base URL (can be overridden by environment variables)
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:8000'
    ),
    // App version
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(
      process.env.npm_package_version || '1.0.0'
    ),
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true, // Enable CSS source maps in development
  },

  // Environment variables prefix
  envPrefix: 'VITE_',

  // Enable JSON import
  json: {
    stringify: false,
  },

  // Worker configuration
  worker: {
    format: 'es',
  },

  // Base public path
  base: '/',

  // Public directory
  publicDir: 'public',

  // Clear screen on startup
  clearScreen: true,

  // Log level
  logLevel: 'info',
})