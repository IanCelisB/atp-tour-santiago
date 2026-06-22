import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Session helper tests.
 *
 * We mock `next/headers` cookies() and `iron-session` getIronSession
 * to control session state without real HTTP cookies.
 */

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: () => [] }),
}));

const mockGetIronSession = vi.fn();

vi.mock('iron-session', () => ({
  getIronSession: (...args: unknown[]) => mockGetIronSession(...args),
}));

// Must import AFTER mocks are set up
const { getSession, requireAdmin, isAdmin } = await import('./session');

function setMockSession(data: Record<string, unknown> | null) {
  if (data) {
    mockGetIronSession.mockResolvedValue({
      ...data,
      save: vi.fn(),
      destroy: vi.fn(),
    });
  } else {
    // Empty session object (no userId, no role)
    mockGetIronSession.mockResolvedValue({
      save: vi.fn(),
      destroy: vi.fn(),
    });
  }
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('lib/auth/session', () => {
  describe('getSession', () => {
    it('returns a session object when called', async () => {
      setMockSession({ userId: 'u1', role: 'admin' });
      const session = await getSession();
      expect(session).toBeDefined();
      expect(mockGetIronSession).toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('returns true when session role is admin', async () => {
      setMockSession({ userId: 'u1', role: 'admin' });
      const result = await isAdmin();
      expect(result).toBe(true);
    });

    it('returns false when session role is view', async () => {
      setMockSession({ userId: 'u1', role: 'view' });
      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('returns false when session has no role', async () => {
      setMockSession({ userId: 'u1' });
      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('returns false when session is empty', async () => {
      setMockSession(null);
      const result = await isAdmin();
      expect(result).toBe(false);
    });
  });

  describe('requireAdmin', () => {
    it('returns session when role is admin', async () => {
      setMockSession({ userId: 'u1', email: 'a@b.com', role: 'admin' });
      const session = await requireAdmin();
      expect(session.role).toBe('admin');
    });

    it('throws when session has no role', async () => {
      setMockSession({ userId: 'u1' });
      await expect(requireAdmin()).rejects.toThrow(/forbidden/i);
    });

    it('throws when session role is view', async () => {
      setMockSession({ userId: 'u1', role: 'view' });
      await expect(requireAdmin()).rejects.toThrow(/forbidden/i);
    });

    it('throws when session is empty', async () => {
      setMockSession(null);
      await expect(requireAdmin()).rejects.toThrow(/forbidden/i);
    });
  });
});
