import { describe, expect, it } from 'vitest';
import { createGalleryItemSchema, type CreateGalleryItemInput } from './gallery';

/**
 * GalleryItem validator tests.
 *
 * Covers:
 *   - Happy path: valid FOTO and VIDEO items parsed
 *   - Required fields: url for FOTO, url + embedUrl for VIDEO
 *   - Optional fields: titulo, descripcion
 *   - tipo must be FOTO or VIDEO
 */

describe('lib/validators/gallery', () => {
  describe('FOTO type', () => {
    const validFoto: CreateGalleryItemInput = {
      tipo: 'FOTO',
      url: '/uploads/galeria/photo.webp',
    };

    it('parses a valid FOTO item with only url', () => {
      const result = createGalleryItemSchema.safeParse(validFoto);
      expect(result.success).toBe(true);
    });

    it('parses a valid FOTO item with all fields', () => {
      const result = createGalleryItemSchema.safeParse({
        ...validFoto,
        titulo: 'Foto del torneo',
        descripcion: 'Momento destacado del partido final',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.titulo).toBe('Foto del torneo');
        expect(result.data.descripcion).toBe('Momento destacado del partido final');
      }
    });

    it('rejects FOTO without url', () => {
      const result = createGalleryItemSchema.safeParse({
        tipo: 'FOTO',
      });
      expect(result.success).toBe(false);
    });

    it('rejects FOTO with empty url', () => {
      const result = createGalleryItemSchema.safeParse({
        tipo: 'FOTO',
        url: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('VIDEO type', () => {
    const validVideo: CreateGalleryItemInput = {
      tipo: 'VIDEO',
      url: 'https://youtube.com/watch?v=abc123',
      embedUrl: 'https://www.youtube.com/embed/abc123',
    };

    it('parses a valid VIDEO item', () => {
      const result = createGalleryItemSchema.safeParse(validVideo);
      expect(result.success).toBe(true);
    });

    it('parses VIDEO with optional fields', () => {
      const result = createGalleryItemSchema.safeParse({
        ...validVideo,
        titulo: 'Highlights del partido',
        descripcion: 'Los mejores momentos de la final',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.titulo).toBe('Highlights del partido');
      }
    });

    it('rejects VIDEO without embedUrl', () => {
      const result = createGalleryItemSchema.safeParse({
        tipo: 'VIDEO',
        url: 'https://youtube.com/watch?v=abc123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects VIDEO with empty embedUrl', () => {
      const result = createGalleryItemSchema.safeParse({
        tipo: 'VIDEO',
        url: 'https://youtube.com/watch?v=abc123',
        embedUrl: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects VIDEO without url', () => {
      const result = createGalleryItemSchema.safeParse({
        tipo: 'VIDEO',
        embedUrl: 'https://www.youtube.com/embed/abc123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('tipo validation', () => {
    it('rejects invalid tipo', () => {
      const result = createGalleryItemSchema.safeParse({
        tipo: 'AUDIO',
        url: '/uploads/galeria/file.mp3',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('max length constraints', () => {
    it('rejects titulo over 200 characters', () => {
      const result = createGalleryItemSchema.safeParse({
        tipo: 'FOTO',
        url: '/uploads/galeria/photo.webp',
        titulo: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it('rejects descripcion over 1000 characters', () => {
      const result = createGalleryItemSchema.safeParse({
        tipo: 'FOTO',
        url: '/uploads/galeria/photo.webp',
        descripcion: 'a'.repeat(1001),
      });
      expect(result.success).toBe(false);
    });
  });
});
