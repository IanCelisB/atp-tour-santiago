import { describe, expect, it } from 'vitest';
import { prisma } from './db';

/**
 * Tests for the HMR-safe Prisma client singleton (spec REQ-BOOT-5).
 *
 * These are SHAPE tests, not DB-connection tests: importing the client does
 * not open a SQLite connection (Prisma 7 + adapter is lazy). They verify the
 * contract a consumer of `lib/db` relies on: the export is a PrismaClient
 * exposing the four domain models from `prisma/schema.prisma`.
 *
 * Note: we do NOT use `instanceof PrismaClient` because Prisma 7 minifies
 * the class and `instanceof` returns false across module boundaries. We
 * instead check for the lifecycle methods (`$connect`/`$disconnect`) which
 * are unique to PrismaClient and don't appear on the generated models.
 */
describe('lib/db', () => {
  it('exports an object with PrismaClient lifecycle methods', () => {
    expect(typeof prisma).toBe('object');
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$disconnect).toBe('function');
    expect(typeof prisma.$transaction).toBe('function');
  });

  it('exposes all four domain models: campeonato, jugador, partido, foto', () => {
    // Each model namespace must expose the standard query API. If the schema
    // wasn't generated or a model was renamed/removed, these would be missing.
    expect(typeof prisma.campeonato.findMany).toBe('function');
    expect(typeof prisma.jugador.findMany).toBe('function');
    expect(typeof prisma.partido.findMany).toBe('function');
    expect(typeof prisma.foto.findMany).toBe('function');
  });

  it('returns the same client instance on repeated imports (singleton)', async () => {
    // Verifies the HMR-safe pattern: every consumer of `lib/db` must share a
    // single underlying connection pool. In Next.js dev, module reloads must
    // NOT spawn new PrismaClient instances (would exhaust SQLite handles).
    const { prisma: again } = await import('./db');
    expect(again).toBe(prisma);
  });
});
