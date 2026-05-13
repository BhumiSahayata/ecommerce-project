/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",   
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fdf4ff",
          100: "#fae8ff",
          200: "#f3d0fe",
          300: "#e9a8fc",
          400: "#d970f7",
          500: "#c044e8",
          600: "#a21cca",
          700: "#8716a6",
          800: "#701488",
          900: "#5b136f",
        },
      },
      fontFamily: {
       
        display: ["'Times New Roman'", "Georgia", "Cambria", "serif"],
        
        body:    ["'DM Sans'", "system-ui", "sans-serif"],
        
        mono:    ["'DM Mono'", "Consolas", "monospace"],
      },
      animation: {
        "fade-in":  "fadeIn 0.3s ease-out both",
        "fade-up":  "fadeUp 0.5s ease-out both",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
        float:      "float 6s ease-in-out infinite",
        marquee:    "marquee 32s linear infinite",
        shimmer:    "shimmer 1.8s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { from:{ opacity:0, transform:"translateY(10px)" }, to:{ opacity:1, transform:"translateY(0)" } },
        fadeUp:  { from:{ opacity:0, transform:"translateY(18px)" }, to:{ opacity:1, transform:"translateY(0)" } },
        slideUp: { from:{ opacity:0, transform:"translateY(24px)" }, to:{ opacity:1, transform:"translateY(0)" } },
        float:   { "0%,100%":{ transform:"translateY(0)" }, "50%":{ transform:"translateY(-10px)" } },
        marquee: { from:{ transform:"translateX(0)" }, to:{ transform:"translateX(-50%)" } },
        shimmer: { "0%":{ backgroundPosition:"-200% 0" }, "100%":{ backgroundPosition:"200% 0" } },
      },
    },
  },
  plugins: [],
};