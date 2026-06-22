import { z } from 'zod';

/**
 * Auth validator — login input schema.
 *
 * Validates email and password for the login form.
 * No sign-up schema: users are created via seed script / DB insert.
 */

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.input<typeof loginSchema>;
export type LoginData = z.output<typeof loginSchema>;
