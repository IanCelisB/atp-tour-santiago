import type { PrismaClient } from '@prisma/client';
import { createCampeonatoSchema } from '@/lib/validators/campeonato';

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

export type CampeonatoRow = {
  id: string;
  nombre: string;
  slug: string;
  fechaInicio: Date;
  fechaFin: Date | null;
  sede: string;
  categoria: string;
  estado: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
  puntosTotales: number;
  ganadorId: string | null;
  ganador?: { nombre: string; apellido: string } | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createCampeonatoAction(
  db: PrismaClient,
  input: Record<string, unknown>,
): Promise<ActionResult<CampeonatoRow>> {
  const parsed = createCampeonatoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Validation failed',
    };
  }

  // Strip `descripcion` — validator allows it but Prisma schema doesn't have the column
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug, estado, descripcion, ganadorId, ...data } = parsed.data;

  try {
    const row = await db.campeonato.create({
      data: { ...data, slug, estado, ganadorId: ganadorId ?? null },
    });
    return { success: true, data: row as CampeonatoRow };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Database error',
    };
  }
}

export async function updateCampeonatoAction(
  db: PrismaClient,
  input: Record<string, unknown>,
): Promise<ActionResult<CampeonatoRow>> {
  const { id, ...rest } = input;
  if (typeof id !== 'string' || !id) {
    return { success: false, error: 'id is required' };
  }

  const parsed = createCampeonatoSchema.safeParse(rest);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Validation failed',
    };
  }

  // Strip `descripcion` — validator allows it but Prisma schema doesn't have the column
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug, estado, descripcion, ganadorId, ...data } = parsed.data;

  try {
    const row = await db.campeonato.update({
      where: { id },
      data: { ...data, slug, estado, ganadorId: ganadorId ?? null },
    });
    return { success: true, data: row as CampeonatoRow };
  } catch (e) {
    // Prisma P2025 = RecordNotFound
    if (
      e instanceof Error &&
      'code' in e &&
      (e as { code: string }).code === 'P2025'
    ) {
      return { success: false, error: 'Record not found' };
    }
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Database error',
    };
  }
}

export async function deleteCampeonatoAction(
  db: PrismaClient,
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    await db.campeonato.delete({ where: { id } });
    return { success: true, data: { id } };
  } catch (e) {
    if (
      e instanceof Error &&
      'code' in e &&
      (e as { code: string }).code === 'P2025'
    ) {
      return { success: false, error: 'Record not found' };
    }
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Database error',
    };
  }
}
