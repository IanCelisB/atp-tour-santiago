import type { PrismaClient } from '@prisma/client';
import { puntosForPosition } from './ranking';

export interface RankingEntry {
  jugadorId: string;
  nombre: string;
  apellido: string;
  totalPuntos: number;
  titulos: number;
  finales: number;
  semifinales: number;
  campeonates: number;
}

export async function getRanking(db: PrismaClient): Promise<RankingEntry[]> {
  const campeonats = await db.campeonato.findMany({
    where: { estado: 'FINALIZADO' },
    include: {
      ganador: true,
      partidos: {
        where: { ronda: { in: ['F', 'SF'] } },
        include: {
          jugador1: { select: { id: true, nombre: true, apellido: true } },
          jugador2: { select: { id: true, nombre: true, apellido: true } },
        },
      },
    },
  });

  const stats = new Map<string, RankingEntry>();

  function ensureEntry(j: { id: string; nombre: string; apellido: string }): RankingEntry {
    const existing = stats.get(j.id);
    if (existing) return existing;
    const entry: RankingEntry = {
      jugadorId: j.id,
      nombre: j.nombre,
      apellido: j.apellido,
      totalPuntos: 0,
      titulos: 0,
      finales: 0,
      semifinales: 0,
      campeonates: 0,
    };
    stats.set(j.id, entry);
    return entry;
  }

  for (const camp of campeonats) {
    const finalMatch = camp.partidos.find((p) => p.ronda === 'F');
    const semiMatches = camp.partidos.filter((p) => p.ronda === 'SF');

    // 1st place: campeonate.ganadorId (or winner of F)
    const winnerId = camp.ganadorId ?? finalMatch?.ganadorId;
    if (winnerId) {
      let winner: { id: string; nombre: string; apellido: string } | null = null;
      if (camp.ganador) {
        winner = camp.ganador;
      } else if (finalMatch) {
        winner =
          finalMatch.jugador1.id === winnerId
            ? finalMatch.jugador1
            : finalMatch.jugador2;
      }
      if (winner) {
        const entry = ensureEntry(winner);
        entry.totalPuntos += puntosForPosition(camp.puntosTotales, 1);
        entry.titulos += 1;
        entry.campeonates += 1;
      }
    }

    // 2nd place: loser of F
    if (finalMatch && finalMatch.ganadorId) {
      const loserId =
        finalMatch.ganadorId === finalMatch.jugador1Id
          ? finalMatch.jugador2Id
          : finalMatch.jugador1Id;
      const loser =
        finalMatch.ganadorId === finalMatch.jugador1Id
          ? finalMatch.jugador2
          : finalMatch.jugador1;
      if (loser) {
        const entry = ensureEntry(loser);
        entry.totalPuntos += puntosForPosition(camp.puntosTotales, 2);
        entry.finales += 1;
        entry.campeonates += 1;
      }
    }

    // 3rd/4th: losers of each SF match
    for (const semi of semiMatches) {
      if (semi.ganadorId) {
        const loser =
          semi.ganadorId === semi.jugador1Id ? semi.jugador2 : semi.jugador1;
        if (loser) {
          const entry = ensureEntry(loser);
          entry.totalPuntos += puntosForPosition(camp.puntosTotales, 3);
          entry.semifinales += 1;
          entry.campeonates += 1;
        }
      }
    }
  }

  return Array.from(stats.values()).sort((a, b) => b.totalPuntos - a.totalPuntos);
}
