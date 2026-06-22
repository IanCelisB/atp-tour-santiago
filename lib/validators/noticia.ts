import { z } from 'zod';
import { slugify } from '@/lib/slugify';

/**
 * Noticia validator.
 *
 * Enforces the contract for `prisma/schema.prisma#model.Noticia`:
 *   - titulo: non-empty string, max 200
 *   - resumen: non-empty string, max 500
 *   - contenido: non-empty string
 *   - imagenUrl: optional string
 *   - autor: optional, defaults "Redacción"
 *   - destacado: optional boolean, defaults false
 *   - slug: auto-derived from titulo via slugify (input slug is ignored)
 */

const nonEmptyString = (max: number) =>
  z
    .string()
    .min(1, 'Required field cannot be empty')
    .max(max, `Must be ${max} characters or fewer`);

export const createNoticiaSchema = z
  .object({
    titulo: nonEmptyString(200),
    resumen: nonEmptyString(500),
    contenido: z.string().min(1, 'contenido is required'),
    imagenUrl: z.string().url().optional().or(z.literal('')).optional(),
    autor: z.string().optional(),
    destacado: z.boolean().optional(),
  })
  .transform((data) => ({
    ...data,
    autor: data.autor || 'Redacción',
    destacado: data.destacado ?? false,
    imagenUrl: data.imagenUrl || undefined,
    slug: slugify(data.titulo),
  }));

export type CreateNoticiaInput = z.input<typeof createNoticiaSchema>;
export type CreateNoticiaData = z.output<typeof createNoticiaSchema>;
