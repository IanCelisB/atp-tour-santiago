import { describe, expect, it } from 'vitest';
import { getRanking, type RankingEntry } from './calculate-ranking';
import {
  getTestPrisma,
  setupCampeonatoCleanup,
  teardownCampeonatoClient,
} from '@/lib/test-utils/test-db';
import type { PrismaClient } from '@prisma/client';

/**
 * calculate-ranking integration tests.
 *
 * Tests run against prisma/test.db with real DB operations.
 * Each test starts with a clean state via setupCampeonatoCleanup().
 */
describe('lib/domain/calculate-ranking', () => {
  setupCampeonatoCleanup();
  teardownCampeonatoClient();

  function prisma(): PrismaClient {
    return getTestPrisma();
  }

  it('returns empty array when no campeonats are FINALIZADO', async () => {
    const db = prisma();
    const j1 = await db.jugador.create({
      data: { nombre: 'A', apellido: 'Player', pais: 'CL' },
    });
    const j2 = await db.jugador.create({
      data: { nombre: 'B', apellido: 'Player', pais: 'AR' },
    });

    await db.campeonato.create({
      data: {
        nombre: 'Open Test',
        slug: 'open-test',
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-01-08'),
        sede: 'Santiago',
        categoria: 'ATP 250',
        estado: 'PROGRAMADO',
        puntosTotales: 250,
      },
    });

    const ranking = await getRanking(db);
    expect(ranking).toEqual([]);
  });

  it('returns empty array when no campeonats exist', async () => {
    const ranking = await getRanking(prisma());
    expect(ranking).toEqual([]);
  });

  it('aggregates puntos across multiple campeonats correctly', async () => {
    const db = prisma();

    // Create 4 players + SF opponents
    const winner = await db.jugador.create({
      data: { nombre: 'Carlos', apellido: 'Alcaraz', pais: 'ES' },
    });
    const finalist = await db.jugador.create({
      data: { nombre: 'Jannik', apellido: 'Sinner', pais: 'IT' },
    });
    // These are SF WINNERS (they reach the final but don't win the campeonate)
    const sfWinner1 = await db.jugador.create({
      data: { nombre: 'Novak', apellido: 'Djokovic', pais: 'RS' },
    });
    const sfWinner2 = await db.jugador.create({
      data: { nombre: 'Daniil', apellido: 'Medvedev', pais: 'RU' },
    });
    // These are SF LOSERS (they get 3rd/4th place points)
    const sfLoser1 = await db.jugador.create({
      data: { nombre: 'SF1', apellido: 'Loser', pais: 'CL' },
    });
    const sfLoser2 = await db.jugador.create({
      data: { nombre: 'SF2', apellido: 'Loser', pais: 'AR' },
    });
    const sfLoser3 = await db.jugador.create({
      data: { nombre: 'SF3', apellido: 'Loser', pais: 'CL' },
    });
    const sfLoser4 = await db.jugador.create({
      data: { nombre: 'SF4', apellido: 'Loser', pais: 'AR' },
    });

    // Campeonate 1: ATP 250 (250 puntos)
    const camp1 = await db.campeonato.create({
      data: {
        nombre: 'Open 250',
        slug: 'open-250',
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-01-08'),
        sede: 'Santiago',
        categoria: 'ATP 250',
        estado: 'FINALIZADO',
        puntosTotales: 250,
        ganadorId: winner.id,
      },
    });

    // Final: winner beats finalist
    await db.partido.create({
      data: {
        campeonatoId: camp1.id,
        jugador1Id: winner.id,
        jugador2Id: finalist.id,
        ganadorId: winner.id,
        ronda: 'F',
        bracketPosition: 7,
        status: 'FINALIZADO',
      },
    });

    // SF1: sfWinner1 beats sfLoser1
    await db.partido.create({
      data: {
        campeonatoId: camp1.id,
        jugador1Id: sfWinner1.id,
        jugador2Id: sfLoser1.id,
        ganadorId: sfWinner1.id,
        ronda: 'SF',
        bracketPosition: 5,
        status: 'FINALIZADO',
      },
    });

    // SF2: sfWinner2 beats sfLoser2
    await db.partido.create({
      data: {
        campeonatoId: camp1.id,
        jugador1Id: sfWinner2.id,
        jugador2Id: sfLoser2.id,
        ganadorId: sfWinner2.id,
        ronda: 'SF',
        bracketPosition: 6,
        status: 'FINALIZADO',
      },
    });

    // Campeonate 2: ATP 500 (500 puntos)
    const camp2 = await db.campeonato.create({
      data: {
        nombre: 'Open 500',
        slug: 'open-500',
        fechaInicio: new Date('2026-03-01'),
        fechaFin: new Date('2026-03-08'),
        sede: 'Viña',
        categoria: 'ATP 500',
        estado: 'FINALIZADO',
        puntosTotales: 500,
        ganadorId: finalist.id,
      },
    });

    // Final: finalist beats winner
    await db.partido.create({
      data: {
        campeonatoId: camp2.id,
        jugador1Id: finalist.id,
        jugador2Id: winner.id,
        ganadorId: finalist.id,
        ronda: 'F',
        bracketPosition: 7,
        status: 'FINALIZADO',
      },
    });

    // SF1: sfWinner1 beats sfLoser3
    await db.partido.create({
      data: {
        campeonatoId: camp2.id,
        jugador1Id: sfWinner1.id,
        jugador2Id: sfLoser3.id,
        ganadorId: sfWinner1.id,
        ronda: 'SF',
        bracketPosition: 5,
        status: 'FINALIZADO',
      },
    });

    // SF2: sfWinner2 beats sfLoser4
    await db.partido.create({
      data: {
        campeonatoId: camp2.id,
        jugador1Id: sfWinner2.id,
        jugador2Id: sfLoser4.id,
        ganadorId: sfWinner2.id,
        ronda: 'SF',
        bracketPosition: 6,
        status: 'FINALIZADO',
      },
    });

    const ranking = await getRanking(db);

    // Expected points:
    // camp1 (250): winner=250, finalist=150, sfLoser1=90, sfLoser2=90
    // camp2 (500): finalist=500, winner=300, sfLoser3=180, sfLoser4=180
    // Totals: finalist=650, winner=550, sfLoser3=180, sfLoser4=180, sfLoser1=90, sfLoser2=90

    // Find entries by jugadorId
    const findEntry = (id: string) => ranking.find((r) => r.jugadorId === id)!;

    // Main players get correct points
    expect(findEntry(finalist.id).totalPuntos).toBe(650);
    expect(findEntry(finalist.id).titulos).toBe(1);
    expect(findEntry(finalist.id).finales).toBe(1);

    expect(findEntry(winner.id).totalPuntos).toBe(550);
    expect(findEntry(winner.id).titulos).toBe(1);
    expect(findEntry(winner.id).finales).toBe(1);

    // SF losers get 3rd/4th place points
    expect(findEntry(sfLoser3.id).totalPuntos).toBe(180);
    expect(findEntry(sfLoser3.id).semifinales).toBe(1);

    expect(findEntry(sfLoser4.id).totalPuntos).toBe(180);
    expect(findEntry(sfLoser4.id).semifinales).toBe(1);

    expect(findEntry(sfLoser1.id).totalPuntos).toBe(90);
    expect(findEntry(sfLoser1.id).semifinales).toBe(1);

    expect(findEntry(sfLoser2.id).totalPuntos).toBe(90);
    expect(findEntry(sfLoser2.id).semifinales).toBe(1);

    // Ranking is sorted by totalPuntos descending
    expect(ranking[0].totalPuntos).toBeGreaterThanOrEqual(ranking[1].totalPuntos);
    expect(ranking[1].totalPuntos).toBeGreaterThanOrEqual(ranking[2].totalPuntos);
  });

  it('counts titulos, finales, semifinales correctly', async () => {
    const db = prisma();

    const champion = await db.jugador.create({
      data: { nombre: 'Champion', apellido: 'Player', pais: 'CL' },
    });
    const runnerUp = await db.jugador.create({
      data: { nombre: 'Runner', apellido: 'Up', pais: 'AR' },
    });
    const semiA = await db.jugador.create({
      data: { nombre: 'Semi', apellido: 'A', pais: 'BR' },
    });
    const semiB = await db.jugador.create({
      data: { nombre: 'Semi', apellido: 'B', pais: 'PE' },
    });

    // 3 campeonates all won by champion
    for (let i = 0; i < 3; i++) {
      const camp = await db.campeonato.create({
        data: {
          nombre: `Open ${i}`,
          slug: `open-${i}`,
          fechaInicio: new Date(`2026-0${i + 1}-01`),
          fechaFin: new Date(`2026-0${i + 1}-08`),
          sede: 'Santiago',
          categoria: 'ATP 250',
          estado: 'FINALIZADO',
          puntosTotales: 250,
          ganadorId: champion.id,
        },
      });

      await db.partido.create({
        data: {
          campeonatoId: camp.id,
          jugador1Id: champion.id,
          jugador2Id: runnerUp.id,
          ganadorId: champion.id,
          ronda: 'F',
          bracketPosition: 7,
          status: 'FINALIZADO',
        },
      });

      await db.partido.create({
        data: {
          campeonatoId: camp.id,
          jugador1Id: semiA.id,
          jugador2Id: semiB.id,
          ganadorId: semiA.id,
          ronda: 'SF',
          bracketPosition: 5,
          status: 'FINALIZADO',
        },
      });
    }

    const ranking = await getRanking(db);

    const championEntry = ranking.find((r) => r.jugadorId === champion.id)!;
    expect(championEntry.titulos).toBe(3);
    expect(championEntry.finales).toBe(0);
    expect(championEntry.semifinales).toBe(0);
    expect(championEntry.campeonates).toBe(3);
    expect(championEntry.totalPuntos).toBe(750);

    const runnerUpEntry = ranking.find((r) => r.jugadorId === runnerUp.id)!;
    expect(runnerUpEntry.titulos).toBe(0);
    expect(runnerUpEntry.finales).toBe(3);
    expect(runnerUpEntry.semifinales).toBe(0);
    expect(runnerUpEntry.campeonates).toBe(3);
    expect(runnerUpEntry.totalPuntos).toBe(450);
  });

  it('sorts by totalPuntos descending', async () => {
    const db = prisma();

    const j1 = await db.jugador.create({
      data: { nombre: 'Low', apellido: 'Points', pais: 'CL' },
    });
    const j2 = await db.jugador.create({
      data: { nombre: 'High', apellido: 'Points', pais: 'AR' },
    });
    const j3 = await db.jugador.create({
      data: { nombre: 'Mid', apellido: 'Points', pais: 'BR' },
    });

    // j2 wins a 500 (500 pts)
    const camp1 = await db.campeonato.create({
      data: {
        nombre: 'Big Open',
        slug: 'big-open',
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-01-08'),
        sede: 'Santiago',
        categoria: 'ATP 500',
        estado: 'FINALIZADO',
        puntosTotales: 500,
        ganadorId: j2.id,
      },
    });

    await db.partido.create({
      data: {
        campeonatoId: camp1.id,
        jugador1Id: j2.id,
        jugador2Id: j1.id,
        ganadorId: j2.id,
        ronda: 'F',
        bracketPosition: 7,
        status: 'FINALIZADO',
      },
    });

    // j3 wins a 250 (250 pts)
    const camp2 = await db.campeonato.create({
      data: {
        nombre: 'Small Open',
        slug: 'small-open',
        fechaInicio: new Date('2026-03-01'),
        fechaFin: new Date('2026-03-08'),
        sede: 'Viña',
        categoria: 'ATP 250',
        estado: 'FINALIZADO',
        puntosTotales: 250,
        ganadorId: j3.id,
      },
    });

    await db.partido.create({
      data: {
        campeonatoId: camp2.id,
        jugador1Id: j3.id,
        jugador2Id: j1.id,
        ganadorId: j3.id,
        ronda: 'F',
        bracketPosition: 7,
        status: 'FINALIZADO',
      },
    });

    const ranking = await getRanking(db);

    // j2: 500 (winner of camp1)
    // j1: 300 + 150 = 450 (finalist in both camps)
    // j3: 250 (winner of camp2)
    expect(ranking[0].jugadorId).toBe(j2.id);
    expect(ranking[0].totalPuntos).toBe(500);
    expect(ranking[1].jugadorId).toBe(j1.id);
    expect(ranking[1].totalPuntos).toBe(450);
    expect(ranking[2].jugadorId).toBe(j3.id);
    expect(ranking[2].totalPuntos).toBe(250);
  });
});
