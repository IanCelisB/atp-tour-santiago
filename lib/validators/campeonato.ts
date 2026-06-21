import { z } from 'zod';
import { slugify } from '@/lib/slugify';

/**
 * Campeonato validator (spec REQ-T-1, REQ-T-2, REQ-T-3; OQ-1).
 *
 * Enforces the contract for `prisma/schema.prisma#model.Campeonato`:
 *   - nombre, sede, categoria: non-empty strings
 *   - fechaInicio / fechaFin: required dates; fechaFin >= fechaInicio
 *   - estado: one of PROGRAMADO | EN_CURSO | FINALIZADO | CANCELADO
 *   - slug: auto-derived from `nombre` (OQ-1); client input is ignored
 *
 * Slug auto-derivation is the only `.transform()` in this schema — we
 * re-slug the nombre on every parse so a renamed Campeonato keeps a
 * correct URL.
 */

export const CAMPEONATO_ESTADOS = [
  'PROGRAMADO',
  'EN_CURSO',
  'FINALIZADO',
  'CANCELADO',
] as const;

export const campeonatoEstadoSchema = z.enum(CAMPEONATO_ESTADOS);

const nonEmptyString = (max: number) =>
  z
    .string()
    .min(1, 'Required field cannot be empty')
    .max(max, `Must be ${max} characters or fewer`);

export const createCampeonatoSchema = z
  .object({
    nombre: nonEmptyString(200),
    fechaInicio: z.date({
      error: () => 'fechaInicio is required and must be a valid Date',
    }),
    fechaFin: z.date({
      error: () => 'fechaFin is required and must be a valid Date',
    }),
    sede: nonEmptyString(200),
    categoria: nonEmptyString(100),
    estado: campeonatoEstadoSchema.optional(),
    descripcion: z.string().max(2000).optional(),
  })
  .refine((data) => data.fechaFin.getTime() >= data.fechaInicio.getTime(), {
    message: 'fechaFin must be on or after fechaInicio',
    path: ['fechaFin'],
  })
  .transform((data) => ({
    ...data,
    estado: data.estado ?? 'PROGRAMADO',
    slug: slugify(data.nombre),
  }));

export type CreateCampeonatoInput = z.input<typeof createCampeonatoSchema>;
export type CreateCampeonatoData = z.output<typeof createCampeonatoSchema>;
