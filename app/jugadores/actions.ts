"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createJugadorAction, updateJugadorAction, deleteJugadorAction } from "@/lib/actions/jugador";
import { deleteImageFile } from "@/lib/image-cleanup";

/**
 * Server Actions for Jugadores CRUD.
 *
 * These are thin wrappers that inject the production Prisma singleton
 * and revalidate the cache after mutations.
 *
 * Also handles cleanup of uploaded image files on update/delete.
 */

export async function createJugador(formData: FormData) {
  const input: Record<string, unknown> = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    pais: formData.get("pais"),
    ranking: formData.get("ranking") ? Number(formData.get("ranking")) : null,
    bio: formData.get("bio") || undefined,
    fotoUrl: formData.get("fotoUrl") || undefined,
    resistencia: Number(formData.get("resistencia") ?? 50),
    velocidad: Number(formData.get("velocidad") ?? 50),
    derecho: Number(formData.get("derecho") ?? 50),
    reves: Number(formData.get("reves") ?? 50),
    estatura: Number(formData.get("estatura") ?? 170),
    poder: Number(formData.get("poder") ?? 50),
  };

  const result = await createJugadorAction(prisma, input);

  if (result.success) {
    revalidatePath("/jugadores");
    revalidatePath(`/jugadores/${result.data.id}`);
  }

  return result;
}

export async function updateJugador(id: string, formData: FormData) {
  const newFotoUrl = formData.get("fotoUrl") as string | null;

  // Fetch existing player to check for old photo
  const existing = await prisma.jugador.findUnique({
    where: { id },
    select: { fotoUrl: true },
  });

  // Clean up old photo if it's being replaced
  if (existing?.fotoUrl && newFotoUrl && existing.fotoUrl !== newFotoUrl) {
    await deleteImageFile(existing.fotoUrl);
  }

  const input: Record<string, unknown> = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    pais: formData.get("pais"),
    ranking: formData.get("ranking") ? Number(formData.get("ranking")) : null,
    bio: formData.get("bio") || undefined,
    fotoUrl: newFotoUrl || undefined,
    resistencia: Number(formData.get("resistencia") ?? 50),
    velocidad: Number(formData.get("velocidad") ?? 50),
    derecho: Number(formData.get("derecho") ?? 50),
    reves: Number(formData.get("reves") ?? 50),
    estatura: Number(formData.get("estatura") ?? 170),
    poder: Number(formData.get("poder") ?? 50),
  };

  const result = await updateJugadorAction(prisma, id, input);

  if (result.success) {
    revalidatePath("/jugadores");
    revalidatePath(`/jugadores/${id}`);
    revalidatePath(`/jugadores/${id}/editar`);
  }

  return result;
}

export async function deleteJugador(id: string) {
  // Fetch player to get photo URL before deletion
  const jugador = await prisma.jugador.findUnique({
    where: { id },
    select: { fotoUrl: true },
  });

  const result = await deleteJugadorAction(prisma, id);

  if (result.success) {
    // Clean up photo file after successful DB deletion
    if (jugador?.fotoUrl) {
      await deleteImageFile(jugador.fotoUrl);
    }
    revalidatePath("/jugadores");
  }

  return result;
}
