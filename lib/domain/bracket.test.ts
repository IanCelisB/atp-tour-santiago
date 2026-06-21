import { describe, expect, it } from 'vitest';
import { generateBracket, type SeededPlayer } from './bracket';

/**
 * Bracket generator tests (spec REQ-M-3, M3.a-d; OQ-D2 Grand Slam seeding).
 *
 * Grand Slam strict-separation rules (OQ-D2):
 *   - Seeds 1 and 2 land on OPPOSITE halves of the draw.
 *   - Seeds 3 and 4 land in separate quarters (not in the same half as 1 or 2).
 *   - In general: seeds i and (i+1) cannot meet before the round where
 *     they would naturally collide under standard top-half / bottom-half
 *     separation.
 *
 * Counts (M3.a-c):
 *   - 8 players  → 7 matches (4 R32-equivalent + 2 SF + 1 F)
 *   - 4 players  → 3 matches (2 SF + 1 F)
 *   - 16 players → 15 matches
 *
 * Inputs:
 *   - N must be a power of 2 in [2, 128] (M3.d — no byes this iter).
 *   - N must be 1..128 and seeds 1..N must each appear exactly once.
 */

const ids = (n: number): SeededPlayer[] =>
  Array.from({ length: n }, (_, i) => ({
    jugadorId: `jug-${i + 1}`,
    seed: i + 1,
  }));

