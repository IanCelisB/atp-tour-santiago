import type { PrismaClient } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import {
  createPartidoAction,
  deletePartidoAction,
  updatePartidoAction,
} from './partido';
import {
  getTestPrisma,
  setupPartidoCleanup,
  teardownPartidoClient,
} from '@/lib/test-utils/test-db';

/**
 * Partido CRUD action tests.
 *
 * Tests run against `prisma/test.db` (gitignored). Each test starts with
 * empty tables; the helper `setupPartidoCleanup()` registers `beforeEach`
 * to wipe rows and `afterAll` to disconnect the client.
 *
 * The action functions accept a `PrismaClient` parameter (DI). Production
 * code in `app/partidos/actions.ts` injects the singleton from `lib/db.ts`;
 * tests inject the test client.
 */

function prisma(): PrismaClient {
  return getTestPrisma();
}

// Seed data: each test creates its own campeonato + jugadores since
// setupPartidoCleanup wipes them every beforeEach.
async function seedPrerequisites() {
  const campeonato = await prisma().campeonato.create({
    data: {
      nombre: 'ATP Santiago Open 2026',
      slug: 'atp-santiago-open-2026',
      fechaInicio: new Date('2026-09-01T00:00:00Z'),
      fechaFin: new Date('2026-09-08T00:00:00Z'),
      sede: 'Santiago, Chile',
      categoria: 'ATP 250',
    },
  });

  const jugador1 = await prisma().jugador.create({
    data: {
      nombre: 'Carlos',
      apellido: 'Alcaraz',
      pais: 'España',
      ranking: 1,
    },
  });

  const jugador2 = await prisma().jugador.create({
    data: {
      nombre: 'Novak',
      apellido: 'Djokovic',
      pais: 'Serbia',
      ranking: 2,
    },
  });

  return { campeonato, jugador1, jugador2 };
}

function validPartidoInput(campeonatoId: string, j1Id: string, j2Id: string) {
  return {
    campeonatoId,
    jugador1Id: j1Id,
    jugador2Id: j2Id,
    bracketPosition: 0,
    ronda: 'F' as const,
  };
}

