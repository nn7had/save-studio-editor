import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'write-port',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const port = server.httpServer.address().port
          fs.writeFileSync('.vite-port', String(port))
        })
      }
    }
  ],
  server: {
    port: 5173,
    strictPort: false,
  }
})