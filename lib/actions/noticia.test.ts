import type { PrismaClient } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import {
  createNoticiaAction,
  deleteNoticiaAction,
  updateNoticiaAction,
} from './noticia';
import {
  getTestPrisma,
  setupNoticiaCleanup,
  teardownNoticiaClient,
} from '@/lib/test-utils/test-db';

/**
 * Noticia CRUD action tests.
 *
 * Tests run against `prisma/test.db` (gitignored). Each test starts with an
 * empty `noticia` table.
 */

const VALID_BASE = {
  titulo: 'ATP Santiago Open 2026 - Día de inauguración',
  resumen: 'El torneo arranca con partidos emocionantes en la primera ronda.',
  contenido: '<p>Contenido completo de la noticia aquí.</p>',
};

function prisma(): PrismaClient {
  return getTestPrisma();
}

describe('lib/actions/noticia', () => {
  setupNoticiaCleanup();
  teardownNoticiaClient();

  describe('createNoticiaAction', () => {
    it('creates a new Noticia row with valid input', async () => {
      const result = await createNoticiaAction(prisma(), VALID_BASE);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeTruthy();
      expect(result.data?.slug).toBe('atp-santiago-open-2026-dia-de-inauguracion');
      expect(result.data?.titulo).toBe(VALID_BASE.titulo);
      expect(result.data?.resumen).toBe(VALID_BASE.resumen);
      expect(result.data?.contenido).toBe(VALID_BASE.contenido);

      // Row actually persisted to the DB
      const row = await prisma().noticia.findUnique({
        where: { id: result.data!.id },
      });
      expect(row?.titulo).toBe(VALID_BASE.titulo);
    });

    it('defaults autor to "Redacción" and destacado to false when omitted', async () => {
      const result = await createNoticiaAction(prisma(), VALID_BASE);
      expect(result.success).toBe(true);
      expect(result.data?.autor).toBe('Redacción');
      expect(result.data?.destacado).toBe(false);
    });

    it('accepts explicit autor and destacado values', async () => {
      const result = await createNoticiaAction(prisma(), {
        ...VALID_BASE,
        autor: 'Juan Pérez',
        destacado: true,
      });
      expect(result.success).toBe(true);
      expect(result.data?.autor).toBe('Juan Pérez');
      expect(result.data?.destacado).toBe(true);
    });

    it('returns an error on empty titulo', async () => {
      const result = await createNoticiaAction(prisma(), {
        ...VALID_BASE,
        titulo: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();

      // Nothing should have been persisted
      const count = await prisma().noticia.count();
      expect(count).toBe(0);
    });

    it('returns an error when required fields are missing', async () => {
      const result = await createNoticiaAction(prisma(), {});

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('updateNoticiaAction', () => {
    it('updates an existing Noticia', async () => {
      const created = await createNoticiaAction(prisma(), VALID_BASE);
      expect(created.success).toBe(true);

      const updated = await updateNoticiaAction(prisma(), created.data!.id, {
        titulo: 'ATP Santiago Open 2026 - Actualización',
        resumen: 'Nuevo resumen actualizado.',
        contenido: '<p>Contenido actualizado.</p>',
        autor: 'María García',
        destacado: true,
      });

      expect(updated.success).toBe(true);
      expect(updated.data?.titulo).toBe('ATP Santiago Open 2026 - Actualización');
      expect(updated.data?.slug).toBe('atp-santiago-open-2026-actualizacion');
      expect(updated.data?.autor).toBe('María García');
      expect(updated.data?.destacado).toBe(true);

      // Re-read from DB to confirm persistence
      const row = await prisma().noticia.findUnique({
        where: { id: created.data!.id },
      });
      expect(row?.titulo).toBe('ATP Santiago Open 2026 - Actualización');
    });

    it('returns an error when the target id does not exist', async () => {
      const updated = await updateNoticiaAction(prisma(), 'no-such-id', {
        titulo: 'Ghost Article',
        resumen: 'Ghost resumen',
        contenido: 'Ghost contenido',
      });
      expect(updated.success).toBe(false);
    });
  });

  describe('deleteNoticiaAction', () => {
    it('deletes the targeted Noticia and removes the row', async () => {
      const created = await createNoticiaAction(prisma(), VALID_BASE);
      expect(created.success).toBe(true);

      const deleted = await deleteNoticiaAction(prisma(), created.data!.id);
      expect(deleted.success).toBe(true);

      const row = await prisma().noticia.findUnique({
        where: { id: created.data!.id },
      });
      expect(row).toBeNull();
    });

    it('returns an error when the target id does not exist', async () => {
      const result = await deleteNoticiaAction(prisma(), 'no-such-id');
      expect(result.success).toBe(false);
    });
  });
});
