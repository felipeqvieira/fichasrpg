/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dnd: {
          red: '#8B0000',    // Vermelho sangue clássico
          gold: '#C9AD6A',   // Dourado
          dark: '#1A1A1A',   // Preto quase absoluto
          paper: '#F5F5F0',  // Pergaminho
        }
      }
    },
  },
  plugins: [],
}