import type { PrismaClient } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import {
  createCampeonatoAction,
  deleteCampeonatoAction,
  updateCampeonatoAction,
} from './campeonato';
import {
  getTestPrisma,
  setupCampeonatoCleanup,
  teardownCampeonatoClient,
} from '@/lib/test-utils/test-db';

/**
 * Campeonato CRUD action tests (spec REQ-T-1..5).
 *
 * Tests run against `prisma/test.db` (gitignored). Each test starts with an
 * empty `campeonato` table; the helper `setupCampeonatoCleanup()` registers
 * `beforeEach` to wipe rows and `afterAll` to disconnect the client.
 *
 * The action functions accept a `PrismaClient` parameter (DI). Production
 * code in `app/campeonatos/actions.ts` injects the singleton from `lib/db.ts`;
 * tests inject the test client. This avoids the HMR singleton race and keeps
 * the production code trivially mockable without spy/stub gymnastics.
 */

const VALID_BASE = {
  nombre: 'ATP Santiago Open 2026',
  fechaInicio: new Date('2026-09-01T00:00:00Z'),
  fechaFin: new Date('2026-09-08T00:00:00Z'),
  sede: 'Santiago, Chile',
  categoria: 'ATP 250',
};

function prisma(): PrismaClient {
  return getTestPrisma();
}

