import { describe, expect, it } from 'vitest';
import { createPartidoSchema, PARTIDO_RONDAS, type CreatePartidoInput } from './partido';

/**
 * Partido validator tests (spec REQ-M-1..M-5, M7; OQ-3).
 *
 * Covers:
 *   - M1.a: valid Partido parses
 *   - M2.a/b: jugador1Id !== jugador2Id (self-match forbidden)
 *   - M4.a-e: ganadorId invariant (must equal j1 OR j2 if set, required iff
 *     status=COMPLETED, forbidden otherwise)
 *   - M5: bracketPosition must be a non-negative integer
 *   - M7: marcador is free-form String (no structured validation per OQ-3)
 */
describe('lib/validators/partido', () => {
  const validPartido: CreatePartidoInput = {
    campeonatoId: 'camp-abc',
    jugador1Id: 'jug-1',
    jugador2Id: 'jug-2',
    bracketPosition: 0,
    ronda: 'QF',
  };

  describe('happy path (M1.a)', () => {
    it('parses a minimal valid Partido', () => {
      expect(createPartidoSchema.safeParse(validPartido).success).toBe(true);
    });

    it('accepts all seven valid ronda values', () => {
      for (const ronda of PARTIDO_RONDAS) {
        const result = createPartidoSchema.safeParse({ ...validPartido, ronda });
        expect(result.success, `ronda=${ronda}`).toBe(true);
      }
    });

    it('accepts an optional marcador (free-form String per OQ-3)', () => {
      const result = createPartidoSchema.safeParse({
        ...validPartido,
        marcador: '6-4 6-3 7-5',
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.marcador).toBe('6-4 6-3 7-5');
    });

    it('accepts an optional fecha', () => {
      const fecha = new Date('2026-09-02T15:00:00Z');
      const result = createPartidoSchema.safeParse({ ...validPartido, fecha });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.fecha).toEqual(fecha);
    });
  });

  describe('required FKs (M1.a)', () => {
    it('rejects missing campeonatoId', () => {
      const { campeonatoId, ...rest } = validPartido;
      void campeonatoId;
      expect(createPartidoSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects missing jugador1Id', () => {
      const { jugador1Id, ...rest } = validPartido;
      void jugador1Id;
      expect(createPartidoSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects missing jugador2Id', () => {
      const { jugador2Id, ...rest } = validPartido;
      void jugador2Id;
      expect(createPartidoSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects missing ronda', () => {
      const { ronda, ...rest } = validPartido;
      void ronda;
      expect(createPartidoSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects invalid ronda value', () => {
      const result = createPartidoSchema.safeParse({ ...validPartido, ronda: 'SWEET_16' });
      expect(result.success).toBe(false);
    });
  });

  describe('self-match forbidden (M2.a, M2.b)', () => {
    it('rejects jugador1Id === jugador2Id (M2.a)', () => {
      const result = createPartidoSchema.safeParse({
        ...validPartido,
        jugador1Id: 'jug-same',
        jugador2Id: 'jug-same',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join(' ');
        expect(msg).toMatch(/different|distinct|mismo|self/i);
      }
    });

    it('accepts distinct jugador1Id and jugador2Id (M2.b)', () => {
      const result = createPartidoSchema.safeParse({
        ...validPartido,
        jugador1Id: 'jug-a',
        jugador2Id: 'jug-b',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('ganadorId invariant (M4.a-e)', () => {
    it('accepts ganadorId=null when status=FINALIZADO is NOT set (M4 base)', () => {
      // Default status is PROGRAMADO; ganadorId must be null/absent.
      const result = createPartidoSchema.safeParse({ ...validPartido });
      expect(result.success).toBe(true);
    });

    it('rejects ganadorId set without status=FINALIZADO (M4.e)', () => {
      // ganadorId present but status is still PROGRAMADO → winner set too early.
      const result = createPartidoSchema.safeParse({
        ...validPartido,
        ganadorId: 'jug-1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects ganadorId=j1 when status=FINALIZADO is NOT set (M4.e)', () => {
      const result = createPartidoSchema.safeParse({
        ...validPartido,
        ganadorId: 'jug-1',
        status: 'EN_CURSO',
      });
      expect(result.success).toBe(false);
    });

    it('rejects ganadorId=j1 when status=FINALIZADO and ganadorId is null (M4.a)', () => {
      const result = createPartidoSchema.safeParse({
        ...validPartido,
        status: 'FINALIZADO',
      });
      expect(result.success).toBe(false);
    });

    it('rejects ganadorId=thirdParty (not j1/j2) when status=FINALIZADO (M4.d)', () => {
      const result = createPartidoSchema.safeParse({
        ...validPartido,
        status: 'FINALIZADO',
        ganadorId: 'jug-third',
      });
      expect(result.success).toBe(false);
    });

    it('accepts ganadorId=j1 when status=FINALIZADO (M4.b)', () => {
      const result = createPartidoSchema.safeParse({
        ...validPartido,
        status: 'FINALIZADO',
        ganadorId: 'jug-1',
      });
      expect(result.success).toBe(true);
    });

    it('accepts ganadorId=j2 when status=FINALIZADO (M4.c)', () => {
      const result = createPartidoSchema.safeParse({
        ...validPartido,
        status: 'FINALIZADO',
        ganadorId: 'jug-2',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('bracketPosition invariants', () => {
    it('rejects negative bracketPosition', () => {
      const result = createPartidoSchema.safeParse({ ...validPartido, bracketPosition: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects non-integer bracketPosition', () => {
      const result = createPartidoSchema.safeParse({ ...validPartido, bracketPosition: 1.5 });
      expect(result.success).toBe(false);
    });

    it('rejects missing bracketPosition (NOT NULL in schema)', () => {
      const { bracketPosition, ...rest } = validPartido;
      void bracketPosition;
      expect(createPartidoSchema.safeParse(rest).success).toBe(false);
    });
  });

  describe('marcador is free-form String (OQ-3, M7)', () => {
    it('accepts standard tennis score', () => {
      expect(createPartidoSchema.safeParse({ ...validPartido, marcador: '6-4 6-3' }).success).toBe(
        true,
      );
    });

    it('accepts arbitrary string as marcador (no structured validation this iter)', () => {
      // M7 + OQ-3: free-form; no parsing into sets.
      expect(createPartidoSchema.safeParse({ ...validPartido, marcador: 'RET' }).success).toBe(
        true,
      );
    });

    it('rejects empty marcador', () => {
      expect(createPartidoSchema.safeParse({ ...validPartido, marcador: '' }).success).toBe(false);
    });
  });
});
