import Link from "next/link";
import { prisma } from "@/lib/db";
import { getRanking } from "@/lib/domain/calculate-ranking";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const ranking = await getRanking(prisma);

  if (ranking.length === 0) {
    return (
      <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
            Ranking ATP
          </h1>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <p className="text-lg text-zinc-400">
              No hay campeonatos finalizados aún.
            </p>
            <p className="text-sm text-zinc-500">
              El ranking se calcula una vez que se asigna un ganador a los campeonatos finalizados.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          Ranking ATP
        </h1>
        <p className="mb-6 text-sm text-zinc-400">
          Puntos acumulados por los jugadores en campeonatos finalizados.
        </p>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Pos</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Jugador</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-300">Puntos</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-300">Títulos</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-300">Finales</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-300">Semis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {ranking.map((entry, index) => (
                <tr key={entry.jugadorId} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      index === 0 ? "bg-amber-400 text-black" :
                      index === 1 ? "bg-zinc-300 text-black" :
                      index === 2 ? "bg-amber-600 text-black" :
                      "bg-white/10 text-zinc-300"
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    <a href={`/jugadores/${entry.jugadorId}`} className="hover:text-blue-400">
                      {entry.nombre} {entry.apellido}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-mono font-semibold text-white">
                    {Number.isFinite(entry.totalPuntos) ? entry.totalPuntos : 0}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-zinc-300">{Number.isFinite(entry.titulos) ? entry.titulos : 0}</td>
                  <td className="px-6 py-4 text-right text-sm text-zinc-300">{Number.isFinite(entry.finales) ? entry.finales : 0}</td>
                  <td className="px-6 py-4 text-right text-sm text-zinc-300">{Number.isFinite(entry.semifinales) ? entry.semifinales : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
