/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 실무형 운용 시스템 색상 팔레트
        bg: {
          primary: '#0f1117',
          secondary: '#1a1d27',
          card: '#1e2130',
          hover: '#252840',
          border: '#2d3148',
        },
        text: {
          primary: '#e2e4ed',
          secondary: '#9098b1',
          muted: '#5c6480',
        },
        accent: {
          blue: '#4a7cf7',
          green: '#2ecc88',
          red: '#e05252',
          yellow: '#f5a623',
          purple: '#9b6bfa',
          cyan: '#2bc4d8',
        },
        status: {
          normal: '#2ecc88',
          warning: '#f5a623',
          violation: '#e05252',
          monitoring: '#9098b1',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Pretendard', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.65rem',
        xs: '0.72rem',
        sm: '0.8rem',
        base: '0.875rem',
      },
    },
  },
  plugins: [],
};
