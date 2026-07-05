import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Separate config for the prerender pass — must not load the Cloudflare
// plugin, which targets the workerd runtime rather than Node.
export default defineConfig({
  plugins: [react()],
  build: {
    ssr: 'src/entry-server.jsx',
    outDir: 'dist-ssr',
  },
})
