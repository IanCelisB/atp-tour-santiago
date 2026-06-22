import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

/**
 * Seed script — creates an initial admin user.
 *
 * Run with: pnpm db:seed
 */

const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' });
const db = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@atp.local';
  const adminPassword = 'admin123'; // change in production!

  const existing = await db.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await db.user.create({
    data: { email: adminEmail, passwordHash, role: 'admin' },
  });
  console.log('Created admin user:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
