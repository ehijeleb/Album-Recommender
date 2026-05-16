/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 0 1px rgba(34, 197, 94, 0.2), 0 10px 40px -10px rgba(34, 197, 94, 0.35)',
        'glow-green-sm': '0 8px 24px -8px rgba(34, 197, 94, 0.45)',
        'card': '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 8px 24px -12px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
