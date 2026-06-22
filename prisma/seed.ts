import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import { ADMIN_EMAILS } from '../lib/auth/admin-emails';

/**
 * Seed script — creates initial admin users from the whitelist.
 *
 * Run with: pnpm db:seed
 *
 * Default password is `ChangeMe2026!` — change it after first login
 * (or delete this seed before production).
 */

const DEFAULT_PASSWORD = 'ChangeMe2026!';
const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
const adapter = new PrismaLibSql({ url: databaseUrl });
const db = new PrismaClient({ adapter });

async function main() {
  for (const email of ADMIN_EMAILS) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      // Ensure role is admin (in case it was downgraded)
      if (existing.role !== 'admin') {
        await db.user.update({
          where: { id: existing.id },
          data: { role: 'admin' },
        });
        console.log(`Promoted to admin: ${email}`);
      } else {
        console.log(`Admin user already exists: ${email}`);
      }
      continue;
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const admin = await db.user.create({
      data: { email, passwordHash, role: 'admin' },
    });
    console.log(`Created admin user: ${admin.email} (password: ${DEFAULT_PASSWORD})`);
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
