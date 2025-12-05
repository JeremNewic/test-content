import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321', 
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src/',
      },
    },
    server: {
      watch: {
        usePolling: true, 
      },
    },
  },
  integrations: [
    sitemap({
      // Génère automatiquement le sitemap.xml
      filter: (page) => !page.includes('/admin/'),
    })
  ],
  image: {
    // Permet d'optimiser les images depuis WordPress
    domains: ['starterkit-blog.local'], 
    remotePatterns: [{
      protocol: 'http',
      hostname: 'starterkit-blog.local',
    }],
  },
  output: 'static', // Génération statique pour performance maximale
  build: {
    inlineStylesheets: 'auto',
  },
});