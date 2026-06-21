import { expect, test } from '@playwright/test';

/**
 * E2E smoke test for the homepage (spec REQ-BOOT-4 B4.a, B10.b).
 *
 * Verifies two real behaviors:
 * 1. The Next.js dev server responds 200 on `/`.
 * 2. The production homepage renders the expected brand heading.
 */
test.describe('Homepage', () => {
  test('responds with 200 and renders the ATP Tour Santiago heading', async ({ page, request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'ATP Tour Santiago' })).toBeVisible();
  });
});
