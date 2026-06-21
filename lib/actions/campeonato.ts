import type { PrismaClient } from '@prisma/client';

/**
 * Campeonato CRUD domain functions (spec REQ-T-1..5, OQ-1, OQ-2).
 *
 * Pure-ish: each function takes the Prisma client as a parameter so the
 * domain is testable without mocking `lib/db.ts`'s HMR singleton. The
 * production caller (`app/campeonatos/actions.ts`) injects the singleton;
 * tests inject a client bound to `prisma/test.db`.
 *
 * Validation contract:
 *   - `createCampeonatoAction` runs `createCampeonatoSchema` against the
 *     input, derives `slug` from `nombre` (OQ-1), defaults `estado` to
 *     `PROGRAMADO` (OQ-2), and writes a new row.
 *   - `updateCampeonatoAction` runs the same schema on the patch and
 *     updates only the fields supplied. Slug is re-derived from `nombre`.
 *   - `deleteCampeonatoAction` removes a row by id.
 *
 * Result shape: `{ success: true, data }` on success, `{ success: false,
 * error }` on validation/persistence failure. Never throws.
 */

export interface CreateCampeonatoInput {
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
  sede: string;
  categoria: string;
  estado?: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
}

export interface UpdateCampeonatoInput extends CreateCampeonatoInput {
  id: string;
}

export type CampeonatoRow = {
  id: string;
  nombre: string;
  slug: string;
  fechaInicio: Date;
  fechaFin: Date | null;
  sede: string;
  categoria: string;
  estado: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
  createdAt: Date;
  updatedAt: Date;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── STUBS — implemented GREEN in the next TDD step ───────────────────────────

export async function createCampeonatoAction(
  _db: PrismaClient,
  _input: CreateCampeonatoInput,
): Promise<ActionResult<CampeonatoRow>> {
  throw new Error('createCampeonatoAction not implemented');
}

export async function updateCampeonatoAction(
  _db: PrismaClient,
  _input: UpdateCampeonatoInput,
): Promise<ActionResult< CampeonatoRow>> {
  throw new Error('updateCampeonatoAction not implemented');
}

export async function deleteCampeonatoAction(
  _db: PrismaClient,
  _id: string,
): Promise<ActionResult<{ id: string }>> {
  throw new Error('deleteCampeonatoAction not implemented');
}
