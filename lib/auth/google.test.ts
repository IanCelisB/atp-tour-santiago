import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

/**
 * Google OAuth helper tests.
 *
 * Tests verify:
 * - getGoogleClient returns null when env vars are missing
 * - getGoogleClient returns a Google client when both are set
 * - isGoogleConfigured returns false/true based on env vars
 * - Singleton behavior (same instance reused)
 * - getGoogleBaseUrl resolves correct URL from env priority
 */

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.NEXT_PUBLIC_BASE_URL;
  delete process.env.RENDER_EXTERNAL_URL;
  delete process.env.NEXTAUTH_URL;
});

afterEach(() => {
  process.env = originalEnv;
});

describe('lib/auth/google', () => {
  describe('getGoogleBaseUrl', () => {
    it('prefers RENDER_EXTERNAL_URL over all others', async () => {
      process.env.RENDER_EXTERNAL_URL = 'https://atp.onrender.com';
      process.env.NEXTAUTH_URL = 'https://nextauth.example.com';
      process.env.NEXT_PUBLIC_BASE_URL = 'https://public.example.com';
      const { getGoogleBaseUrl } = await import('./google');
      expect(getGoogleBaseUrl()).toBe('https://atp.onrender.com');
    });

    it('falls back to NEXTAUTH_URL when RENDER_EXTERNAL_URL is absent', async () => {
      process.env.NEXTAUTH_URL = 'https://nextauth.example.com';
      process.env.NEXT_PUBLIC_BASE_URL = 'https://public.example.com';
      const { getGoogleBaseUrl } = await import('./google');
      expect(getGoogleBaseUrl()).toBe('https://nextauth.example.com');
    });

    it('falls back to NEXT_PUBLIC_BASE_URL when higher vars are absent', async () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://public.example.com';
      const { getGoogleBaseUrl } = await import('./google');
      expect(getGoogleBaseUrl()).toBe('https://public.example.com');
    });

    it('returns localhost when no env vars are set', async () => {
      const { getGoogleBaseUrl } = await import('./google');
      expect(getGoogleBaseUrl()).toBe('http://localhost:3000');
    });
  });

  describe('getGoogleClient', () => {
    it('returns null when GOOGLE_CLIENT_ID is missing', async () => {
      process.env.GOOGLE_CLIENT_SECRET = 'secret';
      const { getGoogleClient } = await import('./google');
      expect(getGoogleClient()).toBeNull();
    });

    it('returns null when GOOGLE_CLIENT_SECRET is missing', async () => {
      process.env.GOOGLE_CLIENT_ID = 'client-id';
      const { getGoogleClient } = await import('./google');
      expect(getGoogleClient()).toBeNull();
    });

    it('returns null when both env vars are missing', async () => {
      const { getGoogleClient } = await import('./google');
      expect(getGoogleClient()).toBeNull();
    });

    it('returns a Google client when both env vars are set', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
      const { getGoogleClient } = await import('./google');
      const client = getGoogleClient();
      expect(client).not.toBeNull();
      expect(client?.constructor.name).toBe('Google');
    });

    it('returns the same instance on repeated calls (singleton)', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
      const { getGoogleClient } = await import('./google');
      const first = getGoogleClient();
      const second = getGoogleClient();
      expect(first).toBe(second);
    });
  });

  describe('isGoogleConfigured', () => {
    it('returns false when GOOGLE_CLIENT_ID is missing', async () => {
      process.env.GOOGLE_CLIENT_SECRET = 'secret';
      const { isGoogleConfigured } = await import('./google');
      expect(isGoogleConfigured()).toBe(false);
    });

    it('returns false when GOOGLE_CLIENT_SECRET is missing', async () => {
      process.env.GOOGLE_CLIENT_ID = 'client-id';
      const { isGoogleConfigured } = await import('./google');
      expect(isGoogleConfigured()).toBe(false);
    });

    it('returns false when both env vars are missing', async () => {
      const { isGoogleConfigured } = await import('./google');
      expect(isGoogleConfigured()).toBe(false);
    });

    it('returns true when both env vars are set', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
      const { isGoogleConfigured } = await import('./google');
      expect(isGoogleConfigured()).toBe(true);
    });

    it('returns false when env vars are empty strings', async () => {
      process.env.GOOGLE_CLIENT_ID = '';
      process.env.GOOGLE_CLIENT_SECRET = '';
      const { isGoogleConfigured } = await import('./google');
      expect(isGoogleConfigured()).toBe(false);
    });
  });
});
