import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    fileParallelism: false,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/e2e/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Components are presentation-only — they're covered by E2E (Playwright
      // in e2e/) and visual review. Excluding them from v8 coverage prevents
      // the threshold from being dragged down by untested JSX while keeping
      // the gate honest for `lib/` (domain logic, validators, actions).
      include: ['lib/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/coverage/**',
        '**/playwright-report/**',
        '**/test-results/**',
      ],
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },
    },
  },
});
