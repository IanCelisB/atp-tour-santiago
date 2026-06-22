"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  createNoticiaAction,
  updateNoticiaAction,
  deleteNoticiaAction,
} from "@/lib/actions/noticia";
import { requireAdmin } from "@/lib/auth/session";

/**
 * Server Actions for Noticias CRUD.
 *
 * Thin wrappers that inject the production Prisma singleton
 * and revalidate the cache after mutations.
 */

export async function createNoticia(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden: admin role required" } as const;
  }

  const input: Record<string, unknown> = {
    titulo: formData.get("titulo"),
    resumen: formData.get("resumen"),
    contenido: formData.get("contenido"),
    imagenUrl: formData.get("imagenUrl") || undefined,
    autor: formData.get("autor") || undefined,
    destacado: formData.get("destacado") === "on",
  };

  const result = await createNoticiaAction(prisma, input);

  if (result.success) {
    revalidatePath("/noticias");
    revalidatePath(`/noticias/${result.data.id}`);
  }

  return result;
}

export async function updateNoticia(id: string, formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden: admin role required" } as const;
  }

  const input: Record<string, unknown> = {
    titulo: formData.get("titulo"),
    resumen: formData.get("resumen"),
    contenido: formData.get("contenido"),
    imagenUrl: formData.get("imagenUrl") || undefined,
    autor: formData.get("autor") || undefined,
    destacado: formData.get("destacado") === "on",
  };

  const result = await updateNoticiaAction(prisma, id, input);

  if (result.success) {
    revalidatePath("/noticias");
    revalidatePath(`/noticias/${id}`);
    revalidatePath(`/noticias/${id}/editar`);
  }

  return result;
}

export async function deleteNoticia(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden: admin role required" } as const;
  }

  const result = await deleteNoticiaAction(prisma, id);

  if (result.success) {
    revalidatePath("/noticias");
  }

  return result;
}
