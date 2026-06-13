/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d0e12',
          secondary: '#13151c',
          tertiary: '#1a1d26',
          hover: '#1e2130',
        },
        border: {
          primary: '#2a2d3a',
          secondary: '#3a3d4e',
        },
        text: {
          primary: '#e8eaf0',
          secondary: '#8b8fa8',
          muted: '#555870',
        },
        accent: {
          blue: '#3b82f6',
          'blue-dim': '#1d4ed8',
        },
        long: '#22c55e',
        'long-dim': '#15803d',
        'long-bg': '#0f2a1a',
        short: '#ef4444',
        'short-dim': '#b91c1c',
        'short-bg': '#2a0f0f',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '10px',
        xs: '11px',
        sm: '12px',
        base: '13px',
        md: '14px',
        lg: '15px',
      },
    },
  },
  plugins: [],
}
