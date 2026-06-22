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
 */
export function getGoogleBaseUrl(): string {
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  return 'http://localhost:3000';
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
