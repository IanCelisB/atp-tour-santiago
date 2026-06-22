import bcrypt from 'bcryptjs';

export async function hashPassword(plain: string): Promise<string> {
  if (plain.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
