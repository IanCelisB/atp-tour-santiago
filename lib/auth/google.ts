import { Google } from 'arctic';

let _google: Google | null = null;

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
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
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
