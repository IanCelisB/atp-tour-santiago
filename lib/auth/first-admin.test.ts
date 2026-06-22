import { describe, expect, it, beforeEach, afterAll } from 'vitest';
import {
  getTestPrisma,
  TEST_DB_HOOKS,
} from '@/lib/test-utils/test-db';
import { getOrAssignFirstAdmin } from './first-admin';

beforeEach(async () => {
  await TEST_DB_HOOKS.beforeEach();
});

afterAll(async () => {
  await TEST_DB_HOOKS.afterAll();
});

describe('lib/auth/first-admin', () => {
  it('creates a new user with role admin when no admin exists', async () => {
    const db = getTestPrisma();

    const result = await getOrAssignFirstAdmin(db, 'newuser@gmail.com');

    expect(result.email).toBe('newuser@gmail.com');
    expect(result.role).toBe('admin');

    const user = await db.user.findUnique({
      where: { email: 'newuser@gmail.com' },
    });
    expect(user).not.toBeNull();
    expect(user?.role).toBe('admin');
  });

  it('creates a new user with role view when an admin already exists', async () => {
    const db = getTestPrisma();

    // Create an admin first
    await db.user.create({
      data: {
        email: 'admin@gmail.com',
        passwordHash: '',
        role: 'admin',
      },
    });

    const result = await getOrAssignFirstAdmin(db, 'regular@gmail.com');

    expect(result.email).toBe('regular@gmail.com');
    expect(result.role).toBe('view');

    const user = await db.user.findUnique({
      where: { email: 'regular@gmail.com' },
    });
    expect(user).not.toBeNull();
    expect(user?.role).toBe('view');
  });

  it('returns existing user unchanged when email already exists', async () => {
    const db = getTestPrisma();

    // Pre-create user with admin role
    await db.user.create({
      data: {
        email: 'existing@gmail.com',
        passwordHash: 'some-hash',
        role: 'admin',
      },
    });

    const result = await getOrAssignFirstAdmin(db, 'existing@gmail.com');

    expect(result.email).toBe('existing@gmail.com');
    expect(result.role).toBe('admin');
  });

  it('does not create a duplicate user when email exists', async () => {
    const db = getTestPrisma();

    await db.user.create({
      data: {
        email: 'dupe@gmail.com',
        passwordHash: '',
        role: 'view',
      },
    });

    await getOrAssignFirstAdmin(db, 'dupe@gmail.com');

    const users = await db.user.findMany({
      where: { email: 'dupe@gmail.com' },
    });
    expect(users).toHaveLength(1);
  });

  it('uses admin role only for the very first user', async () => {
    const db = getTestPrisma();

    // First user → admin
    const first = await getOrAssignFirstAdmin(db, 'first@gmail.com');
    expect(first.role).toBe('admin');

    // Second user → view
    const second = await getOrAssignFirstAdmin(db, 'second@gmail.com');
    expect(second.role).toBe('view');

    // Third user → view
    const third = await getOrAssignFirstAdmin(db, 'third@gmail.com');
    expect(third.role).toBe('view');

    // Verify only one admin exists
    const adminCount = await db.user.count({ where: { role: 'admin' } });
    expect(adminCount).toBe(1);
  });
});
