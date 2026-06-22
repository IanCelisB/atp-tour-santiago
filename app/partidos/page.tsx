import Link from "next/link";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Partidos list page — server component.
 *
 * Fetches all partidos grouped by campeonato. Each card shows both players,
 * the round badge, status badge, and score if completed.
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
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function PartidosPage() {
  const [campeonatos, admin] = await Promise.all([
    prisma.campeonato.findMany({
      include: {
        partidos: {
          include: {
            jugador1: true,
            jugador2: true,
            ganador: true,
          },
          orderBy: { bracketPosition: "asc" },
        },
      },
      orderBy: { fechaInicio: "desc" },
    }),
    isAdmin(),
  ]);

  const totalPartidos = campeonatos.reduce(
    (sum, c) => sum + c.partidos.length,
    0,
  );

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Partidos
          </h1>
          {admin && (
            <Link
              href="/partidos/nuevo"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              + Nuevo Partido
            </Link>
          )}
        </div>

        {totalPartidos === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <p className="text-lg text-zinc-400">
              No hay partidos registrados.
            </p>
            {admin && (
              <Link
                href="/partidos/nuevo"
                className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
              >
                Crear el primero →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {campeonatos.map(
              (c) =>
                c.partidos.length > 0 && (
                  <section key={c.id}>
                    <h2 className="mb-4 text-xl font-semibold text-white">
                      {c.nombre}
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {c.partidos.map((p) => (
                        <Link
                          key={p.id}
                          href={`/partidos/${p.id}`}
                          className="group block"
                        >
                          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-green-500/25">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                                {p.ronda}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status] ?? "bg-zinc-500/20 text-zinc-400"}`}
                              >
                                {p.status.replace("_", " ")}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              <p
                                className={`text-sm ${p.ganadorId === p.jugador1Id ? "font-bold text-white" : "text-zinc-300"}`}
                              >
                                {p.jugador1.nombre} {p.jugador1.apellido}
                                {p.ganadorId === p.jugador1Id && (
                                  <span className="ml-1.5">🏆</span>
                                )}
                              </p>
                              <p
                                className={`text-sm ${p.ganadorId === p.jugador2Id ? "font-bold text-white" : "text-zinc-300"}`}
                              >
                                {p.jugador2.nombre} {p.jugador2.apellido}
                                {p.ganadorId === p.jugador2Id && (
                                  <span className="ml-1.5">🏆</span>
                                )}
                              </p>
                            </div>

                            {p.marcador && (
                              <p className="mt-2 text-xs font-medium text-zinc-400">
                                {p.marcador}
                              </p>
                            )}

                            {p.fecha && (
                              <p className="mt-2 text-xs text-zinc-500">
                                {formatDate(p.fecha)}
                              </p>
                            )}

                            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors group-hover:text-white">
                              <span>Ver detalle</span>
                              <span className="transition-transform group-hover:translate-x-1">
                                →
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ),
            )}
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/"
            className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
