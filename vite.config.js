import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Forward API calls to the Express + MongoDB backend (server/)
      '/api': 'http://localhost:4000',
    },
  },
})
