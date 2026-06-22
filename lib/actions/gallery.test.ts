import type { PrismaClient } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { createGalleryItemAction, deleteGalleryItemAction } from './gallery';
import {
  getTestPrisma,
  setupGalleryCleanup,
  teardownGalleryClient,
} from '@/lib/test-utils/test-db';

/**
 * GalleryItem CRUD action tests.
 *
 * Tests run against `prisma/test.db` (gitignored). Each test starts with an
 * empty `galleryItem` table.
 */

function prisma(): PrismaClient {
  return getTestPrisma();
}

describe('lib/actions/gallery', () => {
  setupGalleryCleanup();
  teardownGalleryClient();

  describe('createGalleryItemAction', () => {
    it('creates a new FOTO GalleryItem with valid input', async () => {
      const result = await createGalleryItemAction(prisma(), {
        tipo: 'FOTO',
        url: '/uploads/galeria/photo.webp',
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeTruthy();
      expect(result.data?.tipo).toBe('FOTO');
      expect(result.data?.url).toBe('/uploads/galeria/photo.webp');

      // Row actually persisted to the DB
      const row = await prisma().galleryItem.findUnique({
        where: { id: result.data!.id },
      });
      expect(row?.url).toBe('/uploads/galeria/photo.webp');
    });

    it('creates a new VIDEO GalleryItem with valid input', async () => {
      const result = await createGalleryItemAction(prisma(), {
        tipo: 'VIDEO',
        url: 'https://youtube.com/watch?v=abc123',
        embedUrl: 'https://www.youtube.com/embed/abc123',
        titulo: 'Highlights',
      });

      expect(result.success).toBe(true);
      expect(result.data?.tipo).toBe('VIDEO');
      expect(result.data?.embedUrl).toBe('https://www.youtube.com/embed/abc123');
      expect(result.data?.titulo).toBe('Highlights');
    });

    it('defaults tipo to FOTO when omitted (via schema default)', async () => {
      const result = await createGalleryItemAction(prisma(), {
        url: '/uploads/galeria/photo.webp',
      });

      // Schema requires tipo as discriminator, so this should fail
      expect(result.success).toBe(false);
    });

    it('returns an error on FOTO without url', async () => {
      const result = await createGalleryItemAction(prisma(), {
        tipo: 'FOTO',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();

      // Nothing should have been persisted
      const count = await prisma().galleryItem.count();
      expect(count).toBe(0);
    });

    it('returns an error on VIDEO without embedUrl', async () => {
      const result = await createGalleryItemAction(prisma(), {
        tipo: 'VIDEO',
        url: 'https://youtube.com/watch?v=abc123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('accepts optional titulo and descripcion', async () => {
      const result = await createGalleryItemAction(prisma(), {
        tipo: 'FOTO',
        url: '/uploads/galeria/photo.webp',
        titulo: 'Foto del torneo',
        descripcion: 'Momento destacado',
      });

      expect(result.success).toBe(true);
      expect(result.data?.titulo).toBe('Foto del torneo');
      expect(result.data?.descripcion).toBe('Momento destacado');
    });
  });

  describe('deleteGalleryItemAction', () => {
    it('deletes the targeted GalleryItem and removes the row', async () => {
      const created = await createGalleryItemAction(prisma(), {
        tipo: 'FOTO',
        url: '/uploads/galeria/photo.webp',
      });
      expect(created.success).toBe(true);

      const deleted = await deleteGalleryItemAction(prisma(), created.data!.id);
      expect(deleted.success).toBe(true);

      const row = await prisma().galleryItem.findUnique({
        where: { id: created.data!.id },
      });
      expect(row).toBeNull();
    });

    it('returns an error when the target id does not exist', async () => {
      const result = await deleteGalleryItemAction(prisma(), 'no-such-id');
      expect(result.success).toBe(false);
    });
  });
});
