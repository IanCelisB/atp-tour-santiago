import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Google OAuth initiation route tests.
 *
 * Mocks next/headers cookies, arctic generateState/generateCodeVerifier,
 * and lib/auth/google getGoogleClient to test route behavior.
 */

const mockSet = vi.fn();
const mockGet = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: mockSet,
    get: mockGet,
    delete: vi.fn(),
  }),
}));

const mockGetGoogleClient = vi.fn();
vi.mock('@/lib/auth/google', () => ({
  getGoogleClient: (...args: unknown[]) => mockGetGoogleClient(...args),
  isGoogleConfigured: vi.fn().mockReturnValue(true),
}));

// Must import AFTER mocks
const { GET } = await import('./route');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('app/api/auth/google/route', () => {
  it('returns 503 when Google is not configured', async () => {
    mockGetGoogleClient.mockReturnValue(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toMatch(/not configured/i);
  });

  it('redirects to Google authorization URL when configured', async () => {
    const mockCreateAuthURL = vi.fn().mockReturnValue(
      new URL('https://accounts.google.com/o/oauth2/v2/auth?client_id=test'),
    );
    mockGetGoogleClient.mockReturnValue({
      createAuthorizationURL: mockCreateAuthURL,
    });

    const response = await GET();

    expect(response.status).toBe(307); // NextResponse.redirect status
    expect(mockCreateAuthURL).toHaveBeenCalled();
    // Verify state and codeVerifier were passed
    const [state, codeVerifier, scopes] = mockCreateAuthURL.mock.calls[0];
    expect(typeof state).toBe('string');
    expect(typeof codeVerifier).toBe('string');
    expect(scopes).toEqual(['openid', 'profile', 'email']);
  });

  it('sets the google_oauth_state cookie', async () => {
    const mockCreateAuthURL = vi.fn().mockReturnValue(
      new URL('https://accounts.google.com/o/oauth2/v2/auth'),
    );
    mockGetGoogleClient.mockReturnValue({
      createAuthorizationURL: mockCreateAuthURL,
    });

    await GET();

    expect(mockSet).toHaveBeenCalledWith(
      'google_oauth_state',
      expect.any(String),
      expect.objectContaining({
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 600,
      }),
    );
  });

  it('sets the google_code_verifier cookie', async () => {
    const mockCreateAuthURL = vi.fn().mockReturnValue(
      new URL('https://accounts.google.com/o/oauth2/v2/auth'),
    );
    mockGetGoogleClient.mockReturnValue({
      createAuthorizationURL: mockCreateAuthURL,
    });

    await GET();

    expect(mockSet).toHaveBeenCalledWith(
      'google_code_verifier',
      expect.any(String),
      expect.objectContaining({
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 600,
      }),
    );
  });
});
