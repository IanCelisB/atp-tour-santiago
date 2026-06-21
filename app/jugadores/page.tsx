import Link from "next/link";
import { prisma } from "@/lib/db";

/**
 * Jugadores list page — server component.
 *
 * Fetches all jugadores from the database and renders them in a responsive
 * grid (2 col mobile, 3 col desktop). Each card links to the player detail.
 */
export default async function JugadoresPage() {
  const jugadores = await prisma.jugador.findMany({
    orderBy: { ranking: { sort: "asc", nulls: "last" } },
  });

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Jugadores
          </h1>
          <Link
            href="/jugadores/nuevo"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            + Nuevo Jugador
          </Link>
        </div>

        {jugadores.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <p className="text-lg text-zinc-400">No hay jugadores registrados.</p>
            <Link
              href="/jugadores/nuevo"
              className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
            >
              Crear el primero →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jugadores.map((j) => (
              <Link
                key={j.id}
                href={`/jugadores/${j.id}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/25">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                      {j.nombre} {j.apellido}
                    </h2>
                    {j.ranking && (
                      <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                        #{j.ranking}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">{j.pais}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors group-hover:text-white">
                    <span>Ver perfil</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
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
