import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
    // Unit tests live in src/ (*.test.jsx); e2e specs (e2e/*.spec.js) run via Playwright.
    include: ['src/**/*.test.{js,jsx}'],
  },
})
