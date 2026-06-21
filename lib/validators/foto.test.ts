import { describe, expect, it } from 'vitest';
import { createFotoSchema, FOTO_CONTEXTS, type CreateFotoInput } from './foto';

/**
 * Foto validator tests (spec REQ-F-1, F2, F3, F6).
 *
 * XOR invariant: exactly one of `jugadorId` / `partidoId` MUST be set.
 * Context-FK consistency: `context` MUST match whichever FK is set.
 * URL is local-only: must start with `/uploads/` (OQ-7 / D7: no S3 yet).
 */
describe('lib/validators/foto', () => {
  const validJugadorFoto: CreateFotoInput = {
    url: '/uploads/abc123.jpg',
    context: 'JUGADOR',
    jugadorId: 'jug-1',
  };

  const validPartidoFoto: CreateFotoInput = {
    url: '/uploads/match-001.png',
    context: 'PARTIDO',
    partidoId: 'par-1',
  };

  describe('happy path (F1.a-b, F2.c-d, F3.b)', () => {
    it('parses a JUGADOR-context foto (F1.a, F2.c)', () => {
      const result = createFotoSchema.safeParse(validJugadorFoto);
      expect(result.success).toBe(true);
    });

    it('parses a PARTIDO-context foto (F1.b, F2.d)', () => {
      const result = createFotoSchema.safeParse(validPartidoFoto);
      expect(result.success).toBe(true);
    });

    it('accepts an optional caption', () => {
      const result = createFotoSchema.safeParse({
        ...validJugadorFoto,
        caption: 'Jarry trophy lift',
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.caption).toBe('Jarry trophy lift');
    });

    it('accepts all valid context values', () => {
      for (const context of FOTO_CONTEXTS) {
        const base = context === 'JUGADOR' ? validJugadorFoto : validPartidoFoto;
        const result = createFotoSchema.safeParse({ ...base, context });
        expect(result.success, `context=${context}`).toBe(true);
      }
    });
  });

  describe('URL is local-only (F1.d, F6.a-b)', () => {
    it('accepts a /uploads/ path (F6.a)', () => {
      expect(
        createFotoSchema.safeParse({ ...validJugadorFoto, url: '/uploads/abc.jpg' }).success,
      ).toBe(true);
    });

    it('rejects an empty URL (F1.d)', () => {
      expect(createFotoSchema.safeParse({ ...validJugadorFoto, url: '' }).success).toBe(false);
    });

    it('rejects an external https URL (F6.b — CDN deferred per OQ-7)', () => {
      expect(
        createFotoSchema.safeParse({
          ...validJugadorFoto,
          url: 'https://cdn.example.com/abc.jpg',
        }).success,
      ).toBe(false);
    });

    it('rejects a relative path outside /uploads/ (F6.b strict)', () => {
      expect(
        createFotoSchema.safeParse({ ...validJugadorFoto, url: '/images/abc.jpg' }).success,
      ).toBe(false);
    });
  });

  describe('XOR FK constraint (F1.c, F3.a, F3.b)', () => {
    it('rejects when BOTH jugadorId and partidoId are set (F3.a)', () => {
      const result = createFotoSchema.safeParse({
        ...validJugadorFoto,
        partidoId: 'par-1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects when NEITHER jugadorId nor partidoId is set (F1.c, F3.c)', () => {
      const result = createFotoSchema.safeParse({
        url: '/uploads/orphan.jpg',
        context: 'JUGADOR',
      });
      expect(result.success).toBe(false);
    });

    it('accepts exactly one FK set (F3.b)', () => {
      expect(
        createFotoSchema.safeParse({ ...validJugadorFoto, partidoId: undefined }).success,
      ).toBe(true);
      expect(
        createFotoSchema.safeParse({ ...validPartidoFoto, jugadorId: undefined }).success,
      ).toBe(true);
    });
  });

  describe('Context-FK consistency (F2.a-d)', () => {
    it('rejects jugadorId set with context=PARTIDO (F2.a)', () => {
      const result = createFotoSchema.safeParse({
        ...validJugadorFoto,
        context: 'PARTIDO',
      });
      expect(result.success).toBe(false);
    });

    it('rejects partidoId set with context=JUGADOR (F2.b)', () => {
      const result = createFotoSchema.safeParse({
        ...validPartidoFoto,
        context: 'JUGADOR',
      });
      expect(result.success).toBe(false);
    });

    it('accepts jugadorId set with context=JUGADOR (F2.c)', () => {
      expect(createFotoSchema.safeParse(validJugadorFoto).success).toBe(true);
    });

    it('accepts partidoId set with context=PARTIDO (F2.d)', () => {
      expect(createFotoSchema.safeParse(validPartidoFoto).success).toBe(true);
    });
  });

  describe('context enum validation', () => {
    it('rejects an invalid context string', () => {
      const result = createFotoSchema.safeParse({
        ...validJugadorFoto,
        context: 'MATCH',
      });
      expect(result.success).toBe(false);
    });
  });
});
