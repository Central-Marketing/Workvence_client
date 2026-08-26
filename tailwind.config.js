/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sf-pro)", "SF Pro Display", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "sf-pro": ["var(--font-sf-pro)", "SF Pro Display", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
        outfit: ["var(--font-outfit)", "Outfit", "sans-serif"],
      },
      colors: {
        "brand-green": "#6ad724",
        "brand-light": "#6AD724",
        "brand-black": "#112131",
      },
    },
  },
  plugins: [],
}
