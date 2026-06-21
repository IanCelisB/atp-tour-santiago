import { z } from 'zod';

/**
 * Partido validator (spec REQ-M-1, M2, M4, M5, M7; OQ-3).
 *
 * Enforces the contract for `prisma/schema.prisma#model.Partido`:
 *   - All three FKs (campeonatoId, jugador1Id, jugador2Id) are required
 *     non-empty strings. FK existence is a Prisma concern (P2003); this
 *     schema only checks the IDs are well-formed.
 *   - jugador1Id !== jugador2Id (M2.a — no self-match).
 *   - bracketPosition: required non-negative integer (NOT NULL in schema).
 *   - ronda: one of R128 | R64 | R32 | R16 | QF | SF | F.
 *   - marcador: optional free-form String per OQ-3 (no structured sets).
 *   - ganadorId invariant (M4.a-e):
 *       * status=COMPLETED → ganadorId required AND must be jugador1Id/jugador2Id
 *       * status≠COMPLETED → ganadorId must be null/undefined
 *   - status: optional, default SCHEDULED.
 */

export const PARTIDO_RONDAS = ['R128', 'R64', 'R32', 'R16', 'QF', 'SF', 'F'] as const;
export const PARTIDO_STATUSES = [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'WALKOVER',
  'CANCELLED',
] as const;

export const partidoRondaSchema = z.enum(PARTIDO_RONDAS);
export const partidoStatusSchema = z.enum(PARTIDO_STATUSES);

const nonEmptyId = z.string().min(1, 'Required ID cannot be empty').max(50);

const baseFields = {
  campeonatoId: nonEmptyId,
  jugador1Id: nonEmptyId,
  jugador2Id: nonEmptyId,
  ganadorId: z.string().min(1).max(50).nullable().optional(),
  marcador: z
    .string()
    .min(1, 'Marcador cannot be empty if provided')
    .max(200)
    .nullable()
    .optional(),
  bracketPosition: z
    .number()
    .int('bracketPosition must be an integer')
    .min(0, 'bracketPosition must be >= 0'),
  ronda: partidoRondaSchema,
  fecha: z.date().nullable().optional(),
  status: partidoStatusSchema.optional(),
};

export const createPartidoSchema = z
  .object(baseFields)
  // M2.a: forbid the same player on both sides of the net.
  .refine((data) => data.jugador1Id !== data.jugador2Id, {
    message: 'jugador1Id and jugador2Id must be different players',
    path: ['jugador2Id'],
  })
  // M4.a-e: ganadorId invariant.
  .superRefine((data, ctx) => {
    const winnerSet = data.ganadorId != null;
    const completed = data.status === 'COMPLETED';

    if (completed && !winnerSet) {
      // M4.a: a completed match must have a winner.
      ctx.addIssue({
        code: 'custom',
        message: 'ganadorId is required when status is COMPLETED',
        path: ['ganadorId'],
      });
      return;
    }

    if (!completed && winnerSet) {
      // M4.e: a winner cannot be set before the match completes.
      ctx.addIssue({
        code: 'custom',
        message: 'ganadorId may only be set when status is COMPLETED',
        path: ['ganadorId'],
      });
      return;
    }

    if (completed && winnerSet) {
      // M4.d: the winner must be one of the two players.
      if (data.ganadorId !== data.jugador1Id && data.ganadorId !== data.jugador2Id) {
        ctx.addIssue({
          code: 'custom',
          message: 'ganadorId must equal jugador1Id or jugador2Id',
          path: ['ganadorId'],
        });
      }
    }
  })
  .transform((data) => ({
    ...data,
    status: data.status ?? 'SCHEDULED',
  }));

export type CreatePartidoInput = z.input<typeof createPartidoSchema>;
export type CreatePartidoData = z.output<typeof createPartidoSchema>;
