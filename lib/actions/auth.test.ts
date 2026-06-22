import { describe, expect, it, beforeEach, afterAll } from 'vitest';
import {
  getTestPrisma,
  TEST_DB_HOOKS,
} from '@/lib/test-utils/test-db';

/**
 * Auth domain action tests.
 *
 * Tests run against prisma/test.db with DI — the test PrismaClient
 * is injected directly into the domain action function.
 *
 * Note: Role is set at user creation time via getOrAssignFirstAdmin (Google
 * OAuth) or the seed script. loginAction only authenticates existing users —
 * it does not create users or assign roles.
 */

import { loginAction } from '@/lib/actions/auth';
import { hashPassword } from '@/lib/auth/password';

beforeEach(async () => {
  await TEST_DB_HOOKS.beforeEach();
});

afterAll(async () => {
  await TEST_DB_HOOKS.afterAll();
});

describe('lib/actions/auth — loginAction', () => {
  it('succeeds with valid admin credentials', async () => {
    const db = getTestPrisma();
    const hash = await hashPassword('admin123');
    await db.user.create({
      data: { email: 'admin@atp.local', passwordHash: hash, role: 'admin' },
    });

    const result = await loginAction(db, 'admin@atp.local', 'admin123');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('admin@atp.local');
      expect(result.data.role).toBe('admin');
    }
  });

  it('succeeds with valid view credentials', async () => {
    const db = getTestPrisma();
    const hash = await hashPassword('viewer1');
    await db.user.create({
      data: { email: 'viewer@atp.local', passwordHash: hash, role: 'view' },
    });

    const result = await loginAction(db, 'viewer@atp.local', 'viewer1');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('viewer@atp.local');
      expect(result.data.role).toBe('view');
    }
  });

  it('fails with invalid password', async () => {
    const db = getTestPrisma();
    const hash = await hashPassword('admin123');
    await db.user.create({
      data: { email: 'admin@atp.local', passwordHash: hash, role: 'admin' },
    });

    const result = await loginAction(db, 'admin@atp.local', 'wrongpass');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/credenciales inválidas/i);
    }
  });

  it('fails with non-existent email', async () => {
    const db = getTestPrisma();

    const result = await loginAction(db, 'nobody@test.com', 'admin123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/credenciales inválidas/i);
    }
  });

  it('fails with short password', async () => {
    const db = getTestPrisma();

    const result = await loginAction(db, 'admin@atp.local', '123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/6 characters|6 caracteres/i);
    }
  });

  it('fails with missing email', async () => {
    const db = getTestPrisma();

    const result = await loginAction(db, '', 'admin123');

    expect(result.success).toBe(false);
  });

  it('fails with missing password', async () => {
    const db = getTestPrisma();

    const result = await loginAction(db, 'admin@atp.local', '');

    expect(result.success).toBe(false);
  });
});
