import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Admin guard tests for server action wrappers.
 *
 * We mock the session module and domain actions to isolate the guard logic.
 * Dynamic imports allow mocks to be set up before module loading.
 */

const mockRequireAdmin = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
  getSession: vi.fn().mockResolvedValue({
    userId: undefined,
    email: undefined,
    role: undefined,
    save: vi.fn(),
    destroy: vi.fn(),
  }),
  isAdmin: vi.fn().mockResolvedValue(false),
}));

vi.mock('@/lib/actions/campeonato', () => ({
  createCampeonatoAction: vi.fn().mockResolvedValue({ success: true, data: { id: '1', slug: 'test' } }),
  updateCampeonatoAction: vi.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
  deleteCampeonatoAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/actions/jugador', () => ({
  createJugadorAction: vi.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
  updateJugadorAction: vi.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
  deleteJugadorAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/actions/noticia', () => ({
  createNoticiaAction: vi.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
  updateNoticiaAction: vi.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
  deleteNoticiaAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/actions/partido', () => ({
  createPartidoAction: vi.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
  updatePartidoAction: vi.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
  deletePartidoAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/actions/gallery', () => ({
  createGalleryItemAction: vi.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
  deleteGalleryItemAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/image-cleanup', () => ({
  deleteImageFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAdmin.mockRejectedValue(new Error('Forbidden: admin role required'));
});

describe('Admin guard blocks non-admin', () => {
  it('createCampeonato blocks non-admin', async () => {
    const { createCampeonato } = await import('@/app/campeonatos/actions');
    const fd = new FormData();
    fd.set('nombre', 'Test');
    const result = await createCampeonato(fd);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/forbidden/i);
    }
  });

  it('updateCampeonato blocks non-admin', async () => {
    const { updateCampeonato } = await import('@/app/campeonatos/actions');
    const fd = new FormData();
    fd.set('nombre', 'Test');
    const result = await updateCampeonato('1', fd);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/forbidden/i);
    }
  });

  it('deleteCampeonato blocks non-admin', async () => {
    const { deleteCampeonato } = await import('@/app/campeonatos/actions');
    const result = await deleteCampeonato('1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/forbidden/i);
    }
  });

  it('createJugador blocks non-admin', async () => {
    const { createJugador } = await import('@/app/jugadores/actions');
    const fd = new FormData();
    fd.set('nombre', 'Test');
    const result = await createJugador(fd);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/forbidden/i);
    }
  });

  it('deleteJugador blocks non-admin', async () => {
    const { deleteJugador } = await import('@/app/jugadores/actions');
    const result = await deleteJugador('1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/forbidden/i);
    }
  });

  it('createNoticia blocks non-admin', async () => {
    const { createNoticia } = await import('@/app/noticias/actions');
    const fd = new FormData();
    fd.set('titulo', 'Test');
    const result = await createNoticia(fd);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/forbidden/i);
    }
  });

  it('deleteNoticia blocks non-admin', async () => {
    const { deleteNoticia } = await import('@/app/noticias/actions');
    const result = await deleteNoticia('1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/forbidden/i);
    }
  });

  it('createPartido blocks non-admin', async () => {
    const { createPartido } = await import('@/app/partidos/actions');
    const fd = new FormData();
    fd.set('campeonatoId', 'c1');
    const result = await createPartido(fd);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/forbidden/i);
    }
  });

  it('deletePartido blocks non-admin', async () => {
    const { deletePartido } = await import('@/app/partidos/actions');
    const result = await deletePartido('1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/forbidden/i);
    }
  });

  it('createGalleryItem blocks non-admin', async () => {
    const { createGalleryItem } = await import('@/app/galeria/actions');
    const fd = new FormData();
    fd.set('url', 'http://example.com/photo.jpg');
    const result = await createGalleryItem(fd);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/forbidden/i);
    }
  });

  it('deleteGalleryItem blocks non-admin', async () => {
    const { deleteGalleryItem } = await import('@/app/galeria/actions');
    const result = await deleteGalleryItem('1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/forbidden/i);
    }
  });
});

describe('Admin guard allows admin', () => {
  it('createCampeonato succeeds for admin', async () => {
    mockRequireAdmin.mockResolvedValue({ role: 'admin' });
    const { createCampeonato } = await import('@/app/campeonatos/actions');
    const fd = new FormData();
    fd.set('nombre', 'Test');
    fd.set('sede', 'Santiago');
    fd.set('categoria', 'ATP 250');
    fd.set('fechaInicio', '2026-09-01');
    fd.set('fechaFin', '2026-09-08');
    fd.set('puntosTotales', '250');
    const result = await createCampeonato(fd);
    expect(result.success).toBe(true);
  });
});
