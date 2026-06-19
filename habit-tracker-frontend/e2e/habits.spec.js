import { test, expect } from '@playwright/test'
import { registerNewUser } from './helpers'

test.describe('Habit tracking', () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page)
  })

  test('adds a habit from a preset chip', async ({ page }) => {
    await page.getByRole('button', { name: 'Drink water' }).click()

    const list = page.locator('.habit-list')
    await expect(list.getByText('Drink water')).toBeVisible()
    await expect(page.getByText('No habits yet.')).toHaveCount(0)

    const habitsStat = page.locator('.stat-chip', { hasText: 'Habits' })
    await expect(habitsStat.locator('.stat-value')).toHaveText('1')
  })

  test('adds a custom habit via the text input', async ({ page }) => {
    await page.getByLabel('New habit name').fill('Floss')
    await page.getByRole('button', { name: 'Add habit' }).click()

    await expect(page.locator('.habit-list').getByText('Floss')).toBeVisible()
  })

  test('hides a preset chip once that habit is added', async ({ page }) => {
    await page.getByRole('button', { name: 'Read', exact: true }).click()
    // The preset chip is gone (the delete button "Delete Read" is separate).
    await expect(
      page.getByRole('button', { name: 'Read', exact: true })
    ).toHaveCount(0)
  })

  test('marks a habit done for today and updates the stats', async ({ page }) => {
    await page.getByRole('button', { name: 'Exercise' }).click()

    const todayCell = page
      .locator('.habit-row', { hasText: 'Exercise' })
      .locator('.day-cell.today')

    await expect(todayCell).toHaveAttribute('aria-pressed', 'false')
    await todayCell.click()
    await expect(todayCell).toHaveAttribute('aria-pressed', 'true')
    await expect(todayCell).toHaveClass(/done/)

    const doneStat = page.locator('.stat-chip', { hasText: 'Done today' })
    await expect(doneStat.locator('.stat-value')).toHaveText('1/1')
  })

  test('deletes a habit', async ({ page }) => {
    await page.getByLabel('New habit name').fill('Floss')
    await page.getByRole('button', { name: 'Add habit' }).click()
    await expect(page.locator('.habit-list').getByText('Floss')).toBeVisible()

    await page.getByRole('button', { name: 'Delete Floss' }).click()
    await expect(page.getByText('No habits yet.')).toBeVisible()
  })
})
