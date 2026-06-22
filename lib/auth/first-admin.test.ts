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
  it('creates a new user with role admin when email is in whitelist', async () => {
    const db = getTestPrisma();

    const result = await getOrAssignFirstAdmin(db, 'jonex.3@gmail.com');

    expect(result.email).toBe('jonex.3@gmail.com');
    expect(result.role).toBe('admin');

    const user = await db.user.findUnique({
      where: { email: 'jonex.3@gmail.com' },
    });
    expect(user).not.toBeNull();
    expect(user?.role).toBe('admin');
  });

  it('creates a new user with role view when email is NOT in whitelist', async () => {
    const db = getTestPrisma();

    const result = await getOrAssignFirstAdmin(db, 'random@gmail.com');

    expect(result.email).toBe('random@gmail.com');
    expect(result.role).toBe('view');

    const user = await db.user.findUnique({
      where: { email: 'random@gmail.com' },
    });
    expect(user).not.toBeNull();
    expect(user?.role).toBe('view');
  });

  it('returns existing user unchanged when email already exists', async () => {
    const db = getTestPrisma();

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

  it('returns existing whitelist user with their existing role (no auto-promote on read)', async () => {
    const db = getTestPrisma();

    // Create a whitelisted user with role=view (e.g. they signed in before being whitelisted)
    await db.user.create({
      data: {
        email: 'iannncelis@gmail.com',
        passwordHash: 'some-hash',
        role: 'view',
      },
    });

    const result = await getOrAssignFirstAdmin(db, 'iannncelis@gmail.com');

    // Returns existing role — promotion is the seed script's job
    expect(result.role).toBe('view');
  });
});
