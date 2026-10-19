import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Bind to 0.0.0.0 so the dev server is reachable from other machines on the
  // LAN via this host's IP (e.g. http://192.168.1.20:5173/). Vite prints the
  // Network URL on startup.
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
})
