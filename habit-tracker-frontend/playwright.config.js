import { defineConfig, devices } from '@playwright/test'

// E2E tests drive a real browser against the running frontend + backend.
// Playwright starts both servers below; the backend uses an isolated DATA_FILE
// so tests never touch real data.json.
export default defineConfig({
  testDir: './e2e',
  // All specs share one backend process + data file, so run serially.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    // Pin to 127.0.0.1 so the browser and servers all use IPv4 loopback
    // (avoids localhost resolving to ::1 while a server binds IPv4 only).
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'node ../backend/server.js',
      url: 'http://127.0.0.1:4000/api/health',
      reuseExistingServer: !process.env.CI,
      env: { PORT: '4000', DATA_FILE: '../backend/e2e-data.json' },
    },
    {
      // The app uses relative /api; Vite's dev proxy forwards it to the backend.
      command: 'npm run dev -- --port 5173 --host 127.0.0.1',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
