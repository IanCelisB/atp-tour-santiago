import fs from "node:fs/promises";
import path from "node:path";

/**
 * Image file cleanup utility.
 *
 * Safely deletes uploaded image files from the public/uploads directory.
 * Only deletes files within the allowed upload directories to prevent
 * accidental deletion of other files.
 */

const ALLOWED_UPLOAD_DIRS = ["uploads/jugadores"] as const;

/**
 * Delete an uploaded image file given its URL path.
 *
 * @param urlPath - The URL path like "/uploads/jugadores/uuid.webp"
 */
export async function deleteImageFile(urlPath: string): Promise<void> {
  // Normalize: collapse repeated slashes, drop the leading slash
  const normalized = urlPath.replace(/\/+/g, "/").replace(/^\//, "");

  // Security: verify the path is within an allowed upload directory
  // *after* path normalization (resolves ".."). The resolved path
  // must start with one of the allowed prefixes.
  const resolved = path.posix.normalize(normalized);
  const isAllowed = ALLOWED_UPLOAD_DIRS.some(
    (dir) => resolved === dir || resolved.startsWith(`${dir}/`),
  );

  if (!isAllowed) {
    return; // Silently skip paths outside allowed directories
  }

  try {
    await fs.unlink(resolved);
  } catch {
    // File may already be deleted or not exist — ignore
  }
}
