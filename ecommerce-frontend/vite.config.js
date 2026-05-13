import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [react(), compression()],
  server: {
    host: '0.0.0.0',  
    port: 5173,
    strictPort: true,
  },
  define: {
    
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL)
  }
})