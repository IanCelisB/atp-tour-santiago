import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest';
import {
  getTestPrisma,
  TEST_DB_HOOKS,
} from '@/lib/test-utils/test-db';

/**
 * Google OAuth callback route tests.
 *
 * Mocks next/headers cookies, arctic OAuth2RequestError,
 * and global fetch to test callback behavior without hitting Google.
 */

const mockCookies: Record<string, string> = {};

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: (name: string) =>
      mockCookies[name] ? { value: mockCookies[name] } : undefined,
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

const mockGetGoogleClient = vi.fn();
vi.mock('@/lib/auth/google', () => ({
  getGoogleClient: (...args: unknown[]) => mockGetGoogleClient(...args),
  getGoogleBaseUrl: () => 'http://localhost:3000',
}));

// Mock @/lib/db to use the test Prisma client
vi.mock('@/lib/db', () => ({
  get prisma() {
    return getTestPrisma();
  },
}));

// Mock iron-session for getSession
const mockSessionSave = vi.fn();
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn().mockResolvedValue({
    userId: undefined,
    email: undefined,
    role: undefined,
    save: mockSessionSave,
  }),
}));

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(async () => {
  vi.clearAllMocks();
  // Clear all keys from mockCookies
  for (const key of Object.keys(mockCookies)) {
    delete mockCookies[key];
  }
  await TEST_DB_HOOKS.beforeEach();
});

afterAll(async () => {
  await TEST_DB_HOOKS.afterAll();
  vi.unstubAllGlobals();
});

