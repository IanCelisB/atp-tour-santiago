import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

/**
 * HMR-safe Prisma client singleton (spec REQ-BOOT-5).
 *
 * Why a singleton: Next.js dev server hot-reloads modules on every change.
 * If we instantiated a new `PrismaClient` per reload, we'd quickly exhaust
 * SQLite handles and the connection pool. We stash the instance on
 * `globalThis` so HMR reuses the same object across reloads. In production
 * (no HMR) `globalThis.__prisma` is undefined and we create a fresh client.
 *
 * Why the better-sqlite3 adapter: Prisma 7 dropped its built-in SQLite
 * driver. Local file URLs (`file:./prisma/dev.db`) now require a driver
 * adapter — we use `@prisma/adapter-better-sqlite3` which is the official
 * binding to the `better-sqlite3` native module.
 *
 * DATABASE_URL is the only required env var (see `.env.example`). If it's
 * missing we fall back to the same default Prisma migrate uses, so a fresh
 * checkout works out of the box.
 */

const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';

const globalForPrisma = globalThis as unknown as {
  __atptoursantiago_prisma?: PrismaClient;
};

export const prisma: PrismaClient =
  globalForPrisma.__atptoursantiago_prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__atptoursantiago_prisma = prisma;
}
