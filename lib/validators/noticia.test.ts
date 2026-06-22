import { describe, expect, it } from 'vitest';
import { createNoticiaSchema, type CreateNoticiaInput } from './noticia';

/**
 * Noticia validator tests.
 *
 * Covers:
 *   - Happy path: valid noticia parsed, slug auto-derived
 *   - Required fields: titulo, resumen, contenido
 *   - Defaults: autor defaults to "Redacción", destacado defaults to false
 *   - Max length constraints: titulo (200), resumen (500)
 */

describe('lib/validators/noticia', () => {
  const validNoticia: CreateNoticiaInput = {
    titulo: 'ATP Santiago Open 2026 - Día de inauguración',
    resumen: 'El torneo arranca con partidos emocionantes en la primera ronda.',
    contenido: '<p>Contenido completo de la noticia aquí.</p>',
  };

  describe('happy path', () => {
    it('parses a complete valid Noticia', () => {
      const result = createNoticiaSchema.safeParse(validNoticia);
      expect(result.success).toBe(true);
    });

    it('auto-derives slug from titulo', () => {
      const result = createNoticiaSchema.parse(validNoticia);
      expect(result.slug).toBe('atp-santiago-open-2026-dia-de-inauguracion');
    });

    it('defaults autor to "Redacción" when omitted', () => {
      const result = createNoticiaSchema.parse(validNoticia);
      expect(result.autor).toBe('Redacción');
    });

    it('defaults destacado to false when omitted', () => {
      const result = createNoticiaSchema.parse(validNoticia);
      expect(result.destacado).toBe(false);
    });

    it('accepts explicit autor and destacado values', () => {
      const result = createNoticiaSchema.parse({
        ...validNoticia,
        autor: 'Juan Pérez',
        destacado: true,
      });
      expect(result.autor).toBe('Juan Pérez');
      expect(result.destacado).toBe(true);
    });
  });

  describe('required fields', () => {
    it('rejects missing titulo', () => {
      const { titulo, ...rest } = validNoticia;
      void titulo;
      expect(createNoticiaSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects empty titulo', () => {
      const result = createNoticiaSchema.safeParse({ ...validNoticia, titulo: '' });
      expect(result.success).toBe(false);
    });

    it('rejects missing resumen', () => {
      const { resumen, ...rest } = validNoticia;
      void resumen;
      expect(createNoticiaSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects empty resumen', () => {
      const result = createNoticiaSchema.safeParse({ ...validNoticia, resumen: '' });
      expect(result.success).toBe(false);
    });

    it('rejects missing contenido', () => {
      const { contenido, ...rest } = validNoticia;
      void contenido;
      expect(createNoticiaSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects empty contenido', () => {
      const result = createNoticiaSchema.safeParse({ ...validNoticia, contenido: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('max length constraints', () => {
    it('rejects titulo over 200 characters', () => {
      const result = createNoticiaSchema.safeParse({
        ...validNoticia,
        titulo: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it('accepts titulo at exactly 200 characters', () => {
      const result = createNoticiaSchema.safeParse({
        ...validNoticia,
        titulo: 'a'.repeat(200),
      });
      expect(result.success).toBe(true);
    });

    it('rejects resumen over 500 characters', () => {
      const result = createNoticiaSchema.safeParse({
        ...validNoticia,
        resumen: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('accepts resumen at exactly 500 characters', () => {
      const result = createNoticiaSchema.safeParse({
        ...validNoticia,
        resumen: 'a'.repeat(500),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('accepts empty imagenUrl and strips it', () => {
      const result = createNoticiaSchema.parse({
        ...validNoticia,
        imagenUrl: '',
      });
      expect(result.imagenUrl).toBeUndefined();
    });

    it('accepts valid imagenUrl', () => {
      const result = createNoticiaSchema.parse({
        ...validNoticia,
        imagenUrl: 'https://example.com/photo.jpg',
      });
      expect(result.imagenUrl).toBe('https://example.com/photo.jpg');
    });
  });

  describe('slug is auto-derived, not accepted from input', () => {
    it('ignores any client-supplied slug', () => {
      const result = createNoticiaSchema.parse({
        ...validNoticia,
        slug: 'totally-wrong-slug',
      } as CreateNoticiaInput & { slug: string });
      expect(result.slug).toBe('atp-santiago-open-2026-dia-de-inauguracion');
    });
  });
});
