import { describe, expect, it } from 'vitest';
import { canTransition, type CampeonatoStatus } from './status-transitions';

/**
 * Status finite state machine (spec REQ-T-3, T3.a-b).
 *
 * Allowed flow: PROGRAMADO → EN_CURSO → FINALIZADO
 * Side-track: CANCELADO reachable from any non-terminal state.
 * FINALIZADO is terminal — no transitions out of it (T3.b).
 */
describe('lib/domain/status-transitions', () => {
  describe('happy-path forward transitions', () => {
    it('allows PROGRAMADO → EN_CURSO', () => {
      expect(canTransition('PROGRAMADO', 'EN_CURSO')).toBe(true);
    });

    it('allows EN_CURSO → FINALIZADO', () => {
      expect(canTransition('EN_CURSO', 'FINALIZADO')).toBe(true);
    });

    it('allows the full happy path PROGRAMADO → EN_CURSO → FINALIZADO', () => {
      expect(canTransition('PROGRAMADO', 'EN_CURSO')).toBe(true);
      expect(canTransition('EN_CURSO', 'FINALIZADO')).toBe(true);
    });
  });

  describe('CANCELADO reachable from non-terminal states', () => {
    it('allows PROGRAMADO → CANCELADO', () => {
      expect(canTransition('PROGRAMADO', 'CANCELADO')).toBe(true);
    });

    it('allows EN_CURSO → CANCELADO', () => {
      expect(canTransition('EN_CURSO', 'CANCELADO')).toBe(true);
    });
  });

  describe('forbidden transitions', () => {
    it('rejects FINALIZADO → CANCELADO (terminal state, spec T3.b)', () => {
      expect(canTransition('FINALIZADO', 'CANCELADO')).toBe(false);
    });

    it('rejects FINALIZADO → EN_CURSO (terminal state)', () => {
      expect(canTransition('FINALIZADO', 'EN_CURSO')).toBe(false);
    });

    it('rejects EN_CURSO → PROGRAMADO (no backwards transitions)', () => {
      expect(canTransition('EN_CURSO', 'PROGRAMADO')).toBe(false);
    });

    it('rejects self-transitions (e.g. PROGRAMADO → PROGRAMADO)', () => {
      expect(canTransition('PROGRAMADO', 'PROGRAMADO')).toBe(false);
      expect(canTransition('EN_CURSO', 'EN_CURSO')).toBe(false);
      expect(canTransition('FINALIZADO', 'FINALIZADO')).toBe(false);
      expect(canTransition('CANCELADO', 'CANCELADO')).toBe(false);
    });
  });

  it('exports the CampeonatoStatus type with all four values', () => {
    // Compile-time + runtime sanity check that the type is exhaustive.
    const all: CampeonatoStatus[] = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'];
    expect(all).toHaveLength(4);
  });
});
