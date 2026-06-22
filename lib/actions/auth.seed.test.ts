import { describe, expect, it, beforeEach, afterAll } from 'vitest';
import {
  getTestPrisma,
  TEST_DB_HOOKS,
} from '@/lib/test-utils/test-db';

/**
 * Seed script tests — ensureAdmin function.
 *
 * Verifies:
 * - Creates new admin user with hashed password
 * - Updates role for existing user (preserves password)
 * - Updates password for user with empty hash (OAuth-only user)
 * - Leaves existing user with non-empty password untouched
 */

import { ensureAdmin } from '@/lib/actions/auth';

beforeEach(async () => {
  await TEST_DB_HOOKS.beforeEach();
});

afterAll(async () => {
  await TEST_DB_HOOKS.afterAll();
});

describe('ensureAdmin (seed helper)', () => {
  it('creates a new admin user with hashed password', async () => {
    const db = getTestPrisma();
    await ensureAdmin(db, 'new-admin@test.com', 'password123');

    const user = await db.user.findUnique({ where: { email: 'new-admin@test.com' } });
    expect(user).not.toBeNull();
    expect(user?.role).toBe('admin');
    expect(user?.passwordHash).not.toBe('');
    expect(user?.passwordHash).not.toBe('password123'); // should be hashed
  });

  it('updates role for existing user without touching their password', async () => {
    const db = getTestPrisma();
    await db.user.create({
      data: {
        email: 'existing@test.com',
        passwordHash: 'preserved-hash',
        role: 'view',
      },
    });

    await ensureAdmin(db, 'existing@test.com', 'new-password');

    const user = await db.user.findUnique({ where: { email: 'existing@test.com' } });
    expect(user?.role).toBe('admin');
    expect(user?.passwordHash).toBe('preserved-hash'); // unchanged
  });

  it('updates password for user with empty hash (OAuth-only user)', async () => {
    const db = getTestPrisma();
    await db.user.create({
      data: {
        email: 'oauth-user@test.com',
        passwordHash: '', // OAuth-only user, no password
        role: 'view',
      },
    });

    await ensureAdmin(db, 'oauth-user@test.com', 'new-password');

    const user = await db.user.findUnique({ where: { email: 'oauth-user@test.com' } });
    expect(user?.role).toBe('admin');
    expect(user?.passwordHash).not.toBe(''); // password was set
    expect(user?.passwordHash).not.toBe('new-password'); // but hashed
  });

  it('is idempotent — calling twice does not double-create', async () => {
    const db = getTestPrisma();
    await ensureAdmin(db, 'idem@test.com', 'password123');
    await ensureAdmin(db, 'idem@test.com', 'password123');

    const users = await db.user.findMany({ where: { email: 'idem@test.com' } });
    expect(users).toHaveLength(1);
  });
});
