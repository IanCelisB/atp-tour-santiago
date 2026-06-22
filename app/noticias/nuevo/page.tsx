"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createNoticia } from "../actions";
import { compressImage, formatFileSize } from "@/lib/image-compression";
import { uploadImage } from "@/lib/actions/upload";

/**
 * Create new Noticia form — client component.
 *
 * Fields: titulo, resumen, contenido, imagen (file upload with compression),
 * autor, destacado (checkbox).
 */
export default function NuevoNoticiaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
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
        setImagenUrl(result.url);
        setImagenPreview(result.url);
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
    setImagenUrl(null);
    setImagenPreview(null);
    setOriginalSize(null);
    setCompressedSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (imagenUrl) {
      formData.set("imagenUrl", imagenUrl);
    }

    const result = await createNoticia(formData);

    if (result.success) {
      router.push(`/noticias/${result.data.id}`);
    } else {
      setIsSubmitting(false);
      setError(result.error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/noticias"
          className="mb-8 inline-block text-sm font-medium text-purple-500 transition-colors hover:text-purple-400"
        >
          ← Volver a Noticias
        </Link>

        <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          Nueva Noticia
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="titulo"
              className="mb-1 block text-sm text-zinc-400"
            >
              Título *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-purple-500 focus:outline-none"
              placeholder="ATP Santiago Open 2026 - Día de inauguración"
            />
          </div>

          <div>
            <label
              htmlFor="resumen"
              className="mb-1 block text-sm text-zinc-400"
            >
              Resumen *
            </label>
            <textarea
              id="resumen"
              name="resumen"
              required
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-purple-500 focus:outline-none"
              placeholder="Breve resumen de la noticia..."
            />
          </div>

          <div>
            <label
              htmlFor="contenido"
              className="mb-1 block text-sm text-zinc-400"
            >
              Contenido *
            </label>
            <textarea
              id="contenido"
              name="contenido"
              required
              rows={10}
              className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-purple-500 focus:outline-none"
              placeholder="Contenido completo de la noticia (HTML permitido)..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Imagen destacada
            </label>
            <input type="hidden" name="imagenUrl" value={imagenUrl ?? ""} />

            {imagenPreview ? (
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <img
                    src={imagenPreview}
                    alt="Vista previa"
                    className="h-32 w-32 rounded-2xl object-cover"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="autor"
                className="mb-1 block text-sm text-zinc-400"
              >
                Autor
              </label>
              <input
                type="text"
                id="autor"
                name="autor"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-purple-500 focus:outline-none"
                placeholder="Redacción"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="destacado"
                  className="h-4 w-4 rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-zinc-400">Destacado</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
          >
            {isSubmitting ? "Creando..." : "Crear Noticia"}
          </button>
        </form>
      </div>
    </main>
  );
}
