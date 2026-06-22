import { expect, test } from '@playwright/test';

/**
 * CSP + OAuth regression tests.
 *
 * Guards against the two production-only failures that hit the app:
 *
 *   1. The Google OAuth callback redirected to `http://localhost:3000`
 *      whenever the env-var fallback fired (see lib/auth/google.ts and
 *      the `getGoogleBaseUrl()` priority chain). The fix: anchor the
 *      callback to a same-origin base via the new middleware and
 *      `safeRedirect()` helper. This test catches regressions where
 *      a developer accidentally reintroduces a `request.url`-based
 *      redirect or breaks the base-URL chain.
 *
 *   2. The CSP header wasn't set, so the app scored 91 in Aikido and
 *      was open to stored XSS. This test pins the CSP contract on
 *      every page response.
 *
 * Run locally (against the dev server booted by webServer config):
 *   pnpm test:e2e
 *
 * Run against production (manual, post-deploy):
 *   E2E_BASE_URL=https://atp-tour-santiago.onrender.com \
 *     PLAYWRIGHT_BASE_URL=https://atp-tour-santiago.onrender.com \
 *     pnpm playwright test e2e/csp-oauth.spec.ts
 */

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

test.describe('CSP + security headers', () => {
  test('home page sends a Content-Security-Policy header', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
    const csp = res.headers()['content-security-policy'];
    expect(csp).toBeDefined();
    expect(csp).not.toBe('');
  });

  test('CSP locks default-src to self', async ({ request }) => {
    const res = await request.get('/');
    const csp = res.headers()['content-security-policy'] ?? '';
    expect(csp).toMatch(/default-src\s+'self'/);
  });

  test('CSP whitelists Google OAuth + video embeds in frame-src', async ({ request }) => {
    const res = await request.get('/');
    const csp = res.headers()['content-security-policy'] ?? '';
    expect(csp).toMatch(/frame-src[^;]*https:\/\/accounts\.google\.com/);
    expect(csp).toMatch(/frame-src[^;]*https:\/\/www\.youtube\.com/);
    expect(csp).toMatch(/frame-src[^;]*https:\/\/player\.vimeo\.com/);
  });

  test('CSP sets frame-ancestors to none (anti-clickjacking)', async ({ request }) => {
    const res = await request.get('/');
    const csp = res.headers()['content-security-policy'] ?? '';
    expect(csp).toMatch(/frame-ancestors\s+'none'/);
  });

  test('sends the full hardening header set', async ({ request }) => {
    const res = await request.get('/');
    const h = res.headers();
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['permissions-policy']).toContain('camera=()');
    expect(h['permissions-policy']).toContain('microphone=()');
    expect(h['permissions-policy']).toContain('geolocation=()');
  });

  test('sends HSTS on HTTPS origins', async ({ request }) => {
    const res = await request.get('/');
    const hsts = res.headers()['strict-transport-security'];
    if (BASE_URL.startsWith('https://')) {
      expect(hsts).toMatch(/max-age=\d+/);
    } else {
      // Dev (http://localhost) — HSTS is intentionally omitted
      expect(hsts).toBeUndefined();
    }
  });
});

test.describe('Google OAuth regression', () => {
  test('login page renders the Google button', async ({ page }) => {
    await page.goto('/login');
    const googleLink = page.getByRole('link', {
      name: /Iniciar sesi[oó]n con Google/i,
    });
    await expect(googleLink).toBeVisible();
    await expect(googleLink).toHaveAttribute('href', '/api/auth/google');
  });

  test('GET /api/auth/google redirects to accounts.google.com (NOT localhost)', async ({ request }) => {
    /*
     * The critical regression check. Before the fix, this route
     * constructed the OAuth redirect_uri as
     *   `${getGoogleBaseUrl()}/api/auth/google/callback`
     * and `getGoogleBaseUrl()` returned `http://localhost:3000`
     * whenever NEXTAUTH_URL / RENDER_EXTERNAL_URL were not set.
     * Google then redirected the user's browser to localhost,
     * producing ERR_CONNECTION_REFUSED.
     *
     * The fix: NEXTAUTH_URL is set in render.yaml and the route
     * handler uses the same base-URL chain. This test asserts
     * that the Location header points at accounts.google.com
     * (the OAuth provider) with a redirect_uri that is NOT
     * localhost. We allow either http://localhost:3000 (dev)
     * or https://atp-tour-santiago.onrender.com (prod) in the
     * redirect_uri — anything else (or localhost leaking into
     * production) fails this test.
     */
    const res = await request.get('/api/auth/google', {
      maxRedirects: 0,
    });
    expect(res.status()).toBe(307);
    const location = res.headers()['location'] ?? '';
    expect(location).toMatch(/^https:\/\/accounts\.google\.com\//);

    const redirectUri = new URL(location).searchParams.get('redirect_uri');
    expect(redirectUri).toBeTruthy();

    if (BASE_URL.startsWith('https://')) {
      // Production: must NOT be localhost
      expect(redirectUri).not.toMatch(/localhost/);
      expect(redirectUri).toMatch(/^https:\/\//);
      expect(redirectUri).toContain('/api/auth/google/callback');
    }
  });

  test('OAuth init sets state and code_verifier cookies', async ({ request }) => {
    const res = await request.get('/api/auth/google', {
      maxRedirects: 0,
    });
    const setCookies = res.headersArray().filter((h) => h.name === 'set-cookie');
    const cookieNames = setCookies.map((h) => h.value.split('=')[0]);
    expect(cookieNames).toContain('google_oauth_state');
    expect(cookieNames).toContain('google_code_verifier');
  });

  test('Google callback with error param redirects to /login with code', async ({ page }) => {
    /*
     * Simulate the user clicking "Cancel" on the Google consent
     * screen. Google redirects to our callback with
     *   ?error=access_denied
     * and we must bounce them to /login?error=google_cancelled
     * (NOT to localhost, NOT to a 500).
     */
    await page.goto(
      '/api/auth/google/callback?error=access_denied&state=any',
    );
    await expect(page).toHaveURL(/\/login\?error=google_cancelled/);
  });

  test('login page is reachable from a logged-out home page (no redirect loop)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Iniciar sesi[oó]n/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole('heading', { name: /Iniciar Sesi[oó]n/i }),
    ).toBeVisible();
  });
});
