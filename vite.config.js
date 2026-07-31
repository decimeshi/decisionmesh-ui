import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Root cause of the prod-only blank page, found via extensive live
        // bisection on decimeshi.com: Rollup's automatic chunking split each
        // lucide-react icon into its own ~300-400 byte chunk file, all
        // importing a shared tiny "copy" chunk. Confirmed by direct testing
        // that importing any ONE of these chunks works fine, and importing
        // TWO unrelated ones together works fine, but importing certain
        // pairs that both depend on the same tiny shared chunk (e.g.
        // book-open + shield-off, both importing copy-*.js) reproducibly
        // fails to load as a module graph — every dependency file fetches
        // successfully on its own (confirmed via fetch() and individual
        // import()), yet the combined graph throws "Failed to fetch
        // dynamically imported module" with zero console/CSP/window error
        // of any kind. experimentalMinChunkSize alone didn't merge these
        // (still emitted as separate files), so force it explicitly: every
        // lucide-react module (every icon plus its shared createLucideIcon
        // helper) goes into one chunk, eliminating the diamond-dependency
        // pattern between them entirely rather than working around whatever
        // triggers it.
        manualChunks(id) {
          if (id.includes('lucide-react')) return 'icons';
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

