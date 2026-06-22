import type { PrismaClient } from '@prisma/client';
import { createPartidoSchema } from '@/lib/validators/partido';

/**
 * Partido CRUD domain functions.
 *
 * Pure-ish: each function takes the Prisma client as a parameter so the
 * domain is testable without mocking `lib/db.ts`'s HMR singleton. The
 * production caller (`app/partidos/actions.ts`) injects the singleton;
 * tests inject a client bound to `prisma/test.db`.
 *
 * Validation contract:
 *   - `createPartidoAction` runs `createPartidoSchema` against the
 *     input, defaults `status` to `PROGRAMADO`, and writes a new row.
 *   - `updatePartidoAction` runs the same schema on the patch and
 *     updates only the fields supplied. Special logic:
 *       * When status changes TO FINALIZADO → ganadorId required (validator handles this).
 *       * When status changes FROM FINALIZADO → ganadorId is cleared to null.
 *   - `deletePartidoAction` removes a row by id.
 *
 * Result shape: `{ success: true, data }` on success, `{ success: false,
 * error }` on validation/persistence failure. Never throws.
 */

export type PartidoRow = {
  id: string;
  campeonatoId: string;
  jugador1Id: string;
  jugador2Id: string;
  ganadorId: string | null;
  marcador: string | null;
  bracketPosition: number;
  ronda: string;
  status: string;
  fecha: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createPartidoAction(
  db: PrismaClient,
  input: Record<string, unknown>,
): Promise<ActionResult<PartidoRow>> {
  const parsed = createPartidoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Validation failed',
    };
  }

  const { ganadorId, status, ...data } = parsed.data;

  try {
    const row = await db.partido.create({
      data: {
        ...data,
        ganadorId: ganadorId ?? null,
        status: status ?? 'PROGRAMADO',
      },
    });
    return { success: true, data: row as PartidoRow };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Database error',
    };
  }
}

export async function updatePartidoAction(
  db: PrismaClient,
  input: Record<string, unknown>,
): Promise<ActionResult<PartidoRow>> {
  const { id, ...rest } = input;
  if (typeof id !== 'string' || !id) {
    return { success: false, error: 'id is required' };
  }

  const parsed = createPartidoSchema.safeParse(rest);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Validation failed',
    };
  }

  const { ganadorId, status, ...data } = parsed.data;

  // When transitioning FROM FINALIZADO to non-FINALIZADO, clear ganadorId
  let finalGanadorId = ganadorId ?? null;
  if (status !== 'FINALIZADO') {
    finalGanadorId = null;
  }

  try {
    const row = await db.partido.update({
      where: { id },
      data: {
        ...data,
        ganadorId: finalGanadorId,
        status: status ?? 'PROGRAMADO',
      },
    });
    return { success: true, data: row as PartidoRow };
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

export async function deletePartidoAction(
  db: PrismaClient,
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    await db.partido.delete({ where: { id } });
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
