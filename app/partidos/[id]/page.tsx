import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { deletePartido } from "../actions";

export const dynamic = "force-dynamic";

/**
 * Partido detail page — server component.
 *
 * Shows both players, status badge, round, bracket position,
 * score, winner, date, and action buttons.
 */

const STATUS_COLORS: Record<string, string> = {
  PROGRAMADO: "bg-blue-400/80 text-black",
  EN_CURSO:
    "bg-green-400/80 text-black font-semibold ring-1 ring-green-300/70",
  FINALIZADO: "bg-zinc-400/50 text-black",
  WALKOVER: "bg-yellow-400/70 text-black",
  CANCELADO: "bg-red-400/70 text-black",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function PartidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const partido = await prisma.partido.findUnique({
    where: { id },
    include: {
      jugador1: true,
      jugador2: true,
      ganador: true,
      campeonato: true,
    },
  });

  if (!partido) {
    notFound();
  }

  async function handleDelete() {
    "use server";
    const result = await deletePartido(id);
    if (result.success) {
      redirect("/partidos");
    }
  }

  const isCompleted = partido.status === "FINALIZADO";

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/partidos"
          className="mb-8 inline-block text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          ← Volver a Partidos
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Partido
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[partido.status] ?? "bg-zinc-500/20 text-zinc-400"}`}
            >
              {partido.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {partido.campeonato.nombre} — {partido.ronda}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Match Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Jugadores
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/jugadores/${partido.jugador1Id}`}
                    className={`text-sm transition-colors hover:text-blue-400 ${isCompleted && partido.ganadorId === partido.jugador1Id ? "font-bold text-white" : "text-zinc-300"}`}
                  >
                    {partido.jugador1.nombre} {partido.jugador1.apellido}
                    {isCompleted && partido.ganadorId === partido.jugador1Id && (
                      <span className="ml-1.5">🏆</span>
                    )}
                  </Link>
                  <span className="text-xs text-zinc-500">J1</span>
                </div>
                <div className="border-t border-white/10" />
                <div className="flex items-center justify-between">
                  <Link
                    href={`/jugadores/${partido.jugador2Id}`}
                    className={`text-sm transition-colors hover:text-blue-400 ${isCompleted && partido.ganadorId === partido.jugador2Id ? "font-bold text-white" : "text-zinc-300"}`}
                  >
                    {partido.jugador2.nombre} {partido.jugador2.apellido}
                    {isCompleted && partido.ganadorId === partido.jugador2Id && (
                      <span className="ml-1.5">🏆</span>
                    )}
                  </Link>
                  <span className="text-xs text-zinc-500">J2</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Detalles
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-zinc-400">Ronda</dt>
                  <dd className="text-white">{partido.ronda}</dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-400">
                    Posición en bracket
                  </dt>
                  <dd className="text-white">{partido.bracketPosition}</dd>
                </div>
                {partido.fecha && (
                  <div>
                    <dt className="text-sm text-zinc-400">Fecha</dt>
                    <dd className="text-white">
                      {formatDate(partido.fecha)}
                    </dd>
                  </div>
                )}
                {partido.marcador && (
                  <div>
                    <dt className="text-sm text-zinc-400">Marcador</dt>
                    <dd className="font-mono text-white">
                      {partido.marcador}
                    </dd>
                  </div>
                )}
                {isCompleted && partido.ganador && (
                  <div>
                    <dt className="text-sm text-zinc-400">Ganador</dt>
                    <dd className="font-bold text-white">
                      {partido.ganador.nombre} {partido.ganador.apellido} 🏆
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link
                href={`/partidos/${id}/editar`}
                className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                Editar
              </Link>
              <form action={handleDelete}>
                <button
                  type="submit"
                  className="rounded-xl bg-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
                >
                  Eliminar
                </button>
              </form>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Metadatos
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-zinc-400">ID</dt>
                <dd className="font-mono text-xs text-zinc-300">
                  {partido.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-400">Campeonato</dt>
                <dd className="text-white">
                  <Link
                    href={`/campeonatos/${partido.campeonatoId}`}
                    className="text-sm text-blue-400 transition-colors hover:text-blue-300"
                  >
                    {partido.campeonato.nombre}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-400">Creado</dt>
                <dd className="text-white">
                  {formatDate(partido.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-400">Actualizado</dt>
                <dd className="text-white">
                  {formatDate(partido.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
