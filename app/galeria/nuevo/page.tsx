"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createGalleryItem } from "../actions";
import { compressImage, formatFileSize } from "@/lib/image-compression";
import { uploadImage } from "@/lib/actions/upload";
import { Image, Video } from "lucide-react";

/**
 * Create new GalleryItem form — client component.
 *
 * Type selector: Foto / Video.
 * If FOTO: file input with compression, preview.
 * If VIDEO: embed URL input (YouTube/Vimeo).
 */
export default function NuevoGaleriaPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<"FOTO" | "VIDEO">("FOTO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setOriginalSize(formatFileSize(file.size));

    try {
      const compressed = await compressImage(file);
      setCompressedSize(formatFileSize(compressed.size));

      const formData = new FormData();
      formData.append("file", compressed);
      const result = await uploadImage(formData);

      if (result.success) {
        setUrl(result.url);
        setPreview(result.url);
      } else {
        setError(result.error);
        clearImage();
      }
    } catch {
      setError("Error al procesar la imagen");
      clearImage();
    } finally {
      setIsUploading(false);
    }
  }

  function clearImage() {
    setUrl(null);
    setPreview(null);
    setOriginalSize(null);
    setCompressedSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function extractEmbedUrl(youtubeUrl: string): string {
    // Convert YouTube watch URL to embed URL
    const match = youtubeUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/
    );
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    // If it's already an embed URL, return as-is
    if (youtubeUrl.includes("/embed/")) {
      return youtubeUrl;
    }
    // Vimeo
    const vimeoMatch = youtubeUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return youtubeUrl;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    if (tipo === "FOTO" && url) {
      formData.set("url", url);
    } else if (tipo === "VIDEO") {
      const embedUrl = formData.get("embedUrl") as string;
      if (embedUrl) {
        formData.set("url", extractEmbedUrl(embedUrl));
        formData.set("embedUrl", extractEmbedUrl(embedUrl));
      }
    }

    formData.set("tipo", tipo);

    const result = await createGalleryItem(formData);

    if (result.success) {
      router.push(`/galeria/${result.data.id}`);
    } else {
      setIsSubmitting(false);
      setError(result.error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/galeria"
          className="mb-8 inline-block text-sm font-medium text-purple-500 transition-colors hover:text-purple-400"
        >
          ← Volver a Galería
        </Link>

        <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          Agregar a Galería
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Tipo *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setTipo("FOTO");
                  clearImage();
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  tipo === "FOTO"
                    ? "border-purple-500 bg-purple-500/20 text-purple-400"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                }`}
              >
                <Image className="h-4 w-4" />
                Foto
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipo("VIDEO");
                  clearImage();
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  tipo === "VIDEO"
                    ? "border-purple-500 bg-purple-500/20 text-purple-400"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                }`}
              >
                <Video className="h-4 w-4" />
                Video
              </button>
            </div>
          </div>

          <input type="hidden" name="tipo" value={tipo} />
          <input type="hidden" name="url" value={url ?? ""} />

          {tipo === "FOTO" ? (
            /* Photo Upload */
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Imagen *
              </label>
              {preview ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <img
                      src={preview}
                      alt="Vista previa"
                      className="h-40 w-40 rounded-2xl object-cover"
                    />
                    <div className="flex flex-col gap-2">
                      {originalSize && compressedSize && (
                        <p className="text-sm text-zinc-400">
                          {originalSize} → {compressedSize}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={clearImage}
                        className="text-sm font-medium text-red-400 transition-colors hover:text-red-300"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="imagen"
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/5 px-6 py-8 transition-colors hover:border-purple-500/50 hover:bg-white/[0.03]"
                  >
                    <Image className="h-8 w-8 text-zinc-500" />
                    <span className="text-sm text-zinc-400">
                      {isUploading ? "Procesando..." : "Seleccionar imagen"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      JPEG, PNG o WebP — máx. 10 MB
                    </span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Video Embed URL */
            <div>
              <label
                htmlFor="embedUrl"
                className="mb-1 block text-sm text-zinc-400"
              >
                URL del video (YouTube o Vimeo) *
              </label>
              <input
                type="url"
                id="embedUrl"
                name="embedUrl"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-purple-500 focus:outline-none"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="mt-1 text-xs text-zinc-500">
                Se convertirá automáticamente a URL de embed
              </p>
            </div>
          )}

          <div>
            <label htmlFor="titulo" className="mb-1 block text-sm text-zinc-400">
              Título (opcional)
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-purple-500 focus:outline-none"
              placeholder="Título de la galería"
            />
          </div>

          <div>
            <label
              htmlFor="descripcion"
              className="mb-1 block text-sm text-zinc-400"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-purple-500 focus:outline-none"
              placeholder="Descripción del elemento..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (tipo === "FOTO" && !url)}
            className="w-full rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
          >
            {isSubmitting ? "Agregando..." : "Agregar a Galería"}
          </button>
        </form>
      </div>
    </main>
  );
}
