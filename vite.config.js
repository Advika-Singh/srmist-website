import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { geminiProxy } from './server/gemini-plugin.js'

export default defineConfig(({ mode }) => {
  // Loads .env (including GEMINI_API_KEY). Only VITE_-prefixed vars ever reach the browser.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), geminiProxy(env)],
    server: { port: 5174 },
    build: {
      // The React app plus the two standalone faculty pages.
      rollupOptions: {
        output: {
          // React + router in their own long-cached file, separate from app code.
          manualChunks: { react: ['react', 'react-dom', 'react-router-dom'] },
        },
        input: {
          main: resolve(__dirname, 'index.html'),
          teach: resolve(__dirname, 'teach.html'),
          indexpage: resolve(__dirname, 'indexpage.html'),
        },
      },
    },
  }
})
