import { defineConfig, devices } from '@playwright/test'

// E2E tests drive a real browser against the *production* arrangement: the
// Express backend serving the built dist + API from a single origin (same as
// Render). One webServer builds the dist, then starts the backend; the backend
// uses an isolated DATA_FILE so tests never touch real data.json.
export default defineConfig({
  testDir: './e2e',
  // All specs share one backend process + data file, so run serially.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    // Pin to 127.0.0.1 so the browser and server use IPv4 loopback
    // (avoids localhost resolving to ::1 while the server binds IPv4 only).
    baseURL: 'http://127.0.0.1:4000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Build the client, then serve it (and the API) from the backend.
    command: 'npm run build && node ../backend/server.js',
    url: 'http://127.0.0.1:4000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: { PORT: '4000', DATA_FILE: '../backend/e2e-data.json' },
  },
})
