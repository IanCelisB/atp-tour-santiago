import { describe, expect, it } from 'vitest';
import { ADMIN_EMAILS, isAdminEmail, resolveRole } from './admin-emails';

describe('lib/auth/admin-emails', () => {
  describe('isAdminEmail', () => {
    it('returns true for whitelisted email', () => {
      expect(isAdminEmail('jonex.3@gmail.com')).toBe(true);
    });

    it('returns true for whitelisted email (case-insensitive)', () => {
      expect(isAdminEmail('JoNex.3@Gmail.Com')).toBe(true);
    });

    it('returns true with whitespace trimmed', () => {
      expect(isAdminEmail('  jonex.3@gmail.com  ')).toBe(true);
    });

    it('returns false for non-whitelisted email', () => {
      expect(isAdminEmail('random@example.com')).toBe(false);
    });
  });

  describe('resolveRole', () => {
    it('returns admin for whitelisted email', () => {
      expect(resolveRole('jonex.3@gmail.com')).toBe('admin');
    });

    it('returns view for non-whitelisted email', () => {
      expect(resolveRole('random@example.com')).toBe('view');
    });
  });

  describe('ADMIN_EMAILS', () => {
    it('is readonly (const assertion enforced at type level)', () => {
      // At runtime, readonly arrays are still mutable — this test verifies
      // the array contains the expected emails and is exported as expected.
      expect(ADMIN_EMAILS).toContain('jonex.3@gmail.com');
      expect(ADMIN_EMAILS).toContain('iannncelis@gmail.com');
      expect(ADMIN_EMAILS.length).toBe(2);
    });
  });
});
