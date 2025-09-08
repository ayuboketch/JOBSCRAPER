import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  build: {
    outDir: 'dist/public',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: './client/index.html'
    }
  },
  root: './client',
  publicDir: 'public',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})