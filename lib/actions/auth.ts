import type { PrismaClient } from '@prisma/client';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import { loginSchema } from '@/lib/validators/auth';

/**
 * Auth domain action — accepts PrismaClient via DI.
 *
 * Production code in app/login/actions.ts injects the singleton;
 * tests inject the test client. Same pattern as other CRUD actions.
 */

export type AuthActionResult =
  | { success: true; data: { email: string; role: string } }
  | { success: false; error: string };

export async function loginAction(
  db: PrismaClient,
  email: string,
  password: string,
): Promise<AuthActionResult> {
  // Validate input
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return { success: false, error: message };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: 'Credenciales inválidas' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: 'Credenciales inválidas' };
  }

  return { success: true, data: { email: user.email, role: user.role } };
}

/**
 * Ensure an admin user exists — used by seed script.
 */
export async function ensureAdmin(
  db: PrismaClient,
  email: string,
  password: string,
): Promise<void> {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    return;
  }

  const passwordHash = await hashPassword(password);
  const admin = await db.user.create({
    data: { email, passwordHash, role: 'admin' },
  });
  console.log('Created admin user:', admin.email);
}
