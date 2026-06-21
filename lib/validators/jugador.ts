import { z } from 'zod';
import { slugify } from '@/lib/slugify';

/**
 * Jugador validator (spec REQ-P-1, REQ-P-2; OQ-2).
 *
 * Enforces the contract for `prisma/schema.prisma#model.Jugador`:
 *   - nombre, apellido, pais: non-empty strings
 *   - pais: free-form String this iter (OQ-2 settled on NO ISO check)
 *   - ranking: optional positive integer (>0) when set, null means unranked
 *   - bio: optional free-form string
 *   - slug: auto-derived from "nombre apellido" (OQ-1)
 */

const nonEmptyString = (max: number) =>
  z
    .string()
    .min(1, 'Required field cannot be empty')
    .max(max, `Must be ${max} characters or fewer`);

export const createJugadorSchema = z
  .object({
    nombre: nonEmptyString(100),
    apellido: nonEmptyString(100),
    pais: nonEmptyString(100),
    ranking: z
      .number()
      .int('Ranking must be an integer')
      .positive('Ranking must be greater than 0')
      .nullable()
      .optional(),
    bio: z.string().max(2000).optional(),
    fotoUrl: z.string().max(500).optional(),
  })
  .transform((data) => ({
    ...data,
    slug: slugify(`${data.nombre} ${data.apellido}`),
  }));

export type CreateJugadorInput = z.input<typeof createJugadorSchema>;
export type CreateJugadorData = z.output<typeof createJugadorSchema>;
