import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#ff6b00",
          dark: "#cc5600"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    },
  },
  plugins: [],
}
export default config
