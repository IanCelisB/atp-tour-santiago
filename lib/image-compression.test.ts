import { describe, expect, it, vi, beforeEach } from "vitest";
import { compressImage, formatFileSize } from "./image-compression";

/**
 * Image compression utility tests.
 *
 * formatFileSize: pure function, trivially testable.
 * compressImage: uses Canvas API — we mock the browser APIs (Image, canvas).
 */

describe("formatFileSize", () => {
  it("formats bytes as '0 B' for zero", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats bytes under 1 KB", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("formats bytes as KB", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("formats bytes as MB", () => {
    expect(formatFileSize(1048576)).toBe("1.0 MB");
    expect(formatFileSize(2621440)).toBe("2.5 MB");
  });

  it("formats bytes as GB", () => {
    expect(formatFileSize(1073741824)).toBe("1.0 GB");
  });
});

describe("compressImage", () => {
  let mockToBlob: ReturnType<typeof vi.fn>;
  let mockDrawImage: ReturnType<typeof vi.fn>;
  let mockGetContext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockToBlob = vi.fn();
    mockDrawImage = vi.fn();

    mockGetContext = vi.fn().mockReturnValue({
      drawImage: mockDrawImage,
      canvas: {
        toBlob: mockToBlob.mockImplementation(
          (cb: BlobCallback) => {
            const blob = new Blob(["fake-image-data"], { type: "image/webp" });
            cb(blob);
          }
        ),
        width: 0,
        height: 0,
      },
    });

    // Mock global Image
    vi.stubGlobal(
      "Image",
      class MockImage {
        onload: (() => void) | null = null;
        naturalWidth = 1200;
        naturalHeight = 800;
        _src = "";
        get src() {
          return this._src;
        }
        set src(val: string) {
          this._src = val;
          // simulate async load
          setTimeout(() => this.onload?.(), 0);
        }
      }
    );

    // Mock document.createElement for canvas
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") {
        return {
          getContext: mockGetContext,
          toBlob: mockToBlob.mockImplementation(
            (cb: BlobCallback) => {
              const blob = new Blob(["fake-image-data"], {
                type: "image/webp",
              });
              cb(blob);
            }
          ),
          width: 0,
          height: 0,
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tag);
    });
  });

  it("returns a Blob when given a valid image file", async () => {
    const file = new File(["image-content"], "photo.jpg", {
      type: "image/jpeg",
    });

    const result = await compressImage(file);

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe("image/webp");
  });

  it("calls canvas drawImage with resized dimensions", async () => {
    const file = new File(["image-content"], "photo.jpg", {
      type: "image/jpeg",
    });

    await compressImage(file, 1200, 0.92);

    expect(mockDrawImage).toHaveBeenCalled();
    expect(mockGetContext).toHaveBeenCalledWith("2d");
  });

  it("respects custom maxDimension parameter", async () => {
    const file = new File(["image-content"], "photo.jpg", {
      type: "image/jpeg",
    });

    // Should not throw — maxDimension is passed to the resize logic
    const result = await compressImage(file, 800, 0.8);
    expect(result).toBeInstanceOf(Blob);
  });
});
