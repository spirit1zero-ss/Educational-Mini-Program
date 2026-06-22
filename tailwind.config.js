/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/*.{js,jsx}',
    './src/{api,components,data,hooks,pages}/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        growthBlue: '#4F8CFF',
        growthGreen: '#6DD3A0',
        warmOrange: '#FFB84D',
        softBg: '#F7F9FC'
      },
      boxShadow: {
        soft: '0 12px 34px rgba(42, 74, 122, 0.09)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'PingFang SC', 'Microsoft YaHei', 'sans-serif']
      }
    }
  },
  plugins: []
};
