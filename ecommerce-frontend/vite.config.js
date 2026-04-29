import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Allow connections from any device
    port: 5173,
    strictPort: true,
  },
  define: {
    // This ensures .env variables are available
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL)
  }
})