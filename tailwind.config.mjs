/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',    
        secondary: '#8B5CF6',  
        accent: '#F59E0B',
      },
      fontFamily: {
        sans: ['Your Font', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}