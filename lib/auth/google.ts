import { Google } from 'arctic';

let _google: Google | null = null;

/**
 * Resolves the public base URL for OAuth redirects.
 *
 * Priority:
 *   1. RENDER_EXTERNAL_URL (injected by Render in production)
 *   2. NEXTAUTH_URL (manual override)
 *   3. NEXT_PUBLIC_BASE_URL (legacy)
 *   4. http://localhost:3000 (local dev fallback)
 *
 * Strips trailing slashes so the constructed callback URL never has
 * a double slash (e.g. `https://app.com//api/auth/google/callback`).
 */
export function getGoogleBaseUrl(): string {
  const raw =
    process.env.RENDER_EXTERNAL_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}

/**
 * Returns a configured Google OAuth client, or null if credentials are missing.
 *
 * Uses a singleton pattern — the same instance is reused across hot reloads.
 * The redirect URI points to our callback route.
 */
export function getGoogleClient(): Google | null {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) return null;

  if (!_google) {
    const redirectUri = `${getGoogleBaseUrl()}/api/auth/google/callback`;
    _google = new Google(id, secret, redirectUri);
  }
  return _google;
}

/**
 * Quick check — are Google OAuth credentials configured?
 * Used by the login page to show/hide the Google button.
 */
export function isGoogleConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
}
