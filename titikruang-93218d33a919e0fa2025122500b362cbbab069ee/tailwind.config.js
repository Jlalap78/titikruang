module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        glow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.6))' },
          '50%': { filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.9))' },
        },
      },
        animation: {
        glow: 'glow 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
