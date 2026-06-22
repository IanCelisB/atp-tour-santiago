import type { PrismaClient } from '@prisma/client';
import { resolveRole } from './admin-emails';

/**
 * Get existing user or create a new one with role resolved from the admin
 * email whitelist.
 *
 * Used by Google OAuth callback and any future sign-up flow.
 *
 * Security: ONLY emails in lib/auth/admin-emails.ts get role='admin'. All
 * other emails get role='view'. No fallback, no race conditions.
 */
export async function getOrAssignFirstAdmin(
  db: PrismaClient,
  email: string,
): Promise<{ id: string; email: string; role: 'admin' | 'view' }> {
  // Check if user already exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      role: existing.role as 'admin' | 'view',
    };
  }

  // Resolve role from whitelist
  const role = resolveRole(email);

  const user = await db.user.create({
    data: {
      email,
      passwordHash: '', // no password for OAuth users
      role,
    },
  });
  return { id: user.id, email: user.email, role };
}
