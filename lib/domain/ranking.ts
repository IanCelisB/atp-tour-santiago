/**
 * Calculate puntos earned for a given finishing position in a campeonate.
 *
 * Distribution follows ATP-style ratios based on the campeonate's puntosTotales:
 *   - 1st (Champion):         100% of puntosTotales
 *   - 2nd (Finalist):          60% of puntosTotales
 *   - 3rd-4th (Semifinalists): 36% of puntosTotales each
 *
 * Total distributed per campeonate: 2.32x puntosTotales.
 *
 * @param puntosTotales - Total points to distribute (must be >= 0)
 * @param position - 1 | 2 | 3 | 4
 * @returns Puntos earned for that position
 */
export function puntosForPosition(
  puntosTotales: number,
  position: 1 | 2 | 3 | 4,
): number {
  // Defensive: coerce to number, treat null/undefined/NaN as 0
  const total =
    typeof puntosTotales === 'number' && !Number.isNaN(puntosTotales)
      ? Math.max(0, puntosTotales)
      : 0;
  switch (position) {
    case 1:
      return total;
    case 2:
      return Math.round(total * 0.6);
    case 3:
    case 4:
      return Math.round(total * 0.36);
  }
}
