import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('lib/auth/password', () => {
  describe('hashPassword', () => {
    it('returns a bcrypt hash string', async () => {
      const hash = await hashPassword('secret123');
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^\$2[aby]?\$/); // bcrypt prefix
    });

    it('produces different hashes for the same input (salt)', async () => {
      const hash1 = await hashPassword('secret123');
      const hash2 = await hashPassword('secret123');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('returns true for a correct password', async () => {
      const hash = await hashPassword('myP4ssword');
      const result = await verifyPassword('myP4ssword', hash);
      expect(result).toBe(true);
    });

    it('returns false for an incorrect password', async () => {
      const hash = await hashPassword('myP4ssword');
      const result = await verifyPassword('wrongPass1', hash);
      expect(result).toBe(false);
    });
  });

  describe('password length validation', () => {
    it('rejects passwords shorter than 6 characters', async () => {
      await expect(hashPassword('abc')).rejects.toThrow(
        /at least 6 characters/i,
      );
    });

    it('rejects empty string password', async () => {
      await expect(hashPassword('')).rejects.toThrow(
        /at least 6 characters/i,
      );
    });

    it('accepts passwords with exactly 6 characters', async () => {
      const hash = await hashPassword('123456');
      expect(typeof hash).toBe('string');
      const valid = await verifyPassword('123456', hash);
      expect(valid).toBe(true);
    });

    it('works with unicode characters', async () => {
      const hash = await hashPassword('aseña123');
      const valid = await verifyPassword('aseña123', hash);
      expect(valid).toBe(true);
    });
  });
});
