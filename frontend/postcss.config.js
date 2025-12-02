/**
 * PostCSS Configuration
 * Processes CSS with Tailwind CSS and Autoprefixer
 */

export default {
  plugins: {
    // Tailwind CSS - utility-first CSS framework
    tailwindcss: {},
    
    // Autoprefixer - adds vendor prefixes automatically
    // Ensures cross-browser compatibility
    autoprefixer: {},
    
    // Additional plugins (uncomment if needed)
    
    // CSS Nano - minify CSS in production
    // ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
    
    // PostCSS Import - inline @import rules
    // 'postcss-import': {},
    
    // PostCSS Nested - support for nested CSS rules (like SCSS)
    // 'postcss-nested': {},
    
    // PostCSS Custom Properties - CSS variables fallback
    // 'postcss-custom-properties': {},
  },
}