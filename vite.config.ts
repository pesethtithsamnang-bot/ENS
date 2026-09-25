import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    // Broad compatibility so the site opens on older iOS Safari versions
    // too, not just recent ones - a syntax feature the browser can't parse
    // at all would otherwise stop the ENTIRE page from loading, not just
    // one part of it.
    target: ['es2018', 'safari13'],
  },
})
