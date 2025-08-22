/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // System colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        
        // Nordic blue palette - dynamic colors from CSS variables
        nordic: {
          light: "var(--color-nordic-nordic1, #c8f1ff)",
          primary: "var(--color-nordic-nordic3, #168bd1)", 
          dark: "var(--color-nordic-nordic5, #053a66)",
        },
        
        // Individual Nordic color variants for full control
        'nordic-1': "var(--color-nordic-nordic1, #c8f1ff)",
        'nordic-2': "var(--color-nordic-nordic2, #9fd8f0)",
        'nordic-3': "var(--color-nordic-nordic3, #168bd1)",
        'nordic-4': "var(--color-nordic-nordic4, #0f6ba3)",
        'nordic-5': "var(--color-nordic-nordic5, #053a66)",
        'nordic-6': "var(--color-nordic-nordic6, #041e33)",
        
        // Semantic colors based on nordic palette
        primary: {
          50: "#c8f1ff",
          500: "#168bd1", 
          900: "#053a66"
        }
      },
    },
  },
  plugins: [],
};

export default config;
