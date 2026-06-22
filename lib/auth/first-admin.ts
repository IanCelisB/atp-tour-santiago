import type { PrismaClient } from '@prisma/client';

/**
 * Auto-promote first user to admin — used by Google OAuth callback and any
 * future registration flow.
 *
 * Security: The first user to ever log in becomes admin. After that, new users
 * are always 'view' and admin promotion must be done via a separate script
 * (deliberate, audited action). This is appropriate for personal projects
 * where the operator is the first user.
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

  // Check if any admin exists
  const adminCount = await db.user.count({ where: { role: 'admin' } });
  const role: 'admin' | 'view' = adminCount === 0 ? 'admin' : 'view';

  const user = await db.user.create({
    data: {
      email,
      passwordHash: '',
      role,
    },
  });
  return { id: user.id, email: user.email, role };
}
