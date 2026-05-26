/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,mdx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:     ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:     ['var(--font-mono)', 'monospace'],
      },
      colors: {
        accent: '#C8973A',
      },
      maxWidth: {
        shell: '430px',
      },
    },
  },
  plugins: [],
}