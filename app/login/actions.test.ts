import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Login server action tests.
 *
 * Verifies:
 * - On success: session is saved with correct fields
 * - On success: server-side redirect to / is triggered
 * - On failure: no redirect, no session save
 *
 * Mocks: getSession, prisma, loginDomainAction, next/navigation redirect.
 */

const mockSessionSave = vi.fn();
const mockSessionDestroy = vi.fn();
const mockGetSession = vi.fn().mockResolvedValue({
  userId: undefined,
  email: undefined,
  role: undefined,
  save: mockSessionSave,
  destroy: mockSessionDestroy,
});

vi.mock('@/lib/auth/session', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

const mockPrismaUserFindUnique = vi.fn();
vi.mock('@/lib/db', () => ({
  get prisma() {
    return {
      user: { findUnique: mockPrismaUserFindUnique },
    };
  },
}));

const mockLoginDomainAction = vi.fn();
vi.mock('@/lib/actions/auth', () => ({
  loginAction: (...args: unknown[]) => mockLoginDomainAction(...args),
}));

const mockRedirect = vi.fn((url: string) => {
  const err = new Error(`NEXT_REDIRECT:${url}`);
  (err as unknown as { digest: string }).digest = `NEXT_REDIRECT;replace;${url};307;`;
  throw err;
});
vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue({
    userId: undefined,
    email: undefined,
    role: undefined,
    save: mockSessionSave,
    destroy: mockSessionDestroy,
  });
});

describe('app/login/actions — loginAction (server action)', () => {
  it('redirects to / on successful login', async () => {
    const { loginAction } = await import('./actions');
    mockLoginDomainAction.mockResolvedValue({
      success: true,
      data: { email: 'admin@test.com', role: 'admin' },
    });
    mockPrismaUserFindUnique.mockResolvedValue({ id: 'user-1' });

    const fd = new FormData();
    fd.set('email', 'admin@test.com');
    fd.set('password', 'password123');

    await expect(loginAction(fd)).rejects.toThrow(/NEXT_REDIRECT/);
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('saves session with email, role, and real userId on success', async () => {
    const { loginAction } = await import('./actions');
    const mockSession: Record<string, unknown> = {
      save: mockSessionSave,
      destroy: mockSessionDestroy,
    };
    mockGetSession.mockResolvedValue(mockSession);
    mockLoginDomainAction.mockResolvedValue({
      success: true,
      data: { email: 'admin@test.com', role: 'admin' },
    });
    mockPrismaUserFindUnique.mockResolvedValue({ id: 'real-user-id-123' });

    const fd = new FormData();
    fd.set('email', 'admin@test.com');
    fd.set('password', 'password123');

    try {
      await loginAction(fd);
    } catch {
      // expected to throw NEXT_REDIRECT
    }

    expect(mockSession.email).toBe('admin@test.com');
    expect(mockSession.role).toBe('admin');
    expect(mockSession.userId).toBe('real-user-id-123');
    expect(mockSessionSave).toHaveBeenCalled();
  });

  it('does not redirect or save session on failed login', async () => {
    const { loginAction } = await import('./actions');
    mockLoginDomainAction.mockResolvedValue({
      success: false,
      error: 'Credenciales inválidas',
    });

    const fd = new FormData();
    fd.set('email', 'admin@test.com');
    fd.set('password', 'wrongpass');

    const result = await loginAction(fd);

    expect(result.success).toBe(false);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockSessionSave).not.toHaveBeenCalled();
  });

  it('redirects to / for non-admin users too (view role)', async () => {
    const { loginAction } = await import('./actions');
    mockLoginDomainAction.mockResolvedValue({
      success: true,
      data: { email: 'viewer@test.com', role: 'view' },
    });
    mockPrismaUserFindUnique.mockResolvedValue({ id: 'viewer-id' });

    const fd = new FormData();
    fd.set('email', 'viewer@test.com');
    fd.set('password', 'password123');

    await expect(loginAction(fd)).rejects.toThrow(/NEXT_REDIRECT/);
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });
});
