"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createGalleryItemAction, deleteGalleryItemAction } from "@/lib/actions/gallery";
import { requireAdmin } from "@/lib/auth/session";

/**
 * Server Actions for Galería CRUD.
 *
 * Thin wrappers that inject the production Prisma singleton
 * and revalidate the cache after mutations.
 */

export async function createGalleryItem(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden: admin role required" } as const;
  }

  const input: Record<string, unknown> = {
    titulo: formData.get("titulo") || undefined,
    descripcion: formData.get("descripcion") || undefined,
    tipo: formData.get("tipo"),
    url: formData.get("url"),
    embedUrl: formData.get("embedUrl") || undefined,
  };

  const result = await createGalleryItemAction(prisma, input);

  if (result.success) {
    revalidatePath("/galeria");
  }

  return result;
}

export async function deleteGalleryItem(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden: admin role required" } as const;
  }

  const result = await deleteGalleryItemAction(prisma, id);

  if (result.success) {
    revalidatePath("/galeria");
  }

  return result;
}
