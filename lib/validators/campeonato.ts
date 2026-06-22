import { z } from 'zod';
import { slugify } from '@/lib/slugify';

/**
 * Campeonato validator (spec REQ-T-1, REQ-T-2, REQ-T-3; OQ-1).
 *
 * Enforces the contract for `prisma/schema.prisma#model.Campeonato`:
 *   - nombre, sede, categoria: non-empty strings
 *   - fechaInicio / fechaFin: required dates; fechaFin >= fechaInicio
 *   - estado: one of PROGRAMADO | EN_CURSO | FINALIZADO | CANCELADO
 *   - puntosTotales: non-negative integer (total points to distribute)
 *   - slug: auto-derived from `nombre` (OQ-1); client input is ignored
 *
 * Slug auto-derivation is the only `.transform()` in this schema — we
 * re-slug the nombre on every parse so a renamed Campeonato keeps a
 * correct URL.
 */

export const CAMPEONATO_ESTADOS = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'] as const;

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
    puntosTotales: z.number().int().min(0, 'puntosTotales must be >= 0'),
    estado: campeonatoEstadoSchema.optional(),
    ganadorId: z.string().min(1).max(50).nullable().optional(),
    descripcion: z.string().max(2000).optional(),
  })
  .refine((data) => data.fechaFin.getTime() >= data.fechaInicio.getTime(), {
    message: 'fechaFin must be on or after fechaInicio',
    path: ['fechaFin'],
  })
  .superRefine((data, ctx) => {
    const estado = data.estado ?? 'PROGRAMADO';
    if (estado === 'FINALIZADO') {
      if (!data.ganadorId || data.ganadorId.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ganadorId is required when estado is FINALIZADO',
          path: ['ganadorId'],
        });
      }
    } else {
      if (data.ganadorId != null && data.ganadorId !== '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ganadorId must be null when estado is not FINALIZADO',
          path: ['ganadorId'],
        });
      }
    }
  })
  .transform((data) => ({
    ...data,
    estado: data.estado ?? 'PROGRAMADO',
    slug: slugify(data.nombre),
    ganadorId: data.ganadorId ?? null,
  }));

export type CreateCampeonatoInput = z.input<typeof createCampeonatoSchema>;
export type CreateCampeonatoData = z.output<typeof createCampeonatoSchema>;
