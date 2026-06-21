import type { PrismaClient } from "@prisma/client";
import { createJugadorSchema } from "@/lib/validators/jugador";

/**
 * Jugador CRUD domain functions.
 *
 * Pure-ish: each function takes the Prisma client as a parameter so the
 * domain is testable without mocking `lib/db.ts`'s HMR singleton.
 *
 * Result shape: `{ success: true, data }` on success, `{ success: false,
 * error }` on validation/persistence failure. Never throws.
 */

export type JugadorRow = {
  id: string;
  nombre: string;
  apellido: string;
  pais: string;
  slug: string;
  ranking: number | null;
  bio: string | null;
  fotoUrl: string | null;
  resistencia: number;
  velocidad: number;
  derecho: number;
  reves: number;
  estatura: number;
  poder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createJugadorAction(
  db: PrismaClient,
  input: Record<string, unknown>
): Promise<ActionResult<JugadorRow>> {
  const parsed = createJugadorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const { slug, ...data } = parsed.data;

  try {
    const row = await db.jugador.create({
      data: { ...data, slug },
    });
    return { success: true, data: row as JugadorRow };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Database error" };
  }
}

export async function updateJugadorAction(
  db: PrismaClient,
  id: string,
  input: Record<string, unknown>
): Promise<ActionResult<JugadorRow>> {
  const parsed = createJugadorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const { slug, ...data } = parsed.data;

  try {
    const row = await db.jugador.update({
      where: { id },
      data: { ...data, slug },
    });
    return { success: true, data: row as JugadorRow };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Database error" };
  }
}

export async function deleteJugadorAction(
  db: PrismaClient,
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await db.jugador.delete({ where: { id } });
    return { success: true, data: { id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Database error" };
  }
}
