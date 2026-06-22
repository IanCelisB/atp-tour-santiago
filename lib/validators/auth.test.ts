import { describe, expect, it } from 'vitest';
import { loginSchema } from './auth';

describe('lib/validators/auth', () => {
  describe('loginSchema', () => {
    const validLogin = {
      email: 'admin@atp.local',
      password: 'admin123',
    };

    describe('happy path', () => {
      it('parses valid login input', () => {
        const result = loginSchema.safeParse(validLogin);
        expect(result.success).toBe(true);
      });

      it('returns email and password on success', () => {
        const result = loginSchema.parse(validLogin);
        expect(result.email).toBe('admin@atp.local');
        expect(result.password).toBe('admin123');
      });
    });

    describe('email validation', () => {
      it('rejects missing email', () => {
        const { email, ...rest } = validLogin;
        void email;
        expect(loginSchema.safeParse(rest).success).toBe(false);
      });

      it('rejects empty email', () => {
        const result = loginSchema.safeParse({ ...validLogin, email: '' });
        expect(result.success).toBe(false);
      });

      it('rejects invalid email format', () => {
        const result = loginSchema.safeParse({
          ...validLogin,
          email: 'not-an-email',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const msg = result.error.issues.map((i) => i.message).join(' ');
          expect(msg).toMatch(/email/i);
        }
      });
    });

    describe('password validation', () => {
      it('rejects missing password', () => {
        const { password, ...rest } = validLogin;
        void password;
        expect(loginSchema.safeParse(rest).success).toBe(false);
      });

      it('rejects password shorter than 6 characters', () => {
        const result = loginSchema.safeParse({
          ...validLogin,
          password: '12345',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const msg = result.error.issues.map((i) => i.message).join(' ');
          expect(msg).toMatch(/6 characters/i);
        }
      });

      it('accepts password with exactly 6 characters', () => {
        const result = loginSchema.safeParse({
          ...validLogin,
          password: '123456',
        });
        expect(result.success).toBe(true);
      });
    });
  });
});
