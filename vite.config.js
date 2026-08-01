import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Root cause of a recurring prod-only blank page, found via extensive
        // live bisection on decimeshi.com: certain PAIRS of small auto-split
        // chunks that share a common tiny dependency (a diamond-dependency
        // pattern — e.g. two lucide-react icons both importing a shared
        // createLucideIcon helper chunk) reproducibly fail to load as a
        // combined module graph in the browser, even though every chunk in
        // the pair fetches and imports fine on its own. No console, window,
        // CSP, or script-element error of any kind — just a silently blank
        // page. First hit with lucide-react icons; recurred with the shared
        // Page layout component once the codebase grew enough for the
        // bundler (this project builds with Vite's Rolldown bundler) to
        // split it out too — narrowly scoping the first fix to
        // "lucide-react" wasn't enough, since the actual trigger is the
        // small-shared-chunk pattern in general, not any specific module.
        // Consolidating all vendor code and shared UI into one chunk each
        // removes the possibility of this pattern recurring with some other
        // module in the future, rather than chasing it module-by-module.
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('/src/components/shared/')) return 'vendor';
        },
      },
    },
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