describe('lib/actions/campeonato', () => {
  setupCampeonatoCleanup();
  teardownCampeonatoClient();

  describe('createCampeonatoAction', () => {
    it('creates a new Campeonato row with valid input', async () => {
      const result = await createCampeonatoAction(prisma(), VALID_BASE);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeTruthy();
      expect(result.data?.slug).toBe('atp-santiago-open-2026');
      expect(result.data?.estado).toBe('PROGRAMADO');
      expect(result.data?.nombre).toBe(VALID_BASE.nombre);

      // Row actually persisted to the DB
      const row = await prisma().campeonato.findUnique({
        where: { id: result.data!.id },
      });
      expect(row?.nombre).toBe(VALID_BASE.nombre);
      expect(row?.sede).toBe(VALID_BASE.sede);
    });

    it('defaults estado to PROGRAMADO when omitted (OQ-2 default)', async () => {
      const result = await createCampeonatoAction(prisma(), VALID_BASE);
      expect(result.success).toBe(true);
      expect(result.data?.estado).toBe('PROGRAMADO');
    });

    it('returns an error when required fields are missing (REQ-T-1 validation)', async () => {
      const result = await createCampeonatoAction(prisma(), {
        ...VALID_BASE,
        nombre: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.error).toMatch(/nombre|Required/i);

      // Nothing should have been persisted
      const count = await prisma().campeonato.count();
      expect(count).toBe(0);
    });

    it('returns an error when fechaFin is before fechaInicio (T2.a)', async () => {
      const result = await createCampeonatoAction(prisma(), {
        ...VALID_BASE,
        fechaInicio: new Date('2026-09-08T00:00:00Z'),
        fechaFin: new Date('2026-09-01T00:00:00Z'),
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/fechaFin|after|on or after/i);
    });

    it('rejects an invalid estado string (T3.a)', async () => {
      // Cast: the public type guards against it, but the validator must reject it at runtime.
      const result = await createCampeonatoAction(prisma(), {
        ...VALID_BASE,
        estado: 'BANANA',
      });
      expect(result.success).toBe(false);
    });

    it('rejects FINALIZADO without ganadorId', async () => {
      const result = await createCampeonatoAction(prisma(), {
        ...VALID_BASE,
        estado: 'FINALIZADO',
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/ganador/i);
    });

    it('accepts FINALIZADO with a valid ganadorId', async () => {
      const db = prisma();
      const jugador = await db.jugador.create({
        data: { nombre: 'Test', apellido: 'Player', pais: 'CL', ranking: 1 },
      });
      try {
        const result = await createCampeonatoAction(db, {
          ...VALID_BASE,
          estado: 'FINALIZADO',
          ganadorId: jugador.id,
        });
        expect(result.success).toBe(true);
        expect(result.data?.estado).toBe('FINALIZADO');
        expect(result.data?.ganadorId).toBe(jugador.id);
      } finally {
        await db.jugador.delete({ where: { id: jugador.id } });
      }
    });

    it('rejects non-FINALIZADO with ganadorId set', async () => {
      const db = prisma();
      const jugador = await db.jugador.create({
        data: { nombre: 'Test', apellido: 'Player', pais: 'CL', ranking: 1 },
      });
      try {
        const result = await createCampeonatoAction(db, {
          ...VALID_BASE,
          estado: 'PROGRAMADO',
          ganadorId: jugador.id,
        });
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/ganador/i);
      } finally {
        await db.jugador.delete({ where: { id: jugador.id } });
      }
    });
  });

  describe('updateCampeonatoAction', () => {
    it('updates an existing Campeonato', async () => {
      const created = await createCampeonatoAction(prisma(), VALID_BASE);
      expect(created.success).toBe(true);

      const updated = await updateCampeonatoAction(prisma(), {
        id: created.data!.id,
        nombre: 'ATP Santiago Open 2027 (Renombrado)',
        fechaInicio: new Date('2027-09-01T00:00:00Z'),
        fechaFin: new Date('2027-09-08T00:00:00Z'),
        sede: 'Viña del Mar, Chile',
        categoria: 'ATP 500',
        estado: 'EN_CURSO',
      });

      expect(updated.success).toBe(true);
      expect(updated.data?.nombre).toBe('ATP Santiago Open 2027 (Renombrado)');
      expect(updated.data?.slug).toBe('atp-santiago-open-2027-renombrado');
      expect(updated.data?.estado).toBe('EN_CURSO');
      expect(updated.data?.sede).toBe('Viña del Mar, Chile');

      // Re-read from DB to confirm persistence
      const row = await prisma().campeonato.findUnique({
        where: { id: created.data!.id },
      });
      expect(row?.nombre).toBe('ATP Santiago Open 2027 (Renombrado)');
      expect(row?.estado).toBe('EN_CURSO');
    });

    it('returns an error when the target id does not exist', async () => {
      const updated = await updateCampeonatoAction(prisma(), {
        id: 'no-such-id',
        nombre: 'Ghost Tournament',
        fechaInicio: new Date('2026-09-01T00:00:00Z'),
        fechaFin: new Date('2026-09-08T00:00:00Z'),
        sede: 'Nowhere',
        categoria: 'ATP 250',
      });
      expect(updated.success).toBe(false);
    });

    it('allows setting ganadorId when estado=FINALIZADO on update', async () => {
      const db = prisma();
      const created = await createCampeonatoAction(db, VALID_BASE);
      expect(created.success).toBe(true);

      const jugador = await db.jugador.create({
        data: { nombre: 'Winner', apellido: 'Test', pais: 'CL', ranking: 1 },
      });
      try {
        const updated = await updateCampeonatoAction(db, {
          id: created.data!.id,
          ...VALID_BASE,
          estado: 'FINALIZADO',
          ganadorId: jugador.id,
        });
        expect(updated.success).toBe(true);
        expect(updated.data?.estado).toBe('FINALIZADO');
        expect(updated.data?.ganadorId).toBe(jugador.id);
      } finally {
        await db.jugador.delete({ where: { id: jugador.id } });
      }
    });

    it('clears ganadorId when estado changes from FINALIZADO to non-FINALIZADO', async () => {
      const db = prisma();
      const jugador = await db.jugador.create({
        data: { nombre: 'Winner', apellido: 'Test', pais: 'CL', ranking: 1 },
      });
      try {
        const created = await createCampeonatoAction(db, {
          ...VALID_BASE,
          estado: 'FINALIZADO',
          ganadorId: jugador.id,
        });
        expect(created.success).toBe(true);
        expect(created.data?.ganadorId).toBe(jugador.id);

        const updated = await updateCampeonatoAction(db, {
          id: created.data!.id,
          ...VALID_BASE,
          estado: 'EN_CURSO',
        });
        expect(updated.success).toBe(true);
        expect(updated.data?.estado).toBe('EN_CURSO');
        expect(updated.data?.ganadorId).toBeNull();
      } finally {
        await db.jugador.delete({ where: { id: jugador.id } });
      }
    });
  });

  describe('deleteCampeonatoAction', () => {
    it('deletes the targeted Campeonato and removes the row', async () => {
      const created = await createCampeonatoAction(prisma(), VALID_BASE);
      expect(created.success).toBe(true);

      const deleted = await deleteCampeonatoAction(prisma(), created.data!.id);
      expect(deleted.success).toBe(true);

      const row = await prisma().campeonato.findUnique({
        where: { id: created.data!.id },
      });
      expect(row).toBeNull();
    });

    it('returns an error when the target id does not exist', async () => {
      const result = await deleteCampeonatoAction(prisma(), 'no-such-id');
      expect(result.success).toBe(false);
    });
  });
});
