import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // Needed for Docker
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://nginx:80', // Docker service name
        changeOrigin: true,
        headers: {
          Accept: 'application/json',
          "X-Requested-With": "XMLHttpRequest",
        },
      },
      '/storage': {
        target: 'http://nginx:80',
        changeOrigin: true,
      }
    }
  },
  plugins: [vue()],
})
