// tailwind.config.js (root)
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cinestar: {
          purple: '#3C1361',
          purple2: '#5B2E91',
          purple3: '#2E004F',
          gold: '#FFD700',
          gold2: '#FFB300',
        },
      },
    },
  },
  plugins: [],
}
