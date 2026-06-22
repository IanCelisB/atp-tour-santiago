import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Upload server action tests.
 *
 * Tests the validation logic (MIME type, file size) and the filesystem write.
 * We mock `fs.writeFile` and `fs.mkdir` to avoid touching real disk in tests.
 */

vi.mock("node:fs/promises", () => {
  const mockMkdir = vi.fn().mockResolvedValue(undefined);
  const mockWriteFile = vi.fn().mockResolvedValue(undefined);
  return {
    __esModule: true,
    default: {
      mkdir: mockMkdir,
      writeFile: mockWriteFile,
    },
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
  };
});

// Must import AFTER mock setup
const { uploadImage } = await import("./upload");

describe("lib/actions/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-image files", async () => {
    const formData = new FormData();
    const textFile = new File(["some text"], "document.txt", {
      type: "text/plain",
    });
    formData.append("file", textFile);

    const result = await uploadImage(formData);

    expect(result).toEqual({
      success: false,
      error: "Invalid file type. Only image files are allowed.",
    });
  });

  it("rejects files larger than 10MB", async () => {
    // Create a mock file that reports size > 10MB
    const largeContent = new Uint8Array(10 * 1024 * 1024 + 1); // 10MB + 1 byte
    const largeFile = new File([largeContent], "huge.jpg", {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("file", largeFile);

    const result = await uploadImage(formData);

    expect(result).toEqual({
      success: false,
      error: "File too large. Maximum size is 10MB.",
    });
  });

  it("accepts valid image files under 10MB", async () => {
    const imageContent = new Uint8Array(1024); // 1KB
    const imageFile = new File([imageContent], "photo.jpg", {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("file", imageFile);

    const result = await uploadImage(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.url).toMatch(/^\/uploads\/jugadores\/.+\.webp$/);
    }
  });

  it("creates upload directory if it does not exist", async () => {
    const { mkdir } = await import("node:fs/promises");

    const imageFile = new File([new Uint8Array(100)], "test.png", {
      type: "image/png",
    });

    const formData = new FormData();
    formData.append("file", imageFile);

    await uploadImage(formData);

    expect(mkdir).toHaveBeenCalledWith(
      expect.stringContaining("uploads"),
      { recursive: true }
    );
  });

  it("returns error when no file is provided", async () => {
    const formData = new FormData();
    // No file appended

    const result = await uploadImage(formData);

    expect(result).toEqual({
      success: false,
      error: "No file provided.",
    });
  });
});
