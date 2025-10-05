/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for golf scoring
        primary: {
          DEFAULT: '#2563eb', // blue-600
          hover: '#1d4ed8',   // blue-700
        },
        eagle: {
          DEFAULT: '#059669', // emerald-600
          light: '#34d399',   // emerald-400
          dark: '#047857',    // emerald-700
        },
        birdie: {
          DEFAULT: '#22c55e', // green-500
          light: '#86efac',   // green-300
          dark: '#16a34a',    // green-600
        },
        par: {
          DEFAULT: '#60a5fa', // blue-400
          light: '#93c5fd',   // blue-300
          dark: '#3b82f6',    // blue-500
        },
        bogey: {
          DEFAULT: '#eab308', // yellow-500
          light: '#fde047',   // yellow-300
          dark: '#ca8a04',    // yellow-600
        },
        worse: {
          DEFAULT: '#ef4444', // red-500
          light: '#fca5a5',   // red-300
          dark: '#dc2626',    // red-600
        },
      },
      screens: {
        'xs': '320px',
        'sm': '375px',
        'md': '428px',
        'lg': '768px',
        'xl': '1024px',
        '2xl': '1280px',
      },
    },
  },
  plugins: [],
}
