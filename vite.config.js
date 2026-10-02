import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hftlogubohbjiivcvkut.supabase.co'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/api/functions': {
        target: supabaseUrl,
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/api\/functions/, '/functions/v1')
      }
    }
  }
})
