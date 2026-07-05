import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'

import { cloudflare } from "@cloudflare/vite-plugin";

// After the client bundle is written, run an SSR build of the app and
// inject the rendered HTML into dist/index.html so crawlers get full
// content without executing JS. Guarded so it only fires once per build.
const prerender = () => ({
  name: 'prerender',
  apply: 'build',
  closeBundle() {
    const f = 'dist/index.html'
    if (existsSync(f) && readFileSync(f, 'utf8').includes('<div id="root"></div>')) {
      execSync('npx vite build --config vite.ssr.config.js && node scripts/prerender.mjs', { stdio: 'inherit' })
    }
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare(), prerender()],
})
