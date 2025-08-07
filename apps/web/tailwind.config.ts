import type { Config } from 'tailwindcss';

const config: Config = {
  // v4 automatically scans for content, but you can still specify paths
  content: [
   // './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    //'tailwind-safe-classes.ts'
  ],


  // Dark mode configuration
 // darkMode: 'media', // or 'class' for class-based dark mode

  // Theme configuration
  theme: {
    extend: {
      colors: {
        'brand-bg': 'var(--brand-bg)',
        'brand-text': 'var(--brand-text)',
        'brand-border': 'var(--brand-border)',
      },
    },
  },

  // Plugins
  plugins: [
    // Note: Some plugins may need updates for v4 compatibility
    // Check plugin documentation for v4 support
  ],
  
  // Enable important if needed (uncomment if you had this enabled in v3)
  // important: true,
};

export default config;