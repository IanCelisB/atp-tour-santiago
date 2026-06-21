import { describe, expect, it } from 'vitest';
import { createJugadorSchema, type CreateJugadorInput } from './jugador';

/**
 * Jugador validator tests (spec REQ-P-1, REQ-P-2; OQ-2).
 *
 * OQ-2: `pais` is a free-form String with NO ISO-3166 validation this iter.
 *       All current jugadores are Chilean; we just require a non-empty string.
 *
 * Covers:
 *   - P1.a: valid Jugador parses; slug auto-derived
 *   - P1.c: country validation is NOT strict (lowercase is fine)
 *   - P2.a: ranking=0 rejected
 *   - P2.b: ranking=null allowed
 *   - P2.c: ranking=-5 rejected
 *   - Stats: resistencia, velocidad, derecho, reves, poder (0-100), estatura (100-250)
 */
describe('lib/validators/jugador', () => {
  const validJugador: CreateJugadorInput = {
    nombre: 'Nicolás',
    apellido: 'Jarry',
    pais: 'CL',
  };

  describe('happy path (P1.a)', () => {
    it('parses a minimal Jugador (nombre + apellido + pais)', () => {
      const result = createJugadorSchema.safeParse(validJugador);
      expect(result.success).toBe(true);
    });

    it('auto-derives slug from "nombre apellido"', () => {
      const result = createJugadorSchema.parse(validJugador);
      expect(result.slug).toBe('nicolas-jarry');
    });

    it('accepts an optional bio', () => {
      const result = createJugadorSchema.safeParse({ ...validJugador, bio: 'Chilean pro' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.bio).toBe('Chilean pro');
    });

    it('accepts an optional ranking > 0', () => {
      const result = createJugadorSchema.safeParse({ ...validJugador, ranking: 42 });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.ranking).toBe(42);
    });
  });

  describe('pais is free-form String, NO ISO check (OQ-2)', () => {
    it('accepts uppercase country code', () => {
      expect(createJugadorSchema.safeParse({ ...validJugador, pais: 'CL' }).success).toBe(true);
    });

    it('accepts lowercase country code (OQ-2: no ISO check)', () => {
      // Spec P1.c mentioned uppercase ISO; OQ-2 settled on NO validation.
      const result = createJugadorSchema.safeParse({ ...validJugador, pais: 'arg' });
      expect(result.success).toBe(true);
    });

    it('accepts a free-form country name', () => {
      const result = createJugadorSchema.safeParse({
        ...validJugador,
        pais: 'Tierra del Fuego',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty pais', () => {
      const result = createJugadorSchema.safeParse({ ...validJugador, pais: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('ranking invariants (P2.a, P2.b, P2.c)', () => {
    it('rejects ranking=0 (P2.a)', () => {
      const result = createJugadorSchema.safeParse({ ...validJugador, ranking: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects negative ranking (P2.c)', () => {
      const result = createJugadorSchema.safeParse({ ...validJugador, ranking: -5 });
      expect(result.success).toBe(false);
    });

    it('accepts ranking=null/undefined (P2.b — unranked)', () => {
      expect(createJugadorSchema.safeParse({ ...validJugador, ranking: null }).success).toBe(true);
      expect(createJugadorSchema.safeParse(validJugador).success).toBe(true);
    });
  });

  describe('player stats validation', () => {
    it('defaults all stats when omitted', () => {
      const result = createJugadorSchema.parse(validJugador);
      expect(result.resistencia).toBe(50);
      expect(result.velocidad).toBe(50);
      expect(result.derecho).toBe(50);
      expect(result.reves).toBe(50);
      expect(result.estatura).toBe(170);
      expect(result.poder).toBe(50);
    });

    it('accepts custom stat values within range', () => {
      const result = createJugadorSchema.safeParse({
        ...validJugador,
        resistencia: 80,
        velocidad: 90,
        derecho: 75,
        reves: 65,
        estatura: 195,
        poder: 85,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.resistencia).toBe(80);
        expect(result.data.velocidad).toBe(90);
        expect(result.data.derecho).toBe(75);
        expect(result.data.reves).toBe(65);
        expect(result.data.estatura).toBe(195);
        expect(result.data.poder).toBe(85);
      }
    });

    it('rejects resistencia > 100', () => {
      const result = createJugadorSchema.safeParse({ ...validJugador, resistencia: 101 });
      expect(result.success).toBe(false);
    });

    it('rejects resistencia < 0', () => {
      const result = createJugadorSchema.safeParse({ ...validJugador, resistencia: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects estatura > 250', () => {
      const result = createJugadorSchema.safeParse({ ...validJugador, estatura: 251 });
      expect(result.success).toBe(false);
    });

    it('rejects estatura < 100', () => {
      const result = createJugadorSchema.safeParse({ ...validJugador, estatura: 99 });
      expect(result.success).toBe(false);
    });

    it('rejects non-integer stat values', () => {
      const result = createJugadorSchema.safeParse({ ...validJugador, velocidad: 7.5 });
      expect(result.success).toBe(false);
    });
  });

  describe('required fields', () => {
    it('rejects missing nombre', () => {
      const { nombre, ...rest } = validJugador;
      void nombre;
      expect(createJugadorSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects empty nombre', () => {
      expect(createJugadorSchema.safeParse({ ...validJugador, nombre: '' }).success).toBe(false);
    });

    it('rejects missing apellido', () => {
      const { apellido, ...rest } = validJugador;
      void apellido;
      expect(createJugadorSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects empty apellido', () => {
      expect(createJugadorSchema.safeParse({ ...validJugador, apellido: '' }).success).toBe(false);
    });
  });

  describe('slug is auto-derived from "nombre apellido" (OQ-1)', () => {
    it('re-derives slug on every parse; client input is ignored', () => {
      const result = createJugadorSchema.parse({
        ...validJugador,
        slug: 'WRONG',
      } as CreateJugadorInput & { slug: string });
      expect(result.slug).toBe('nicolas-jarry');
    });

    it('transliterates accented characters in the slug', () => {
      const result = createJugadorSchema.parse({
        nombre: 'Alejandro',
        apellido: 'Tabilo',
        pais: 'CL',
      });
      expect(result.slug).toBe('alejandro-tabilo');
    });
  });
});
