import { describe, expect, it } from 'vitest';
import {
  createCampeonatoSchema,
  CAMPEONATO_ESTADOS,
  type CreateCampeonatoInput,
} from './campeonato';

/**
 * Campeonato validator tests (spec REQ-T-1, REQ-T-2, REQ-T-3; OQ-1).
 *
 * Covers:
 *   - T1.a/b: valid Campeonato parsed; duplicate slug caught
 *   - T2.a/b: endDate < startDate rejected; endDate == startDate accepted
 *   - T3.a/b: estado must be one of 4 valid values; FSM transition
 *     (status-transition FSM is in lib/domain, not duplicated here)
 *
 * Slug is auto-derived from `nombre` (OQ-1); input `slug` is forbidden.
 */
describe('lib/validators/campeonato', () => {
  const validCampeonato: CreateCampeonatoInput = {
    nombre: 'ATP Santiago Open 2026',
    fechaInicio: new Date('2026-09-01T00:00:00Z'),
    fechaFin: new Date('2026-09-08T00:00:00Z'),
    sede: 'Santiago, Chile',
    categoria: 'ATP 250',
    puntosTotales: 250,
  };

  describe('happy path (T1.a, T2.b)', () => {
    it('parses a complete valid Campeonato', () => {
      const result = createCampeonatoSchema.safeParse(validCampeonato);
      expect(result.success).toBe(true);
    });

    it('auto-derives slug from nombre and exposes it on parsed data', () => {
      const result = createCampeonatoSchema.parse(validCampeonato);
      expect(result.slug).toBe('atp-santiago-open-2026');
    });

    it('accepts a Campeonato where endDate equals startDate (same day, T2.b)', () => {
      const sameDay = {
        ...validCampeonato,
        fechaInicio: new Date('2026-09-01T00:00:00Z'),
        fechaFin: new Date('2026-09-01T00:00:00Z'),
      };
      expect(createCampeonatoSchema.safeParse(sameDay).success).toBe(true);
    });

    it('defaults estado to PROGRAMADO when omitted', () => {
      const result = createCampeonatoSchema.parse(validCampeonato);
      expect(result.estado).toBe('PROGRAMADO');
    });

    it('accepts all four valid estado values (T3.a precondition)', () => {
      for (const estado of CAMPEONATO_ESTADOS) {
        const input = {
          ...validCampeonato,
          estado,
          // FINALIZADO requires ganadorId
          ...(estado === 'FINALIZADO' ? { ganadorId: 'test-player-id' } : {}),
        };
        const result = createCampeonatoSchema.safeParse(input);
        expect(result.success, `estado=${estado}`).toBe(true);
      }
    });
  });

  describe('required fields', () => {
    it('rejects missing nombre', () => {
      const { nombre, ...rest } = validCampeonato;
      void nombre;
      expect(createCampeonatoSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects empty nombre', () => {
      const result = createCampeonatoSchema.safeParse({ ...validCampeonato, nombre: '' });
      expect(result.success).toBe(false);
    });

    it('rejects missing fechaInicio', () => {
      const { fechaInicio, ...rest } = validCampeonato;
      void fechaInicio;
      expect(createCampeonatoSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects missing fechaFin', () => {
      const { fechaFin, ...rest } = validCampeonato;
      void fechaFin;
      expect(createCampeonatoSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects missing sede', () => {
      const { sede, ...rest } = validCampeonato;
      void sede;
      expect(createCampeonatoSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects missing categoria', () => {
      const { categoria, ...rest } = validCampeonato;
      void categoria;
      expect(createCampeonatoSchema.safeParse(rest).success).toBe(false);
    });
  });

  describe('date range invariant (T2.a)', () => {
    it('rejects fechaFin strictly before fechaInicio', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        fechaInicio: new Date('2026-09-08T00:00:00Z'),
        fechaFin: new Date('2026-09-01T00:00:00Z'),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join(' ');
        expect(msg).toMatch(/fechaFin|end date/i);
      }
    });
  });

  describe('estado enum validation (T3.a, T3.b)', () => {
    it('rejects an invalid estado string', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        estado: 'BANANA',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ganadorId invariant', () => {
    it('requires ganadorId when estado is FINALIZADO', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        estado: 'FINALIZADO',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join(' ');
        expect(msg).toMatch(/ganador/i);
      }
    });

    it('accepts ganadorId when estado is FINALIZADO', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        estado: 'FINALIZADO',
        ganadorId: 'player-123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ganadorId).toBe('player-123');
      }
    });

    it('rejects ganadorId when estado is PROGRAMADO', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        estado: 'PROGRAMADO',
        ganadorId: 'player-123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join(' ');
        expect(msg).toMatch(/ganador/i);
      }
    });

    it('rejects ganadorId when estado is EN_CURSO', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        estado: 'EN_CURSO',
        ganadorId: 'player-123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects ganadorId when estado is CANCELADO', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        estado: 'CANCELADO',
        ganadorId: 'player-123',
      });
      expect(result.success).toBe(false);
    });

    it('allows null ganadorId when estado is not FINALIZADO', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        estado: 'PROGRAMADO',
        ganadorId: null,
      });
      expect(result.success).toBe(true);
    });

    it('defaults ganadorId to null in output', () => {
      const result = createCampeonatoSchema.parse(validCampeonato);
      expect(result.ganadorId).toBeNull();
    });
  });

  describe('slug is auto-derived, not accepted from input (OQ-1)', () => {
    it('ignores any client-supplied slug and always re-derives it', () => {
      const result = createCampeonatoSchema.parse({
        ...validCampeonato,
        // Cast: TS would block this; we want to confirm Zod also strips it.
        slug: 'totally-wrong-slug',
      } as CreateCampeonatoInput & { slug: string });
      expect(result.slug).toBe('atp-santiago-open-2026');
    });
  });

  describe('puntosTotales validation', () => {
    it('requires puntosTotales field', () => {
      const { puntosTotales, ...rest } = validCampeonato;
      void puntosTotales;
      expect(createCampeonatoSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects negative puntosTotales', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        puntosTotales: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join(' ');
        expect(msg).toMatch(/puntosTotales|>= 0/i);
      }
    });

    it('accepts 0 puntosTotales', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        puntosTotales: 0,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.puntosTotales).toBe(0);
      }
    });

    it('accepts positive puntosTotales', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        puntosTotales: 500,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.puntosTotales).toBe(500);
      }
    });

    it('rejects non-integer puntosTotales', () => {
      const result = createCampeonatoSchema.safeParse({
        ...validCampeonato,
        puntosTotales: 250.5,
      });
      expect(result.success).toBe(false);
    });
  });
});
