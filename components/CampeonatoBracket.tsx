import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type PartidoConJugadores = Prisma.PartidoGetPayload<{
  include: {
    jugador1: true;
    jugador2: true;
    ganador: true;
  };
}>;

const RONDA_LABELS: Record<string, string> = {
  F: "Final",
  SF: "Semifinales",
  QF: "Cuartos de Final",
  R16: "Octavos de Final",
  R32: "Dieciseisavos de Final",
  R64: "Treintaidosavos de Final",
  R128: "Primera Ronda",
};

const STATUS_COLORS: Record<string, string> = {
  PROGRAMADO: "bg-blue-400/80 text-black",
  EN_CURSO:
    "bg-green-400/80 text-black font-semibold ring-1 ring-green-300/70",
  FINALIZADO: "bg-zinc-400/50 text-black",
  WALKOVER: "bg-yellow-400/70 text-black",
  CANCELADO: "bg-red-400/70 text-black",
};

const RONDA_ORDER = ["F", "SF", "QF", "R16", "R32", "R64", "R128"] as const;

interface CampeonatoBracketProps {
  campeonatoId: string;
  estado: string;
}

export async function CampeonatoBracket({
  campeonatoId,
  estado,
}: CampeonatoBracketProps) {
  if (estado !== "EN_CURSO" && estado !== "FINALIZADO") {
    return null;
  }

  const partidos = await prisma.partido.findMany({
    where: { campeonatoId },
    include: {
      jugador1: true,
      jugador2: true,
      ganador: true,
    },
    orderBy: [{ ronda: "desc" }, { bracketPosition: "asc" }],
  });

  if (partidos.length === 0) {
    return null;
  }

  // Group partidos by ronda
  const partidosByRonda: Record<string, typeof partidos> = {};
  for (const partido of partidos) {
    if (!partidosByRonda[partido.ronda]) {
      partidosByRonda[partido.ronda] = [];
    }
    partidosByRonda[partido.ronda].push(partido);
  }

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Árbol del Torneo
      </h2>

      {RONDA_ORDER.map((ronda) => {
        const rondaPartidos = partidosByRonda[ronda];
        if (!rondaPartidos || rondaPartidos.length === 0) {
          return null;
        }

        return (
          <div key={ronda} className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 mt-8">
              {RONDA_LABELS[ronda] ?? ronda}
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rondaPartidos.map((partido: PartidoConJugadores) => (
                <div
                  key={partido.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                      {partido.ronda}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[partido.status] ?? "bg-zinc-500/20 text-zinc-400"}`}
                    >
                      {partido.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <p
                      className={`text-sm ${partido.ganadorId === partido.jugador1Id ? "font-bold text-white" : "text-zinc-300"}`}
                    >
                      {partido.jugador1.nombre}{" "}
                      {partido.jugador1.apellido}
                      {partido.ganadorId === partido.jugador1Id && (
                        <span className="ml-1.5">🏆</span>
                      )}
                    </p>
                    <p
                      className={`text-sm ${partido.ganadorId === partido.jugador2Id ? "font-bold text-white" : "text-zinc-300"}`}
                    >
                      {partido.jugador2.nombre}{" "}
                      {partido.jugador2.apellido}
                      {partido.ganadorId === partido.jugador2Id && (
                        <span className="ml-1.5">🏆</span>
                      )}
                    </p>
                  </div>

                  {partido.marcador && (
                    <p className="mt-2 text-xs font-medium text-zinc-400">
                      {partido.marcador}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
