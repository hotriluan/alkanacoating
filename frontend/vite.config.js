import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // Use absolute path for subdirectory deployment
  // Serve from site root in production (built assets will be referenced from '/').
  base: '/',
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: '../backend/public',
      emptyOutDir: false,
      assetsDir: 'assets',
    },
    // Make sure VITE_ prefixed env variables are available
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
    }
  }
})
