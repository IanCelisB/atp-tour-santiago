import { describe, expect, it } from 'vitest';
import { slugify } from './slugify';

/**
 * Slug helper used by Campeonato / Jugador validators (spec REQ-T-1, REQ-P-1,
 * OQ-1). Must handle Spanish characters (ñ, á) and produce URL-safe lowercase
 * ASCII with single hyphens between word boundaries.
 */
describe('lib/slugify', () => {
  it('lowercases ASCII text and replaces spaces with hyphens', () => {
    expect(slugify('ATP Santiago Open')).toBe('atp-santiago-open');
  });

  it('transliterates Spanish accented characters (OQ-1: ñ, á)', () => {
    // n-with-tilde → "n"; a-with-acute → "a"
    expect(slugify('Año Mágico')).toBe('ano-magico');
  });

  it('strips punctuation and collapses multiple hyphens', () => {
    expect(slugify('Hello, World!! 2026')).toBe('hello-world-2026');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --foo bar--  ')).toBe('foo-bar');
  });

  it('returns empty string for empty or whitespace-only input', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });
});
