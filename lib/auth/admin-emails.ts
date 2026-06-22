/**
 * Centralized whitelist of admin emails.
 *
 * Single source of truth — used by:
 *   - Google OAuth callback (lib/auth/first-admin.ts → resolveRole)
 *   - Future sign-up flows (same)
 *   - Seed script (prisma/seed.ts)
 *
 * Case-insensitive match (emails are normalized to lowercase before comparison).
 *
 * To promote a new admin: add their email here AND run `pnpm db:seed` (if they
 * need password-based login) OR have them sign in via Google (auto-creates
 * with role='admin' from this whitelist).
 */
export const ADMIN_EMAILS: readonly string[] = [
  'jonex.3@gmail.com',
  'iannncelis@gmail.com',
] as const;

/**
 * Returns true if the given email is in the admin whitelist.
 * Case-insensitive. Trims whitespace.
 */
export function isAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

/**
 * Resolves the role for a given email.
 * - Admin email (whitelist match) → 'admin'
 * - Any other email → 'view'
 *
 * The legacy "first user becomes admin" fallback is gone — the whitelist
 * is the ONLY mechanism for auto-promotion. Use the seed script + the
 * ADMIN_EMAILS list to bootstrap admin accounts.
 */
export function resolveRole(email: string): 'admin' | 'view' {
  return isAdminEmail(email) ? 'admin' : 'view';
}
