import slugifyLib from 'slugify';

/**
 * URL-safe slug derived from a human-readable name (spec REQ-T-1, REQ-P-1,
 * OQ-1). Used by validators to auto-derive `slug` from `nombre` /
 * `fullName` so callers cannot supply inconsistent values.
 *
 * Wraps the `slugify` package with our defaults:
 *   - lowercase
 *   - strict: strips characters that don't match `[a-z0-9-]`
 *   - replacement '-': single hyphen between word boundaries
 *   - trim: strips leading/trailing hyphens
 *
 * Returns `''` for empty / whitespace-only input.
 */
export function slugify(input: string): string {
  if (input.trim() === '') return '';
  return slugifyLib(input, {
    lower: true,
    strict: true,
    replacement: '-',
    trim: true,
  });
}
