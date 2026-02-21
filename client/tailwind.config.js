module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          primary: '#6b21a5',
          secondary: '#3b0764',
          accent: '#f59e0b',
          dark: '#0a0a0f',
          light: '#1a1a2e',
          purple: '#8b5cf6',
          blue: '#3b82f6',
          pink: '#ec4899',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 1 },
        },
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px #6b21a5, 0 0 10px #6b21a5, 0 0 15px #6b21a5',
          },
          '50%': { 
            boxShadow: '0 0 10px #f59e0b, 0 0 20px #f59e0b, 0 0 30px #f59e0b',
          },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      backgroundImage: {
        'galaxy': "radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)",
        'nebula': "linear-gradient(45deg, #6b21a5 0%, #3b0764 50%, #1a1a2e 100%)",
        'starfield': "url('/src/assets/images/starfield-bg.jpg')",
        'cosmic-gradient': "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
