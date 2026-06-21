import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 splits the connection URL out of `schema.prisma` into this config
 * file. Keeping the URL here (not in the schema) lets us swap providers later
 * (e.g. SQLite → Postgres) without editing the schema.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  },
});
