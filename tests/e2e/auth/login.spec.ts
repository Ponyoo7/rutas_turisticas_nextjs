import { expect, test } from '@playwright/test'

const loginEmail = process.env.E2E_USER_EMAIL
const loginPassword = process.env.E2E_USER_PASSWORD

test.describe('login flow', () => {
  test.skip(
    !loginEmail || !loginPassword,
    'Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run this example.',
  )

  test('allows an existing user to sign in', async ({ context, page }) => {
    await page.goto('/login')

    await page.locator('input[name="email"]').fill(loginEmail!)
    await page.locator('input[name="password"]').fill(loginPassword!)
    await page.locator('form').getByRole('button').click()

    await expect(page).toHaveURL(/\/$/)

    const authCookie = (await context.cookies()).find(
      (cookie) => cookie.name === 'auth',
    )

    expect(authCookie).toBeTruthy()

    await page.goto('/perfil')
    await expect(page).toHaveURL(/\/perfil$/)
  })
})