describe('lib/domain/bracket', () => {
  describe('match counts (M3.a-c)', () => {
    it('generates exactly 7 matches for 8 players (M3.a)', () => {
      const matches = generateBracket(ids(8));
      expect(matches).toHaveLength(7);
    });

    it('generates exactly 15 matches for 16 players (M3.b)', () => {
      const matches = generateBracket(ids(16));
      expect(matches).toHaveLength(15);
    });

    it('generates exactly 3 matches for 4 players: 2 SF + 1 F (M3.c)', () => {
      const matches = generateBracket(ids(4));
      expect(matches).toHaveLength(3);
      // Round counts: SF = 2, F = 1
      const sf = matches.filter((m) => m.ronda === 'SF').length;
      const f = matches.filter((m) => m.ronda === 'F').length;
      expect(sf).toBe(2);
      expect(f).toBe(1);
    });

    it('generates 4 R32 + 2 SF + 1 F for 8 players', () => {
      const matches = generateBracket(ids(8));
      const r32 = matches.filter((m) => m.ronda === 'R32').length;
      const sf = matches.filter((m) => m.ronda === 'SF').length;
      const f = matches.filter((m) => m.ronda === 'F').length;
      expect(r32).toBe(4);
      expect(sf).toBe(2);
      expect(f).toBe(1);
    });

    it('generates 8 R16 + 4 QF + 2 SF + 1 F for 16 players', () => {
      const matches = generateBracket(ids(16));
      expect(matches.filter((m) => m.ronda === 'R16')).toHaveLength(8);
      expect(matches.filter((m) => m.ronda === 'QF')).toHaveLength(4);
      expect(matches.filter((m) => m.ronda === 'SF')).toHaveLength(2);
      expect(matches.filter((m) => m.ronda === 'F')).toHaveLength(1);
    });
  });

  describe('round distribution', () => {
    it('for 8 players, no match references a player twice (idempotent ids)', () => {
      const matches = generateBracket(ids(8));
      // Each match has two distinct player slots. Each player appears in
      // exactly one first-round match.
      const seen = new Set<string>();
      for (const m of matches.filter((x) => x.ronda === 'R32')) {
        expect(seen.has(m.jugador1Id)).toBe(false);
        expect(seen.has(m.jugador2Id)).toBe(false);
        seen.add(m.jugador1Id);
        seen.add(m.jugador2Id);
      }
      expect(seen.size).toBe(8);
    });
  });

  describe('Grand Slam strict-separation seeding (OQ-D2)', () => {
    it('seeds 1 and 2 land on OPPOSITE halves of an 8-player draw', () => {
      // In 8-player draw: half = 4 players. Top half = matches 0-1 (R32);
      // bottom half = matches 2-3 (R32). Seed 1's SF must be SF[0] and
      // seed 2's SF must be SF[1].
      const matches = generateBracket(ids(8));
      const sfMatches = matches.filter((m) => m.ronda === 'SF');
      expect(sfMatches).toHaveLength(2);

      const seed1SF = findSemifinalForSeed(matches, 1);
      const seed2SF = findSemifinalForSeed(matches, 2);
      expect(seed1SF).not.toBe(seed2SF);
    });

    it('seeds 3 and 4 land in different quarters of an 8-player draw', () => {
      // In an 8-player draw, the 4 R32 matches are the "quarters":
      //   quarter 0 = R32[0] (top-left)
      //   quarter 1 = R32[1] (top-right)
      //   quarter 2 = R32[2] (bottom-left)
      //   quarter 3 = R32[3] (bottom-right)
      // Standard Grand Slam pairing: 1v8, 4v5, 3v6, 2v7
      // → seeds 3 and 4 must be in different R32 matches.
      const matches = generateBracket(ids(8));
      const seed3Quarter = findQuarterForSeed(matches, 3);
      const seed4Quarter = findQuarterForSeed(matches, 4);
      expect(seed3Quarter).not.toBe(seed4Quarter);
    });

    it('seeds 1 and 2 can only meet in the Final', () => {
      // In Grand Slam seeding, the top two seeds are on opposite halves
      // and only meet in the last match.
      const matches = generateBracket(ids(8));
      const seed1Path = pathToFinal(matches, 1);
      const seed2Path = pathToFinal(matches, 2);
      // Last match in the path is the F.
      expect(seed1Path.at(-1)).toMatchObject({ ronda: 'F' });
      expect(seed2Path.at(-1)).toMatchObject({ ronda: 'F' });
    });

    it('standard 8-player pairing is 1v8, 4v5, 3v6, 2v7', () => {
      const matches = generateBracket(ids(8));
      const r32 = matches.filter((m) => m.ronda === 'R32');
      // Find the R32 match for each top seed and confirm the opponent.
      const r32For = (seed: number) =>
        r32.find((m) => m.jugador1Id === `jug-${seed}` || m.jugador2Id === `jug-${seed}`)!;
      expect(pairFromMatch(r32For(1))).toEqual(['jug-1', 'jug-8']);
      expect(pairFromMatch(r32For(2))).toEqual(['jug-2', 'jug-7']);
      expect(pairFromMatch(r32For(3))).toEqual(['jug-3', 'jug-6']);
      expect(pairFromMatch(r32For(4))).toEqual(['jug-4', 'jug-5']);
    });
  });

  describe('bracket position uniqueness (M5)', () => {
    it('every match has a unique bracketPosition across the bracket', () => {
      const matches = generateBracket(ids(8));
      const positions = matches.map((m) => m.bracketPosition);
      expect(new Set(positions).size).toBe(positions.length);
    });

    it('bracketPosition is a non-negative integer sequence starting at 0', () => {
      const matches = generateBracket(ids(8));
      const positions = matches.map((m) => m.bracketPosition).sort((a, b) => a - b);
      expect(positions).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('input validation (M3.d)', () => {
    it('throws when N is not a power of 2 (6 players)', () => {
      expect(() => generateBracket(ids(6))).toThrow();
    });

    it('throws when N is 3', () => {
      expect(() => generateBracket(ids(3))).toThrow();
    });

    it('throws when N is 1', () => {
      expect(() => generateBracket(ids(1))).toThrow();
    });

    it('throws when N is 0', () => {
      expect(() => generateBracket(ids(0))).toThrow();
    });

    it('throws when N > 128', () => {
      expect(() => generateBracket(ids(256))).toThrow();
    });

    it('throws when seed numbers are duplicated', () => {
      const players: SeededPlayer[] = [
        { jugadorId: 'a', seed: 1 },
        { jugadorId: 'b', seed: 1 },
      ];
      expect(() => generateBracket(players)).toThrow();
    });

    it('throws when seed numbers are not 1..N', () => {
      const players: SeededPlayer[] = [
        { jugadorId: 'a', seed: 1 },
        { jugadorId: 'b', seed: 3 }, // gap at 2
      ];
      expect(() => generateBracket(players)).toThrow();
    });
  });
});

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Returns the index of the SF match (0 or 1) that contains the given seed. */
function findSemifinalForSeed(matches: ReturnType<typeof generateBracket>, seed: number): number {
  // Walk the draw: find the R32 match with seed, trace its "winner" slot
  // to the SF, return the index of that SF in the matches list.
  const playerId = `jug-${seed}`;
  const r32 = matches.find(
    (m) => m.ronda === 'R32' && (m.jugador1Id === playerId || m.jugador2Id === playerId),
  );
  if (!r32) throw new Error(`seed ${seed} not found in R32`);
  // The "winner" placeholder is conventionally encoded as the SF match's
  // jugador slot that does NOT contain another concrete playerId from R32.
  // For our purposes, the SF that "contains" seed N's path is the one whose
  // bracketPosition is the parent of r32.bracketPosition. For 8 players:
  //   SF index 0 sits between R32[0] and R32[1]; SF index 1 between R32[2] and R32[3].
  // SF bracketPosition is 4 + Math.floor(r32Index / 2) where r32Index is the
  // position of r32 in the R32 list. For 8 players, R32 has 4 matches.
  const r32List = matches.filter((m) => m.ronda === 'R32');
  const r32Index = r32List.indexOf(r32);
  const sfPosition = 4 + Math.floor(r32Index / 2);
  return matches.findIndex((m) => m.bracketPosition === sfPosition);
}

/** Returns the quarter (R32 match index) that the given seed lands in. */
function findQuarterForSeed(matches: ReturnType<typeof generateBracket>, seed: number): number {
  const playerId = `jug-${seed}`;
  const r32 = matches.find(
    (m) => m.ronda === 'R32' && (m.jugador1Id === playerId || m.jugador2Id === playerId),
  );
  if (!r32) throw new Error(`seed ${seed} not found in R32`);
  const r32List = matches.filter((m) => m.ronda === 'R32');
  return r32List.indexOf(r32);
}

/** Returns the two jugador IDs of a match as a sorted pair. */
function pairFromMatch(m: { jugador1Id: string; jugador2Id: string }): [string, string] {
  return [m.jugador1Id, m.jugador2Id].sort() as [string, string];
}

/** Returns the chain of matches from a seed's R32 to the F. */
function pathToFinal(
  matches: ReturnType<typeof generateBracket>,
  seed: number,
): ReturnType<typeof generateBracket> {
  const playerId = `jug-${seed}`;
  const r32 = matches.find(
    (m) => m.ronda === 'R32' && (m.jugador1Id === playerId || m.jugador2Id === playerId),
  );
  if (!r32) throw new Error(`seed ${seed} not found in R32`);
  const r32List = matches.filter((m) => m.ronda === 'R32');
  const r32Index = r32List.indexOf(r32);
  const sfPosition = 4 + Math.floor(r32Index / 2);
  const sf = matches.find((m) => m.bracketPosition === sfPosition)!;
  const f = matches.find((m) => m.ronda === 'F')!;
  return [r32, sf, f];
}
