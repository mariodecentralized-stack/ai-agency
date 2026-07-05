import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { render } from '../dist-ssr/entry-server.js'

const file = new URL('../dist/index.html', import.meta.url)
const html = readFileSync(file, 'utf8')
const appHtml = render()
const out = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
if (out === html) throw new Error('prerender: <div id="root"></div> placeholder not found in dist/index.html')
writeFileSync(file, out)
rmSync(new URL('../dist-ssr/', import.meta.url), { recursive: true, force: true })
console.log(`✓ prerendered ${(appHtml.length / 1024).toFixed(1)} kB of static HTML into dist/index.html`)
