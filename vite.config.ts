import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

/**
 * Vite configuration for KejaLink.
 *
 * @tailwindcss/vite replaces the old @tailwindcss/postcss + postcss.config.mjs
 * setup — no separate PostCSS config file is needed. The plugin processes
 * `@import 'tailwindcss'` in index.css directly.
 *
 * Path alias `@/` resolves to `src/` so imports like `@/components/Logo`
 * work across the entire codebase without relative path gymnastics.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target:    'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        /**
         * Split vendor code into named chunks so the browser can cache
         * each independently. User code changes don't bust the React or
         * icons cache, and icon updates don't bust the React cache.
         */
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router':       ['react-router-dom'],
          'query':        ['@tanstack/react-query'],
          'icons':        ['lucide-react'],
          'motion':       ['framer-motion'],
        },
      },
    },
  },
})
