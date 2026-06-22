import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { RadarChart } from "@/components/RadarChart";
import { deleteJugador } from "../actions";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Player detail page — server component.
 *
 * Shows player photo (or initials placeholder) on the left,
 * radar chart on the right, and stat bars below.
 */
export default async function JugadorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const jugador = await prisma.jugador.findUnique({
    where: { id },
  });

  if (!jugador) {
    notFound();
  }

  const admin = await isAdmin();

  const stats = [
    { label: "RES", value: jugador.resistencia },
    { label: "VEL", value: jugador.velocidad },
    { label: "DER", value: jugador.derecho },
    { label: "REV", value: jugador.reves },
    { label: "EST", value: Math.round(((jugador.estatura - 100) / 150) * 100) },
    { label: "POW", value: jugador.poder },
  ];

  const statBars = [
    { label: "Resistencia", value: jugador.resistencia, color: "bg-blue-500" },
    { label: "Velocidad", value: jugador.velocidad, color: "bg-green-500" },
    { label: "Derecho", value: jugador.derecho, color: "bg-amber-500" },
    { label: "Reves", value: jugador.reves, color: "bg-purple-500" },
    { label: "Estatura", value: jugador.estatura, suffix: "cm", color: "bg-cyan-500" },
    { label: "Poder", value: jugador.poder, color: "bg-red-500" },
  ];

  const initials = `${jugador.nombre.charAt(0)}${jugador.apellido.charAt(0)}`.toUpperCase();

  async function handleDelete() {
    "use server";
    const result = await deleteJugador(id);
    if (result.success) {
      redirect("/jugadores");
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/jugadores"
          className="mb-8 inline-block text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          ← Volver a Jugadores
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: Player Info */}
          <div>
            {/* Player Photo / Initials */}
            <div className="mb-6">
              {jugador.fotoUrl ? (
                <img
                  src={jugador.fotoUrl}
                  alt={`${jugador.nombre} ${jugador.apellido}`}
                  className="mb-4 max-w-[300px] rounded-2xl object-cover"
                />
              ) : (
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-500/20 text-2xl font-bold text-blue-400">
                  {initials}
                </div>
              )}

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {jugador.nombre} {jugador.apellido}
              </h1>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-lg text-zinc-400">{jugador.pais}</span>
                {jugador.ranking && (
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-400">
                    Ranking #{jugador.ranking}
                  </span>
                )}
              </div>
            </div>

            {jugador.bio && (
              <p className="mb-8 leading-relaxed text-zinc-300">{jugador.bio}</p>
            )}

            {/* Stat Bars */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Estadísticas</h2>
              {statBars.map((stat) => (
                <div key={stat.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{stat.label}</span>
                    <span className="font-medium text-white">
                      {stat.value}
                      {stat.suffix ? ` ${stat.suffix}` : ""}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${stat.color} transition-all`}
                      style={{
                        width: `${stat.suffix ? ((stat.value - 100) / 150) * 100 : stat.value}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {admin && (
              <div className="mt-8 flex gap-4">
                <Link
                  href={`/jugadores/${id}/editar`}
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
            )}
          </div>

          {/* Right: Radar Chart */}
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <RadarChart stats={stats} size={300} color="#3b82f6" />
            </div>
            <p className="mt-4 text-sm text-zinc-500">Radar de habilidades</p>
          </div>
        </div>
      </div>
    </main>
  );
}
