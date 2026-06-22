"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  createPartidoAction,
  updatePartidoAction,
  deletePartidoAction,
} from "@/lib/actions/partido";

/**
 * Server Actions for Partidos CRUD.
 *
 * Thin wrappers that inject the production Prisma singleton
 * and revalidate the cache after mutations.
 */

export async function createPartido(formData: FormData) {
  const input: Record<string, unknown> = {
    campeonatoId: formData.get("campeonatoId"),
    jugador1Id: formData.get("jugador1Id"),
    jugador2Id: formData.get("jugador2Id"),
    marcador: formData.get("marcador") || null,
    bracketPosition: parseInt(formData.get("bracketPosition") as string, 10),
    ronda: formData.get("ronda"),
    fecha: formData.get("fecha") ? new Date(formData.get("fecha") as string) : null,
    status: formData.get("status") || undefined,
    ganadorId: formData.get("ganadorId") || null,
  };

  const result = await createPartidoAction(prisma, input);

  if (result.success) {
    revalidatePath("/partidos");
    revalidatePath(`/partidos/${result.data.id}`);
  }

  return result;
}

export async function updatePartido(id: string, formData: FormData) {
  const input: Record<string, unknown> = {
    id,
    campeonatoId: formData.get("campeonatoId"),
    jugador1Id: formData.get("jugador1Id"),
    jugador2Id: formData.get("jugador2Id"),
    marcador: formData.get("marcador") || null,
    bracketPosition: parseInt(formData.get("bracketPosition") as string, 10),
    ronda: formData.get("ronda"),
    fecha: formData.get("fecha") ? new Date(formData.get("fecha") as string) : null,
    status: formData.get("status") || undefined,
    ganadorId: formData.get("ganadorId") || null,
  };

  const result = await updatePartidoAction(prisma, input);

  if (result.success) {
    revalidatePath("/partidos");
    revalidatePath(`/partidos/${id}`);
    revalidatePath(`/partidos/${id}/editar`);
  }

  return result;
}

export async function deletePartido(id: string) {
  const result = await deletePartidoAction(prisma, id);

  if (result.success) {
    revalidatePath("/partidos");
  }

  return result;
}
