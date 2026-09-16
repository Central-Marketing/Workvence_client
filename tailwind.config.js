/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  corePlugins: {
    container: false, // Disables Tailwind's rigid max-width container in favor of fluid responsive container
  },
  theme: {
    extend: {
      screens: {
        'macbook': '1440px',
      },
      fontFamily: {
        sans: ["var(--font-sf-pro)", "SF Pro Display", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "sf-pro": ["var(--font-sf-pro)", "SF Pro Display", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
        outfit: ["var(--font-outfit)", "Outfit", "sans-serif"],
      },
      colors: {
        "brand-green": "#327C73",
        "brand-light": "#6AD724",
        "brand-black": "#112131",
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.container': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          '@screen sm': {
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
          },
          '@screen md': {
            paddingLeft: '2rem',
            paddingRight: '2rem',
          },
          '@screen lg': {
            paddingLeft: '3rem',
            paddingRight: '3rem',
          },
          '@screen xl': {
            paddingLeft: '80px',
            paddingRight: '80px',
          },
          '@screen 2xl': {
            paddingLeft: '80px',
            paddingRight: '80px',
          },
        },
      });
    },
  ],
}
