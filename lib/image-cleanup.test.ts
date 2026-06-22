import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for deleteImageFile — security-sensitive path-traversal guard.
 *
 * We mock node:fs/promises so tests run in-memory (no real disk writes)
 * and we can verify the path-allowlist behavior.
 */

const mockUnlink = vi.fn();

vi.mock('node:fs/promises', () => ({
  default: {
    unlink: (...args: unknown[]) => mockUnlink(...args),
  },
}));

beforeEach(() => {
  vi.resetModules();
  mockUnlink.mockReset();
  mockUnlink.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('lib/image-cleanup — deleteImageFile', () => {
  it('deletes a file inside an allowed upload directory', async () => {
    const { deleteImageFile } = await import('./image-cleanup');
    await deleteImageFile('/uploads/jugadores/photo.webp');
    expect(mockUnlink).toHaveBeenCalledTimes(1);
    expect(mockUnlink).toHaveBeenCalledWith(expect.stringContaining('uploads/jugadores/photo.webp'));
  });

  it('does NOT unlink files outside the allowed directories', async () => {
    const { deleteImageFile } = await import('./image-cleanup');
    await deleteImageFile('/etc/passwd');
    await deleteImageFile('/uploads/other-dir/photo.webp');
    expect(mockUnlink).not.toHaveBeenCalled();
  });

  it('swallows ENOENT errors silently (file already deleted)', async () => {
    const { deleteImageFile } = await import('./image-cleanup');
    mockUnlink.mockRejectedValueOnce(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    await expect(deleteImageFile('/uploads/jugadores/missing.webp')).resolves.toBeUndefined();
  });

  it('rejects path-traversal attempts (../) silently', async () => {
    const { deleteImageFile } = await import('./image-cleanup');
    await deleteImageFile('/uploads/jugadores/../../etc/passwd');
    expect(mockUnlink).not.toHaveBeenCalled();
  });
});
