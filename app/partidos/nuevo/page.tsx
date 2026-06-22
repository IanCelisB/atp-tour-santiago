import { prisma } from "@/lib/db";
import NuevoPartidoForm from "./form";

export const dynamic = "force-dynamic";

/**
 * Create new Partido page — server component.
 *
 * Fetches campeonatos and jugadores for the dropdowns,
 * then passes them to the client form.
 */
export default async function NuevoPartidoPage() {
  const [campeonatos, jugadores] = await Promise.all([
    prisma.campeonato.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.jugador.findMany({
      select: { id: true, nombre: true, apellido: true },
      orderBy: { apellido: "asc" },
    }),
  ]);

  return <NuevoPartidoForm campeonatos={campeonatos} jugadores={jugadores} />;
}
