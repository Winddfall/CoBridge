import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' // 直接复用你现有的 manifest
import { copyFileSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

// 复制 wasm 文件和处理 offscreen.html
function copyFiles() {
  return {
    name: 'copy-files',
    writeBundle() {
      // 复制 wasm 文件
      const wasmDir = resolve(__dirname, 'dist/wasm')
      if (!existsSync(wasmDir)) {
        mkdirSync(wasmDir, { recursive: true })
      }

      const wasmFiles = [
        'ort-wasm-simd-threaded.wasm',
        'ort-wasm-simd.wasm',
        'ort-wasm-threaded.wasm',
        'ort-wasm.wasm',
      ]

      for (const file of wasmFiles) {
        const src = resolve(__dirname, `node_modules/@xenova/transformers/dist/${file}`)
        const dest = resolve(wasmDir, file)
        if (existsSync(src)) {
          copyFileSync(src, dest)
          console.log(`Copied ${file} to dist/wasm/`)
        }
      }

      // 处理 offscreen.html：更新脚本引用
      const offscreenHtmlPath = resolve(__dirname, 'dist/offscreen.html')
      if (existsSync(offscreenHtmlPath)) {
        let html = readFileSync(offscreenHtmlPath, 'utf-8')
        // 查找编译后的 offscreen JS 文件
        const assetsDir = resolve(__dirname, 'dist/assets')
        const files = require('fs').readdirSync(assetsDir)
        const offscreenJs = files.find((f: string) => f.startsWith('offscreen-') && f.endsWith('.js'))
        if (offscreenJs) {
          html = html.replace('offscreen.ts', `assets/${offscreenJs}`)
          writeFileSync(offscreenHtmlPath, html)
          console.log(`Updated offscreen.html to reference ${offscreenJs}`)
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    crx({ manifest }),
    copyFiles(),
  ],
  build: {
    rollupOptions: {
      input: {
        offscreen: 'offscreen.html',
      },
    },
  },
})