/**
 * Client-side image compression utility.
 *
 * Uses Canvas API to resize and compress images to WebP format.
 * WebP provides ~60-80% size reduction vs JPEG at equivalent visual quality.
 */

/**
 * Compress an image file using Canvas API.
 *
 * @param file - The image file to compress
 * @param maxDimension - Maximum width or height in pixels (default: 1200)
 * @param quality - WebP quality 0-1 (default: 0.92 — visually lossless)
 * @returns Compressed image as a Blob in WebP format
 */
export async function compressImage(
  file: File,
  maxDimension = 1200,
  quality = 0.92
): Promise<Blob> {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxDimension
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D canvas context");
  }

  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas toBlob returned null"));
        }
      },
      "image/webp",
      quality
    );
  });
}

/**
 * Format a byte count into a human-readable string.
 *
 * @param bytes - Number of bytes
 * @returns Formatted string like "1.2 MB", "500 KB", etc.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  if (i === 0) {
    return `${bytes} B`;
  }

  return `${value.toFixed(1)} ${units[i]}`;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function calculateDimensions(
  naturalWidth: number,
  naturalHeight: number,
  maxDimension: number
): { width: number; height: number } {
  if (naturalWidth <= maxDimension && naturalHeight <= maxDimension) {
    return { width: naturalWidth, height: naturalHeight };
  }

  const ratio = Math.min(maxDimension / naturalWidth, maxDimension / naturalHeight);
  return {
    width: Math.round(naturalWidth * ratio),
    height: Math.round(naturalHeight * ratio),
  };
}
