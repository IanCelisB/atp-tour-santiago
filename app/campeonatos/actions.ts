"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  createCampeonatoAction,
  updateCampeonatoAction,
  deleteCampeonatoAction,
} from "@/lib/actions/campeonato";

/**
 * Server Actions for Campeonatos CRUD.
 *
 * Thin wrappers that inject the production Prisma singleton
 * and revalidate the cache after mutations.
 */

export async function createCampeonato(formData: FormData) {
  const input: Record<string, unknown> = {
    nombre: formData.get("nombre"),
    fechaInicio: formData.get("fechaInicio")
      ? new Date(formData.get("fechaInicio") as string)
      : undefined,
    fechaFin: formData.get("fechaFin")
      ? new Date(formData.get("fechaFin") as string)
      : undefined,
    sede: formData.get("sede"),
    categoria: formData.get("categoria"),
    puntosTotales: formData.get("puntosTotales")
      ? parseInt(formData.get("puntosTotales") as string, 10)
      : 0,
    estado: formData.get("estado") || undefined,
    ganadorId: formData.get("ganadorId") || null,
  };

  const result = await createCampeonatoAction(prisma, input);

  if (result.success) {
    revalidatePath("/campeonatos");
    revalidatePath(`/campeonatos/${result.data.id}`);
  }

  return result;
}

export async function updateCampeonato(id: string, formData: FormData) {
  const input: Record<string, unknown> = {
    id,
    nombre: formData.get("nombre"),
    fechaInicio: formData.get("fechaInicio")
      ? new Date(formData.get("fechaInicio") as string)
      : undefined,
    fechaFin: formData.get("fechaFin")
      ? new Date(formData.get("fechaFin") as string)
      : undefined,
    sede: formData.get("sede"),
    categoria: formData.get("categoria"),
    puntosTotales: formData.get("puntosTotales")
      ? parseInt(formData.get("puntosTotales") as string, 10)
      : 0,
    estado: formData.get("estado") || undefined,
    ganadorId: formData.get("ganadorId") || null,
  };

  const result = await updateCampeonatoAction(prisma, input);

  if (result.success) {
    revalidatePath("/campeonatos");
    revalidatePath(`/campeonatos/${id}`);
    revalidatePath(`/campeonatos/${id}/editar`);
  }

  return result;
}

export async function deleteCampeonato(id: string) {
  const result = await deleteCampeonatoAction(prisma, id);

  if (result.success) {
    revalidatePath("/campeonatos");
  }

  return result;
}
