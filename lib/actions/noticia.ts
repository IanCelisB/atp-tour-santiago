import type { PrismaClient } from '@prisma/client';
import { createNoticiaSchema } from '@/lib/validators/noticia';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Noticia CRUD domain functions.
 *
 * Pure-ish: each function takes the Prisma client as a parameter so the
 * domain is testable without mocking `lib/db.ts`'s HMR singleton.
 *
 * Result shape: `{ success: true, data }` on success, `{ success: false,
 * error }` on validation/persistence failure. Never throws.
 */

export type NoticiaRow = {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  imagenUrl: string | null;
  autor: string;
  destacado: boolean;
  fechaPublicacion: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createNoticiaAction(
  db: PrismaClient,
  input: Record<string, unknown>,
): Promise<ActionResult<NoticiaRow>> {
  const parsed = createNoticiaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Validation failed',
    };
  }

  const { slug, autor, destacado, imagenUrl, ...data } = parsed.data;

  try {
    const row = await db.noticia.create({
      data: {
        ...data,
        slug,
        autor,
        destacado,
        imagenUrl: imagenUrl ?? null,
      },
    });
    return { success: true, data: row as NoticiaRow };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Database error',
    };
  }
}

export async function updateNoticiaAction(
  db: PrismaClient,
  id: string,
  input: Record<string, unknown>,
): Promise<ActionResult<NoticiaRow>> {
  const parsed = createNoticiaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Validation failed',
    };
  }

  const { slug, autor, destacado, imagenUrl, ...data } = parsed.data;

  try {
    const row = await db.noticia.update({
      where: { id },
      data: {
        ...data,
        slug,
        autor,
        destacado,
        imagenUrl: imagenUrl ?? null,
      },
    });
    return { success: true, data: row as NoticiaRow };
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

export async function deleteNoticiaAction(
  db: PrismaClient,
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    // Clean up imagenUrl file if exists
    const noticia = await db.noticia.findUnique({ where: { id } });
    if (noticia?.imagenUrl) {
      const filePath = path.join('public', noticia.imagenUrl);
      await fs.unlink(filePath).catch(() => {
        // File may not exist — ignore
      });
    }

    await db.noticia.delete({ where: { id } });
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
