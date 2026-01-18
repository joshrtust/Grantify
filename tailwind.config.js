/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#6366f1',
          purpleDark: '#4f46e5',
          purpleLight: '#818cf8',
        },
        background: {
          light: '#f5f5f7',
          card: '#ffffff',
        },
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
          light: '#ffffff',
        },
      },
      borderRadius: {
        card: '20px',
        button: '16px',
      },
    },
  },
  plugins: [],
}

