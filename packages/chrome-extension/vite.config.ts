import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' // 直接复用你现有的 manifest

export default defineConfig({
  plugins: [
    crx({ manifest }),
  ],
})