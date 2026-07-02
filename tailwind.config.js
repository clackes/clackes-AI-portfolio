/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    extend: {
      colors: {
        // Mirrors the reference design tokens (dark theme).
        background: '#0a0a0f',
        foreground: '#e4e4e7',
        card: '#18181b',
        'card-border': '#27272a',
        muted: '#a1a1aa',
        'muted-foreground': '#a1a1aa',
        destructive: '#ef4444',
        accent: {
          DEFAULT: '#3b82f6', // electric blue
          hover: '#60a5fa',
        },
        grad: {
          start: '#3b82f6', // electric
          end: '#22d3ee', // neon cyan
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      maxWidth: {
        page: '1200px',
      },
      keyframes: {
        'shimmer-gradient': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scan: {
          '0%': { left: '-8%', opacity: '0' },
          '12%, 88%': { opacity: '0.9' },
          '100%': { left: '108%', opacity: '0' },
        },
      },
      animation: {
        'shimmer-gradient': 'shimmer-gradient 6s ease infinite',
        scan: 'scan 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};
