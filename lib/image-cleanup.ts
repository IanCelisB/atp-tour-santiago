import fs from "node:fs/promises";
import path from "node:path";

/**
 * Image file cleanup utility.
 *
 * Safely deletes uploaded image files from the public/uploads directory.
 * Only deletes files within the allowed upload directories to prevent
 * accidental deletion of other files.
 */

const ALLOWED_UPLOAD_DIRS = ["public/uploads/jugadores"];

/**
 * Delete an uploaded image file given its URL path.
 *
 * @param urlPath - The URL path like "/uploads/jugadores/uuid.webp"
 */
export async function deleteImageFile(urlPath: string): Promise<void> {
  // Convert URL path to filesystem path
  // "/uploads/jugadores/uuid.webp" → "public/uploads/jugadores/uuid.webp"
  const relativePath = urlPath.replace(/^\//, "");
  const fullPath = path.join(relativePath);

  // Security: verify the path is within an allowed upload directory
  const isAllowed = ALLOWED_UPLOAD_DIRS.some((dir) =>
    fullPath.startsWith(dir)
  );

  if (!isAllowed) {
    return; // Silently skip paths outside allowed directories
  }

  try {
    await fs.unlink(fullPath);
  } catch {
    // File may already be deleted or not exist — ignore
  }
}
