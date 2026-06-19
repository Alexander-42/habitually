import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: { jsx: 'automatic' },
  server: {
    // Proxy API calls to the backend during dev so the app can use relative /api.
    proxy: {
      '/api': 'http://127.0.0.1:4000',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
    // Unit tests live in src/ (*.test.jsx); e2e specs (e2e/*.spec.js) run via Playwright.
    include: ['src/**/*.test.{js,jsx}'],
  },
})
