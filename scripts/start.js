#!/usr/bin/env node
/**
 * Production startup script for Render.
 *
 * Steps:
 *   1. Ensure DATABASE_URL directory exists
 *   2. Run pending Prisma migrations
 *   3. Seed admin users from whitelist
 *   4. Start Next.js production server
 */

const { execSync } = require('node:child_process');
const { mkdirSync } = require('node:fs');
const { dirname, resolve } = require('node:path');

// Ensure we run from repo root regardless of where the script is invoked
process.chdir(resolve(__dirname, '..'));

const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';

function runStep(name, fn) {
  console.log(`[start] ${name}...`);
  try {
    fn();
    console.log(`[start] ✓ ${name}`);
  } catch (err) {
    console.error(`[start] ✗ ${name} failed:`, err.message);
    process.exit(1);
  }
}

// 1. Ensure DB directory exists
if (databaseUrl.startsWith('file:')) {
  const dbPath = databaseUrl.replace(/^file:/, '');
  const dbDir = dirname(dbPath);
  runStep(`create DB dir ${dbDir}`, () => mkdirSync(dbDir, { recursive: true }));
}

// 2. Run Prisma migrations
runStep('run migrations', () => {
  execSync('pnpm prisma migrate deploy', { stdio: 'inherit' });
});

// 3. Seed admins (idempotent — only creates users that don't exist)
runStep('seed admins', () => {
  execSync('pnpm tsx prisma/seed.ts', { stdio: 'inherit' });
});

// 4. Start Next.js
console.log('[start] starting Next.js...');
execSync('npx next start', { stdio: 'inherit' });
