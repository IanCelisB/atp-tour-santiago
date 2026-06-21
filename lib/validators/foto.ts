import { z } from 'zod';

/**
 * Foto validator (spec REQ-F-1, F2, F3, F6; OQ-7).
 *
 * Enforces the contract for `prisma/schema.prisma#model.Foto`:
 *   - url: non-empty string, MUST start with `/uploads/` (F6.a-b; CDN deferred)
 *   - context: JUGADOR | PARTIDO
 *   - jugadorId: optional FK
 *   - partidoId: optional FK
 *   - XOR invariant (F1.c, F3): exactly one of jugadorId / partidoId MUST
 *     be set. SQLite cannot enforce this in the schema.
 *   - Context-FK consistency (F2): `context` MUST match the FK that is set.
 *
 * Implementation: a Zod discriminated union on `context`. Each branch
 * requires its own FK to be present and the other to be absent. This
 * encodes BOTH the XOR constraint AND the context-FK consistency in
 * one declarative shape — no `.superRefine` needed.
 */

export const FOTO_CONTEXTS = ['JUGADOR', 'PARTIDO'] as const;
export const fotoContextSchema = z.enum(FOTO_CONTEXTS);

const nonEmptyId = z.string().min(1, 'Required ID cannot be empty').max(50);

const jugadorFoto = z.object({
  url: z
    .string()
    .min(1, 'url is required and cannot be empty')
    .regex(/^\/uploads\//, 'url must start with /uploads/ (external URLs deferred per OQ-7)'),
  context: z.literal('JUGADOR'),
  jugadorId: nonEmptyId,
  partidoId: z.null().optional(),
  caption: z.string().max(500).optional(),
});

const partidoFoto = z.object({
  url: z
    .string()
    .min(1, 'url is required and cannot be empty')
    .regex(/^\/uploads\//, 'url must start with /uploads/ (external URLs deferred per OQ-7)'),
  context: z.literal('PARTIDO'),
  jugadorId: z.null().optional(),
  partidoId: nonEmptyId,
  caption: z.string().max(500).optional(),
});

export const createFotoSchema = z
  .discriminatedUnion('context', [jugadorFoto, partidoFoto])
  .refine(
    (data) => {
      // Belt-and-braces XOR check: when context=JUGADOR, partidoId must be
      // null/undefined; when context=PARTIDO, jugadorId must be null/undefined.
      if (data.context === 'JUGADOR') {
        return data.jugadorId != null && data.partidoId == null;
      }
      return data.partidoId != null && data.jugadorId == null;
    },
    {
      message:
        'Exactly one of jugadorId or partidoId must be set, and it must match the context',
    },
  );

export type CreateFotoInput = z.input<typeof createFotoSchema>;
export type CreateFotoData = z.output<typeof createFotoSchema>;
