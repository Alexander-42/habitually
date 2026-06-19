import { test, expect } from '@playwright/test'
import { registerNewUser, uniqueUsername } from './helpers'

test.describe('Authentication', () => {
  test('shows the login view on first visit', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Habitually/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible()
    await expect(page.getByText(/^Hi,/)).toHaveCount(0)
  })

  test('registers a new user and lands on the dashboard', async ({ page }) => {
    await registerNewUser(page)
    await expect(page.getByRole('heading', { name: 'Add a habit' })).toBeVisible()
    await expect(page.getByText('No habits yet.')).toBeVisible()
  })

  test('persists the session across a page reload', async ({ page }) => {
    const username = await registerNewUser(page)
    await page.reload()
    await expect(page.getByText(`Hi, ${username}`)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Log in' })).toHaveCount(0)
  })

  test('logs out back to the login view', async ({ page }) => {
    await registerNewUser(page)
    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Add a habit' })).toHaveCount(0)
  })

  test('rejects invalid login credentials', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill(uniqueUsername('nope'))
    await page.getByLabel('Password').fill('wrongpass')
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page.getByText('Invalid username or password')).toBeVisible()
  })
})
