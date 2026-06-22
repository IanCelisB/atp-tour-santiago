import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import EditarPartidoForm from "./form";

export const dynamic = "force-dynamic";

/**
 * Edit Partido page — server component.
 *
 * Fetches the partido data and passes it to the client form.
 */
export default async function EditarPartidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [partido, jugadores] = await Promise.all([
    prisma.partido.findUnique({ where: { id } }),
    prisma.jugador.findMany({
      select: { id: true, nombre: true, apellido: true },
      orderBy: { apellido: "asc" },
    }),
  ]);

  if (!partido) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href={`/partidos/${id}`}
          className="mb-8 inline-block text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          ← Volver al detalle
        </Link>

        <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          Editar Partido
        </h1>

        <EditarPartidoForm
          partido={{
            id: partido.id,
            campeonatoId: partido.campeonatoId,
            jugador1Id: partido.jugador1Id,
            jugador2Id: partido.jugador2Id,
            ganadorId: partido.ganadorId,
            marcador: partido.marcador,
            bracketPosition: partido.bracketPosition,
            ronda: partido.ronda,
            status: partido.status,
            fecha: partido.fecha,
          }}
          jugadores={jugadores}
        />
      </div>
    </main>
  );
}
