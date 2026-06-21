/**
 * Campeonato status finite state machine (spec REQ-T-3, T3.a-b).
 *
 * Allowed transitions:
 *   PROGRAMADO → EN_CURSO
 *   EN_CURSO   → FINALIZADO
 *   * (any non-terminal) → CANCELADO
 *
 * FINALIZADO and CANCELADO are terminal — no transitions out.
 *
 * Implemented as a static lookup table so the compiler + a single
 * `Object.hasOwn` check enforce exhaustiveness. No allocation per call.
 */
export type CampeonatoStatus = 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';

export const CAMPEONATO_STATUSES = [
  'PROGRAMADO',
  'EN_CURSO',
  'FINALIZADO',
  'CANCELADO',
] as const satisfies readonly CampeonatoStatus[];

const CAN_MUTATE_TO: Record<CampeonatoStatus, readonly CampeonatoStatus[]> = {
  PROGRAMADO: ['EN_CURSO', 'CANCELADO'],
  EN_CURSO: ['FINALIZADO', 'CANCELADO'],
  FINALIZADO: [],
  CANCELADO: [],
};

/**
 * Returns `true` if a Campeonato with status `from` may transition to `to`.
 *
 * Self-transitions are NOT allowed — a Campeonato must change state
 * (or be cancelled) to update its status. This matches the spec
 * invariant: `updatedAt` advances on every transition.
 */
export function canTransition(from: CampeonatoStatus, to: CampeonatoStatus): boolean {
  return CAN_MUTATE_TO[from].includes(to);
}
