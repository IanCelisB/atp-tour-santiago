import { Trophy } from "lucide-react";
import { prisma } from "@/lib/db";

/**
 * Vertical timeline showing the last 5 completed campeonatos with their winners.
 *
 * Fetches FINALIZADO campeonatos ordered by fechaFin desc, using the direct
 * `ganador` relation on Campeonato. Falls back to "Por definir" when no
 * winner data is available.
 *
 * Server component — no client JS shipped.
 */
export async function CampeonatoTimeline() {
  const campeonatos = await prisma.campeonato.findMany({
    where: { estado: "FINALIZADO" },
    orderBy: { fechaFin: "desc" },
    take: 5,
    include: {
      ganador: { select: { nombre: true, apellido: true } },
    },
  });

  if (campeonatos.length === 0) {
    return (
      <section className="w-full max-w-5xl">
        <h2 className="mb-8 text-2xl font-semibold text-white">
          Últimos Campeonatos
        </h2>
        <p className="text-zinc-400">
          No hay campeonatos finalizados todavía.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-5xl">
      <h2 className="mb-8 text-2xl font-semibold text-white">
        Últimos Campeonatos
      </h2>

      <div className="relative ml-4 border-l border-white/10 pl-8">
        {campeonatos.map((camp, index) => {
          const winner = camp.ganador;
          const winnerName = winner
            ? `${winner.nombre} ${winner.apellido}`
            : "Por definir";

          const date = camp.fechaFin
            ? new Date(camp.fechaFin).toLocaleDateString("es-CL", {
                year: "numeric",
                month: "short",
              })
            : "";

          return (
            <div key={camp.id} className="relative mb-8 last:mb-0">
              {/* Timeline dot */}
              <div
                className={`absolute -left-[41px] top-6 h-3 w-3 rounded-full border-2 border-white/20 ${
                  index === 0
                    ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                    : "bg-zinc-600"
                }`}
              />

              {/* Card */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                      <span>{date}</span>
                      <span className="text-white/10">|</span>
                      <span>{camp.sede}</span>
                    </div>
                    <h3 className="text-lg font-medium text-white truncate">
                      {camp.nombre}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Trophy
                      className={`h-4 w-4 ${
                        index === 0 ? "text-amber-400" : "text-zinc-500"
                      }`}
                      strokeWidth={1.5}
                    />
                    <span
                      className={`text-sm font-medium ${
                        index === 0 ? "text-amber-300" : "text-zinc-300"
                      }`}
                    >
                      {winnerName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