describe('app/api/auth/google/callback/route', () => {
  it('returns 400 when state is missing', async () => {
    const { GET } = await import('./route');
    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=abc',
    );
    const request = new Request(url);

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when code is missing', async () => {
    const { GET } = await import('./route');
    mockCookies['google_oauth_state'] = 'test-state';
    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?state=test-state',
    );
    const request = new Request(url);

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when state does not match stored state', async () => {
    const { GET } = await import('./route');
    mockCookies['google_oauth_state'] = 'stored-state';
    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=abc&state=wrong-state',
    );
    const request = new Request(url);

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when google_oauth_state cookie is missing', async () => {
    const { GET } = await import('./route');
    // No cookie set
    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=abc&state=some-state',
    );
    const request = new Request(url);

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('returns 503 when Google client is null', async () => {
    const { GET } = await import('./route');
    mockGetGoogleClient.mockReturnValue(null);
    mockCookies['google_oauth_state'] = 'test-state';
    mockCookies['google_code_verifier'] = 'test-verifier';
    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=abc&state=test-state',
    );
    const request = new Request(url);

    const response = await GET(request);
    expect(response.status).toBe(503);
  });

  it('returns 400 when authorization code is invalid (OAuth2RequestError)', async () => {
    const { OAuth2RequestError } = await import('arctic');
    const { GET } = await import('./route');

    mockGetGoogleClient.mockReturnValue({
      validateAuthorizationCode: vi.fn().mockRejectedValue(
        new OAuth2RequestError('invalid_grant', 'Bad code', 400, null),
      ),
    });
    mockCookies['google_oauth_state'] = 'test-state';
    mockCookies['google_code_verifier'] = 'test-verifier';

    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=bad-code&state=test-state',
    );
    const request = new Request(url);

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('creates a new user from Google profile', async () => {
    const { GET } = await import('./route');
    const db = getTestPrisma();

    mockGetGoogleClient.mockReturnValue({
      validateAuthorizationCode: vi.fn().mockResolvedValue({
        accessToken: () => 'fake-access-token',
      }),
    });
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          email: 'jonex.3@gmail.com',
          email_verified: true,
          name: 'Admin User',
        }),
    });
    mockCookies['google_oauth_state'] = 'test-state';
    mockCookies['google_code_verifier'] = 'test-verifier';

    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=valid-code&state=test-state',
    );
    const request = new Request(url);

    const response = await GET(request);

    // Should redirect to home
    expect(response.status).toBe(307);

    // Whitelisted email → admin role
    const user = await db.user.findUnique({
      where: { email: 'jonex.3@gmail.com' },
    });
    expect(user).not.toBeNull();
    expect(user?.role).toBe('admin');
    expect(user?.passwordHash).toBe(''); // No password for OAuth users
  });

  it('uses existing user when email already exists', async () => {
    const { GET } = await import('./route');
    const db = getTestPrisma();

    // Create user first
    await db.user.create({
      data: {
        email: 'existing@gmail.com',
        passwordHash: '',
        role: 'view',
      },
    });

    mockGetGoogleClient.mockReturnValue({
      validateAuthorizationCode: vi.fn().mockResolvedValue({
        accessToken: () => 'fake-access-token',
      }),
    });
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          email: 'existing@gmail.com',
          email_verified: true,
          name: 'Existing User',
        }),
    });
    mockCookies['google_oauth_state'] = 'test-state';
    mockCookies['google_code_verifier'] = 'test-verifier';

    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=valid-code&state=test-state',
    );
    const request = new Request(url);

    const response = await GET(request);
    expect(response.status).toBe(307);

    // Should not create a duplicate
    const users = await db.user.findMany({
      where: { email: 'existing@gmail.com' },
    });
    expect(users).toHaveLength(1);
  });

  it('sets the session cookie on success', async () => {
    const { GET } = await import('./route');

    mockGetGoogleClient.mockReturnValue({
      validateAuthorizationCode: vi.fn().mockResolvedValue({
        accessToken: () => 'fake-access-token',
      }),
    });
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          email: 'session-test@gmail.com',
          email_verified: true,
          name: 'Session User',
        }),
    });
    mockCookies['google_oauth_state'] = 'test-state';
    mockCookies['google_code_verifier'] = 'test-verifier';

    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=valid-code&state=test-state',
    );
    const request = new Request(url);

    await GET(request);

    expect(mockSessionSave).toHaveBeenCalled();
  });

  it('returns 400 when Google email is not verified', async () => {
    const { GET } = await import('./route');

    mockGetGoogleClient.mockReturnValue({
      validateAuthorizationCode: vi.fn().mockResolvedValue({
        accessToken: () => 'fake-access-token',
      }),
    });
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          email: 'unverified@gmail.com',
          email_verified: false,
          name: 'Unverified User',
        }),
    });
    mockCookies['google_oauth_state'] = 'test-state';
    mockCookies['google_code_verifier'] = 'test-verifier';

    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=valid-code&state=test-state',
    );
    const request = new Request(url);

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when Google profile has no email', async () => {
    const { GET } = await import('./route');

    mockGetGoogleClient.mockReturnValue({
      validateAuthorizationCode: vi.fn().mockResolvedValue({
        accessToken: () => 'fake-access-token',
      }),
    });
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          name: 'No Email User',
        }),
    });
    mockCookies['google_oauth_state'] = 'test-state';
    mockCookies['google_code_verifier'] = 'test-verifier';

    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=valid-code&state=test-state',
    );
    const request = new Request(url);

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  // --- Google cancel / OAuth error redirect tests ---

  it('redirects to /login?error=google_cancelled when access_denied', async () => {
    const { GET } = await import('./route');
    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?error=access_denied&state=some-state',
    );
    const request = new Request(url);

    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toContain('/login?error=google_cancelled');
  });

  it('redirects to /login?error=google_invalid when invalid_request', async () => {
    const { GET } = await import('./route');
    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?error=invalid_request',
    );
    const request = new Request(url);

    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toContain('/login?error=google_invalid');
  });

  it('redirects to /login?error=google_error on other errors', async () => {
    const { GET } = await import('./route');
    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?error=server_error',
    );
    const request = new Request(url);

    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toContain('/login?error=google_error');
  });

  it('does not require state validation when error is present', async () => {
    const { GET } = await import('./route');
    // No cookies set, no state — but error param should still redirect
    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?error=access_denied',
    );
    const request = new Request(url);

    const response = await GET(request);

    // Should redirect, NOT return 400
    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toContain('/login?error=google_cancelled');
  });

  // --- Admin role resolution tests (whitelist-based) ---

  it('creates whitelisted user as admin via Google OAuth', async () => {
    const { GET } = await import('./route');
    const db = getTestPrisma();

    mockGetGoogleClient.mockReturnValue({
      validateAuthorizationCode: vi.fn().mockResolvedValue({
        accessToken: () => 'fake-access-token',
      }),
    });
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          email: 'iannncelis@gmail.com',
          email_verified: true,
          name: 'Admin User',
        }),
    });
    mockCookies['google_oauth_state'] = 'test-state';
    mockCookies['google_code_verifier'] = 'test-verifier';

    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=valid-code&state=test-state',
    );
    const request = new Request(url);

    const response = await GET(request);
    expect(response.status).toBe(307);

    // Whitelisted email → admin
    const user = await db.user.findUnique({
      where: { email: 'iannncelis@gmail.com' },
    });
    expect(user).not.toBeNull();
    expect(user?.role).toBe('admin');
  });

  it('creates non-whitelisted user as view via Google OAuth', async () => {
    const { GET } = await import('./route');
    const db = getTestPrisma();

    // Create an admin user first
    await db.user.create({
      data: {
        email: 'existing-admin@gmail.com',
        passwordHash: '',
        role: 'admin',
      },
    });

    mockGetGoogleClient.mockReturnValue({
      validateAuthorizationCode: vi.fn().mockResolvedValue({
        accessToken: () => 'fake-access-token',
      }),
    });
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          email: 'second-user@gmail.com',
          email_verified: true,
          name: 'Second User',
        }),
    });
    mockCookies['google_oauth_state'] = 'test-state';
    mockCookies['google_code_verifier'] = 'test-verifier';

    const url = new URL(
      'http://localhost:3000/api/auth/google/callback?code=valid-code&state=test-state',
    );
    const request = new Request(url);

    const response = await GET(request);
    expect(response.status).toBe(307);

    // New user should be created as view
    const user = await db.user.findUnique({
      where: { email: 'second-user@gmail.com' },
    });
    expect(user).not.toBeNull();
    expect(user?.role).toBe('view');
  });
});
