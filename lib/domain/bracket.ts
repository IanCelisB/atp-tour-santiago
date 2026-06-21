/**
 * Single-elimination bracket generator (spec REQ-M-3; OQ-D2 Grand Slam seeding).
 *
 * Constraints:
 *   - N must be a power of 2 in [2, 128] (M3.d — no byes this iter).
 *   - Seed numbers 1..N must each appear exactly once.
 *   - Total matches = N - 1; total rounds = log2(N).
 *   - Round labels follow the spec convention: for a log2(N)-round draw,
 *     the labels from first round to last are anchored at F, e.g.
 *       N=2  → [F]
 *       N=4  → [SF, F]
 *       N=8  → [R32, SF, F]
 *       N=16 → [R16, QF, SF, F]
 *       N=128 → [R128, R64, R32, R16, QF, SF, F]
 *   - Grand Slam strict-separation (OQ-D2): seeds 1-2 on opposite halves,
 *     seeds 3-4 in separate quarters. Achieved by bit-reversing the seed
 *     index to compute slot positions (the standard tournament algorithm).
 */

export type SeededPlayer = {
  jugadorId: string;
  seed: number;
};

export type BracketMatch = {
  bracketPosition: number;
  ronda: string;
  jugador1Id: string;
  jugador2Id: string;
};

/**
 * Per-N round label table (spec M3.a-c).
 *
 * The first-round label is determined by the draw size per the spec's
 * convention. We hardcode the table rather than derive it generically
 * because the spec's choice (e.g. R32 for 8 players, not R16 or QF) is
 * a fixed convention.
 */
const ROUND_LABELS_BY_N: Record<number, readonly string[]> = {
  2: ['F'],
  4: ['SF', 'F'],
  8: ['R32', 'SF', 'F'],
  16: ['R16', 'QF', 'SF', 'F'],
  32: ['R32', 'R16', 'QF', 'SF', 'F'],
  64: ['R64', 'R32', 'R16', 'QF', 'SF', 'F'],
  128: ['R128', 'R64', 'R32', 'R16', 'QF', 'SF', 'F'],
};

const isPowerOfTwo = (n: number): boolean => n > 0 && (n & (n - 1)) === 0;

/** Reverse the lowest `bits` bits of `n` (used for Grand Slam slot mapping). */
function reverseBits(n: number, bits: number): number {
  let result = 0;
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (n & 1);
    n >>= 1;
  }
  return result;
}

function labelForRound(roundIndex: number, n: number): string {
  return ROUND_LABELS_BY_N[n][roundIndex];
}

/**
 * Generate a complete single-elimination bracket.
 *
 * The returned list contains ALL matches across all rounds. The first N/2
 * matches have real `jugador1Id` / `jugador2Id`. Subsequent rounds have
 * placeholder IDs of the form `__winner_<position>` referencing the match
 * whose winner will fill that slot.
 *
 * @throws RangeError if N is not a power of 2 in [2, 128], or seeds are
 *         not exactly 1..N, or duplicate jugadorIds are supplied.
 */
export function generateBracket(players: SeededPlayer[]): BracketMatch[] {
  const n = players.length;

  if (n < 2 || n > 128 || !isPowerOfTwo(n)) {
    throw new RangeError(
      `N must be a power of 2 in [2, 128]; got ${n}. No byes are supported this iteration.`,
    );
  }

  // Validate seeds: must be exactly 1..N, each once.
  const seenSeeds = new Set<number>();
  for (const p of players) {
    if (!Number.isInteger(p.seed) || p.seed < 1 || p.seed > n) {
      throw new RangeError(`Seed ${p.seed} is out of range 1..${n}.`);
    }
    if (seenSeeds.has(p.seed)) {
      throw new RangeError(`Duplicate seed ${p.seed}.`);
    }
    seenSeeds.add(p.seed);
  }
  for (let s = 1; s <= n; s++) {
    if (!seenSeeds.has(s)) {
      throw new RangeError(`Seed sequence must be 1..${n}; missing seed ${s}.`);
    }
  }

  // Compute slot positions via bit-reversal of (seed-1) — Grand Slam standard.
  const bits = Math.log2(n);
  const slots: SeededPlayer[] = new Array(n);
  for (const p of players) {
    const slot = reverseBits(p.seed - 1, bits);
    slots[slot] = p;
  }

  const totalRounds = bits;
  const matches: BracketMatch[] = [];

  // First round: N/2 matches, real player IDs.
  // Pairing: slot[0] vs slot[N-1], slot[1] vs slot[N-2], ... — this is
  // what gives the Grand Slam standard matchups (1 vs N, 2 vs N-1, etc.)
  // after the bit-reversal slot mapping.
  const firstRoundSize = n / 2;
  for (let i = 0; i < firstRoundSize; i++) {
    matches.push({
      bracketPosition: matches.length,
      ronda: labelForRound(0, n),
      jugador1Id: slots[i].jugadorId,
      jugador2Id: slots[n - 1 - i].jugadorId,
    });
  }

  // Subsequent rounds: each match's two slots are placeholders pointing to
  // the two prior-round matches whose winners will fill them.
  let prevRoundStart = 0;
  let prevRoundSize = firstRoundSize;
  for (let r = 1; r < totalRounds; r++) {
    const roundSize = prevRoundSize / 2;
    for (let i = 0; i < roundSize; i++) {
      matches.push({
        bracketPosition: matches.length,
        ronda: labelForRound(r, n),
        jugador1Id: `__winner_${prevRoundStart + i * 2}`,
        jugador2Id: `__winner_${prevRoundStart + i * 2 + 1}`,
      });
    }
    prevRoundStart += prevRoundSize;
    prevRoundSize = roundSize;
  }

  return matches;
}