describe('lib/actions/partido', () => {
  setupPartidoCleanup();
  teardownPartidoClient();

  describe('createPartidoAction', () => {
    it('creates a new Partido row with valid input', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const input = validPartidoInput(campeonato.id, jugador1.id, jugador2.id);

      const result = await createPartidoAction(prisma(), input);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeTruthy();
      expect(result.data?.campeonatoId).toBe(campeonato.id);
      expect(result.data?.jugador1Id).toBe(jugador1.id);
      expect(result.data?.jugador2Id).toBe(jugador2.id);
      expect(result.data?.ronda).toBe('F');
      expect(result.data?.bracketPosition).toBe(0);

      // Row actually persisted to the DB
      const row = await prisma().partido.findUnique({
        where: { id: result.data!.id },
      });
      expect(row?.campeonatoId).toBe(campeonato.id);
    });

    it('defaults status to PROGRAMADO when omitted', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const input = validPartidoInput(campeonato.id, jugador1.id, jugador2.id);

      const result = await createPartidoAction(prisma(), input);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('PROGRAMADO');
    });

    it('creates with explicit status when provided', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const input = {
        ...validPartidoInput(campeonato.id, jugador1.id, jugador2.id),
        status: 'EN_CURSO' as const,
      };

      const result = await createPartidoAction(prisma(), input);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('EN_CURSO');
    });

    it('returns an error when jugador1Id equals jugador2Id (M2.a)', async () => {
      const { campeonato, jugador1 } = await seedPrerequisites();
      const input = validPartidoInput(campeonato.id, jugador1.id, jugador1.id);

      const result = await createPartidoAction(prisma(), input);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/jugador1Id.*jugador2Id|different/i);

      const count = await prisma().partido.count();
      expect(count).toBe(0);
    });

    it('returns an error when required fields are missing', async () => {
      const result = await createPartidoAction(prisma(), {
        campeonatoId: '',
        jugador1Id: '',
        jugador2Id: '',
        bracketPosition: 0,
        ronda: 'F',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();

      const count = await prisma().partido.count();
      expect(count).toBe(0);
    });

    it('returns an error when ronda is invalid', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const result = await createPartidoAction(prisma(), {
        ...validPartidoInput(campeonato.id, jugador1.id, jugador2.id),
        ronda: 'INVALID',
      });

      expect(result.success).toBe(false);
    });

    it('rejects COMPLETED status without ganadorId (M4.a)', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const result = await createPartidoAction(prisma(), {
        ...validPartidoInput(campeonato.id, jugador1.id, jugador2.id),
        status: 'FINALIZADO',
        // no ganadorId
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/ganadorId/i);
    });

    it('rejects ganadorId that is neither jugador1 nor jugador2 (M4.d)', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const result = await createPartidoAction(prisma(), {
        ...validPartidoInput(campeonato.id, jugador1.id, jugador2.id),
        status: 'FINALIZADO',
        ganadorId: 'some-random-id',
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/ganadorId.*jugador/i);
    });

    it('creates COMPLETED match with valid ganadorId', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const result = await createPartidoAction(prisma(), {
        ...validPartidoInput(campeonato.id, jugador1.id, jugador2.id),
        status: 'FINALIZADO',
        ganadorId: jugador1.id,
        marcador: '6-4 6-3',
      });

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('FINALIZADO');
      expect(result.data?.ganadorId).toBe(jugador1.id);
      expect(result.data?.marcador).toBe('6-4 6-3');
    });

    it('rejects ganadorId set on non-COMPLETED status (M4.e)', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const result = await createPartidoAction(prisma(), {
        ...validPartidoInput(campeonato.id, jugador1.id, jugador2.id),
        status: 'PROGRAMADO',
        ganadorId: jugador1.id,
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/ganadorId.*FINALIZADO/i);
    });
  });

  describe('updatePartidoAction', () => {
    it('updates an existing Partido', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const created = await createPartidoAction(
        prisma(),
        validPartidoInput(campeonato.id, jugador1.id, jugador2.id),
      );
      expect(created.success).toBe(true);

      const updated = await updatePartidoAction(prisma(), {
        id: created.data!.id,
        campeonatoId: campeonato.id,
        jugador1Id: jugador1.id,
        jugador2Id: jugador2.id,
        bracketPosition: 1,
        ronda: 'SF',
        status: 'EN_CURSO',
      });

      expect(updated.success).toBe(true);
      expect(updated.data?.bracketPosition).toBe(1);
      expect(updated.data?.ronda).toBe('SF');
      expect(updated.data?.status).toBe('EN_CURSO');

      // Re-read from DB to confirm persistence
      const row = await prisma().partido.findUnique({
        where: { id: created.data!.id },
      });
      expect(row?.ronda).toBe('SF');
      expect(row?.status).toBe('EN_CURSO');
    });

    it('returns an error when the target id does not exist', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const updated = await updatePartidoAction(prisma(), {
        id: 'no-such-id',
        campeonatoId: campeonato.id,
        jugador1Id: jugador1.id,
        jugador2Id: jugador2.id,
        bracketPosition: 0,
        ronda: 'F',
      });
      expect(updated.success).toBe(false);
      expect(updated.error).toMatch(/not found/i);
    });

    it('allows transitioning status to COMPLETED with ganadorId', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const created = await createPartidoAction(
        prisma(),
        validPartidoInput(campeonato.id, jugador1.id, jugador2.id),
      );
      expect(created.success).toBe(true);

      const updated = await updatePartidoAction(prisma(), {
        id: created.data!.id,
        campeonatoId: campeonato.id,
        jugador1Id: jugador1.id,
        jugador2Id: jugador2.id,
        bracketPosition: 0,
        ronda: 'F',
        status: 'FINALIZADO',
        ganadorId: jugador2.id,
        marcador: '7-6 6-4',
      });

      expect(updated.success).toBe(true);
      expect(updated.data?.status).toBe('FINALIZADO');
      expect(updated.data?.ganadorId).toBe(jugador2.id);
      expect(updated.data?.marcador).toBe('7-6 6-4');
    });

    it('clears ganadorId when transitioning FROM COMPLETED to non-COMPLETED', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      // First create a COMPLETED match
      const created = await createPartidoAction(prisma(), {
        ...validPartidoInput(campeonato.id, jugador1.id, jugador2.id),
        status: 'FINALIZADO',
        ganadorId: jugador1.id,
        marcador: '6-3 6-2',
      });
      expect(created.success).toBe(true);

      // Now update to IN_PROGRESS — ganadorId should be cleared
      const updated = await updatePartidoAction(prisma(), {
        id: created.data!.id,
        campeonatoId: campeonato.id,
        jugador1Id: jugador1.id,
        jugador2Id: jugador2.id,
        bracketPosition: 0,
        ronda: 'F',
        status: 'EN_CURSO',
      });

      expect(updated.success).toBe(true);
      expect(updated.data?.status).toBe('EN_CURSO');
      expect(updated.data?.ganadorId).toBeNull();
    });

    it('returns validation error for invalid status', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const created = await createPartidoAction(
        prisma(),
        validPartidoInput(campeonato.id, jugador1.id, jugador2.id),
      );
      expect(created.success).toBe(true);

      const updated = await updatePartidoAction(prisma(), {
        id: created.data!.id,
        campeonatoId: campeonato.id,
        jugador1Id: jugador1.id,
        jugador2Id: jugador2.id,
        bracketPosition: 0,
        ronda: 'F',
        status: 'BANANA',
      });

      expect(updated.success).toBe(false);
    });
  });

  describe('deletePartidoAction', () => {
    it('deletes the targeted Partido and removes the row', async () => {
      const { campeonato, jugador1, jugador2 } = await seedPrerequisites();
      const created = await createPartidoAction(
        prisma(),
        validPartidoInput(campeonato.id, jugador1.id, jugador2.id),
      );
      expect(created.success).toBe(true);

      const deleted = await deletePartidoAction(prisma(), created.data!.id);
      expect(deleted.success).toBe(true);

      const row = await prisma().partido.findUnique({
        where: { id: created.data!.id },
      });
      expect(row).toBeNull();
    });

    it('returns an error when the target id does not exist', async () => {
      const result = await deletePartidoAction(prisma(), 'no-such-id');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not found/i);
    });
  });
});
