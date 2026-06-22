import { z } from 'zod';

/**
 * GalleryItem validator.
 *
 * Enforces the contract for `prisma/schema.prisma#model.GalleryItem`:
 *   - tipo: FOTO | VIDEO (app-layer enum)
 *   - For FOTO: url is required (from upload)
 *   - For VIDEO: embedUrl is required (YouTube/Vimeo URL), url stores the same
 *   - titulo: optional string max 200
 *   - descripcion: optional string max 1000
 */

export const GALLERY_TIPOS = ['FOTO', 'VIDEO'] as const;
export const galleryTipoSchema = z.enum(GALLERY_TIPOS);

const galleryFoto = z.object({
  titulo: z.string().max(200).optional(),
  descripcion: z.string().max(1000).optional(),
  tipo: z.literal('FOTO'),
  url: z.string().min(1, 'url is required for photos'),
  embedUrl: z.null().optional(),
});

const galleryVideo = z.object({
  titulo: z.string().max(200).optional(),
  descripcion: z.string().max(1000).optional(),
  tipo: z.literal('VIDEO'),
  url: z.string().min(1, 'url is required'),
  embedUrl: z.string().min(1, 'embedUrl is required for videos'),
});

export const createGalleryItemSchema = z.discriminatedUnion('tipo', [
  galleryFoto,
  galleryVideo,
]);

export type CreateGalleryItemInput = z.input<typeof createGalleryItemSchema>;
export type CreateGalleryItemData = z.output<typeof createGalleryItemSchema>;
