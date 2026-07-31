import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Diagnostic: decimeshi.com prod renders a blank page (empty #root, no
    // console errors, byte-identical HTML/JS verified against a working local
    // build) — the one remaining difference is real network latency vs
    // localhost's zero-latency loopback. modulepreload hints fetch sibling
    // chunks eagerly; disabling to test whether that interacts badly with the
    // entry chunk's own dynamic imports under real-world timing.
    modulePreload: false,
  },
  server: {
    port: 3000,
    proxy: {
      // Match /api/ and /api followed by word chars — excludes /api-docs.html
      '^/api(?:/|$)': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})

