"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createJugadorAction, updateJugadorAction, deleteJugadorAction } from "@/lib/actions/jugador";

/**
 * Server Actions for Jugadores CRUD.
 *
 * These are thin wrappers that inject the production Prisma singleton
 * and revalidate the cache after mutations.
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

  const result = await updateJugadorAction(prisma, id, input);

  if (result.success) {
    revalidatePath("/jugadores");
    revalidatePath(`/jugadores/${id}`);
    revalidatePath(`/jugadores/${id}/editar`);
  }

  return result;
}

export async function deleteJugador(id: string) {
  const result = await deleteJugadorAction(prisma, id);

  if (result.success) {
    revalidatePath("/jugadores");
  }

  return result;
}
