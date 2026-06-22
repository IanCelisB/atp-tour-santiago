import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { afterAll, beforeEach } from 'vitest';

/**
 * Test-only Prisma client wired to `prisma/test.db` (gitignored).
 *
 * Why a separate DB: production code uses `lib/db.ts` (HMR singleton on
 * `globalThis.__atptoursantiago_prisma`). Reusing that singleton from tests
 * would race with `pnpm dev` and pollute the dev database. Each Vitest worker
 * gets its own client here; `beforeEach` wipes the `Campeonato` rows.
 *
 * Setup contract: before running `pnpm test` for the first time, push the
 * schema into `prisma/test.db` with:
 *
 *   $env:DATABASE_URL = 'file:./prisma/test.db'
 *   pnpm exec prisma db push --accept-data-loss
 *
 * The `pretest` script in package.json does this automatically.
 */

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? 'file:./prisma/test.db';

let client: PrismaClient | null = null;

export function getTestPrisma(): PrismaClient {
  if (client) return client;
  client = new PrismaClient({
    adapter: new PrismaLibSql({ url: TEST_DATABASE_URL }),
    log: ['error'],
  });
  return client;
}

export async function cleanCampeonatoTable(): Promise<void> {
  await getTestPrisma().campeonato.deleteMany();
}

export async function cleanJugadorTable(): Promise<void> {
  await getTestPrisma().jugador.deleteMany();
}

export async function cleanNoticiaTable(): Promise<void> {
  await getTestPrisma().noticia.deleteMany();
}

export async function cleanPartidoTable(): Promise<void> {
  await getTestPrisma().partido.deleteMany();
}

export async function cleanGalleryItemTable(): Promise<void> {
  await getTestPrisma().galleryItem.deleteMany();
}

export const TEST_DB_HOOKS = {
  beforeEach: async (): Promise<void> => {
    await cleanPartidoTable();
    await cleanCampeonatoTable();
    await cleanJugadorTable();
    await cleanNoticiaTable();
    await cleanGalleryItemTable();
  },
  afterAll: async (): Promise<void> => {
    if (client) {
      await client.$disconnect();
      client = null;
    }
  },
};

// Convenience: alias used inside tests
export function setupCampeonatoCleanup(): void {
  beforeEach(TEST_DB_HOOKS.beforeEach);
}
export function teardownCampeonatoClient(): void {
  afterAll(TEST_DB_HOOKS.afterAll);
}

export function setupJugadorCleanup(): void {
  beforeEach(TEST_DB_HOOKS.beforeEach);
}
export function teardownJugadorClient(): void {
  afterAll(TEST_DB_HOOKS.afterAll);
}

export function setupNoticiaCleanup(): void {
  beforeEach(TEST_DB_HOOKS.beforeEach);
}
export function teardownNoticiaClient(): void {
  afterAll(TEST_DB_HOOKS.afterAll);
}

export function setupPartidoCleanup(): void {
  beforeEach(TEST_DB_HOOKS.beforeEach);
}
export function teardownPartidoClient(): void {
  afterAll(TEST_DB_HOOKS.afterAll);
}

export function setupGalleryCleanup(): void {
  beforeEach(TEST_DB_HOOKS.beforeEach);
}
export function teardownGalleryClient(): void {
  afterAll(TEST_DB_HOOKS.afterAll);
}
