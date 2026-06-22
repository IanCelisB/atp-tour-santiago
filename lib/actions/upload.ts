"use server";

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Server Action to save an uploaded image file.
 *
 * Validates MIME type and file size, generates a UUID filename,
 * saves to public/uploads/jugadores/, and returns the URL path.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const UPLOAD_DIR = path.join("public", "uploads", "jugadores");

type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return { success: false, error: "No file provided." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Only image files are allowed.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "File too large. Maximum size is 10MB.",
    };
  }

  const filename = `${crypto.randomUUID()}.webp`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return { success: true, url: `/uploads/jugadores/${filename}` };
}
