import { expect } from '@playwright/test'

// Unique per call so parallel tests never collide on the shared backend store.
export function uniqueUsername(prefix = 'e2e') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
}

// Register a fresh account and land on the dashboard. Returns the username.
export async function registerNewUser(page) {
  const username = uniqueUsername()
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign up' }).click()
  await page.getByLabel('Username').fill(username)
  await page.getByLabel('Password').fill('secret123')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText(`Hi, ${username}`)).toBeVisible()
  return username
}
