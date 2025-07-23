/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        flowCircular: ["Flow Circular", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
        polySans: ["PolySans Median", "sans-serif"],
        polySans2: ["PolySans Neutral", "sans-serif"],
        plusJakarta: ["Plus Jakarta Sans", "sans-serif"], // Added this line
      },
    },
  },
  plugins: [],
};
