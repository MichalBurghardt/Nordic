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
        
        // Nordic blue palette - minimalist approach
        nordic: {
          light: "#c8f1ff",  // Jasny niebieski - dla tła i akcentów
          primary: "#168bd1", // Główny niebieski - dla przycisków i linków
          dark: "#053a66",    // Ciemny niebieski - dla tekstu i kontrastów
        },
        
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
