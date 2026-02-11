import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://skillx-zf0k.onrender.com',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'https://skillx-zf0k.onrender.com',
        ws: true
      }
    }
  }
})
