import Link from "next/link";
import type { GalleryItem } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Image, Play } from "lucide-react";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Galería list page — server component.
 *
 * Fetches all gallery items and renders them in a masonry-like grid.
 * Photos shown as images, videos with play button overlay.
 */

export default async function GaleriaPage() {
  const [items, admin] = await Promise.all([
    prisma.galleryItem.findMany({
      orderBy: { createdAt: "desc" },
    }),
    isAdmin(),
  ]);

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Galería
          </h1>
          {admin && (
            <Link
              href="/galeria/nuevo"
              className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
            >
              + Agregar a Galería
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <Image className="h-12 w-12 text-zinc-600" />
            <p className="text-lg text-zinc-400">
              La galería está vacía.
            </p>
            {admin && (
              <Link
                href="/galeria/nuevo"
                className="text-sm font-medium text-purple-500 transition-colors hover:text-purple-400"
              >
                Agregar el primer elemento →
              </Link>
            )}
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {items.map((item: GalleryItem) => (
              <Link
                key={item.id}
                href={`/galeria/${item.id}`}
                className="group mb-4 block break-inside-avoid"
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/25">
                  {item.tipo === "FOTO" ? (
                    <div className="overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.titulo ?? "Foto de galería"}
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-purple-900/20">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.titulo ?? "Video de galería"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Play className="h-16 w-16 text-purple-400/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-transform group-hover:scale-110">
                          <Play className="h-7 w-7 text-white" fill="white" />
                        </div>
                      </div>
                    </div>
                  )}
                  {(item.titulo || item.descripcion) && (
                    <div className="p-4">
                      {item.titulo && (
                        <h3 className="text-sm font-semibold text-white line-clamp-1">
                          {item.titulo}
                        </h3>
                      )}
                      {item.descripcion && (
                        <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                          {item.descripcion}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/"
            className="text-sm font-medium text-purple-500 transition-colors hover:text-purple-400"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
