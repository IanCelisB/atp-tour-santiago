import { describe, expect, it } from 'vitest';
import { puntosForPosition } from './ranking';

/**
 * puntosForPosition unit tests.
 *
 * ATP-style distribution based on puntosTotales:
 *   - 1st: 100%
 *   - 2nd: 60%
 *   - 3rd/4th: 36% each
 */
describe('lib/domain/ranking', () => {
  describe('puntosForPosition', () => {
    it('returns full puntosTotales for position 1 (champion)', () => {
      expect(puntosForPosition(250, 1)).toBe(250);
    });

    it('returns 60% rounded for position 2 (finalist)', () => {
      expect(puntosForPosition(250, 2)).toBe(150);
    });

    it('returns 36% rounded for position 3 (semifinalist)', () => {
      expect(puntosForPosition(250, 3)).toBe(90);
    });

    it('returns 36% rounded for position 4 (semifinalist)', () => {
      expect(puntosForPosition(250, 4)).toBe(90);
    });

    it('returns 0 for position 1 when puntosTotales is 0', () => {
      expect(puntosForPosition(0, 1)).toBe(0);
    });

    it('returns 0 for position 2 when puntosTotales is 0', () => {
      expect(puntosForPosition(0, 2)).toBe(0);
    });

    it('throws on negative puntosTotales', () => {
      expect(() => puntosForPosition(-1, 1)).toThrow('puntosTotales must be >= 0');
    });

    it('handles ATP 500 points correctly', () => {
      expect(puntosForPosition(500, 1)).toBe(500);
      expect(puntosForPosition(500, 2)).toBe(300);
      expect(puntosForPosition(500, 3)).toBe(180);
      expect(puntosForPosition(500, 4)).toBe(180);
    });

    it('rounds fractional results correctly', () => {
      // 100 * 0.6 = 60 (exact)
      expect(puntosForPosition(100, 2)).toBe(60);
      // 100 * 0.36 = 36 (exact)
      expect(puntosForPosition(100, 3)).toBe(36);
      // 75 * 0.6 = 45 (exact)
      expect(puntosForPosition(75, 2)).toBe(45);
      // 75 * 0.36 = 27 (exact)
      expect(puntosForPosition(75, 3)).toBe(27);
    });
  });
});
