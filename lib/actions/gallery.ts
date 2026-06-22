import type { PrismaClient } from '@prisma/client';
import { createGalleryItemSchema } from '@/lib/validators/gallery';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * GalleryItem CRUD domain functions.
 *
 * Pure-ish: each function takes the Prisma client as a parameter so the
 * domain is testable without mocking `lib/db.ts`'s HMR singleton.
 *
 * Result shape: `{ success: true, data }` on success, `{ success: false,
 * error }` on validation/persistence failure. Never throws.
 */

export type GalleryItemRow = {
  id: string;
  titulo: string | null;
  descripcion: string | null;
  url: string;
  tipo: string;
  thumbnailUrl: string | null;
  embedUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createGalleryItemAction(
  db: PrismaClient,
  input: Record<string, unknown>,
): Promise<ActionResult<GalleryItemRow>> {
  const parsed = createGalleryItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Validation failed',
    };
  }

  const { titulo, descripcion, tipo, url, embedUrl } = parsed.data;

  try {
    const row = await db.galleryItem.create({
      data: {
        titulo: titulo ?? null,
        descripcion: descripcion ?? null,
        tipo,
        url,
        embedUrl: embedUrl ?? null,
      },
    });
    return { success: true, data: row as GalleryItemRow };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Database error',
    };
  }
}

export async function deleteGalleryItemAction(
  db: PrismaClient,
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    // Clean up photo file if FOTO type
    const item = await db.galleryItem.findUnique({ where: { id } });
    if (item?.tipo === 'FOTO' && item.url) {
      const filePath = path.join('public', item.url);
      await fs.unlink(filePath).catch(() => {
        // File may not exist — ignore
      });
    }

    await db.galleryItem.delete({ where: { id } });
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
