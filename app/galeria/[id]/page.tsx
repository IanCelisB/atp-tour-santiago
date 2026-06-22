import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteGalleryItem } from "../actions";
import { ArrowLeft, Trash2 } from "lucide-react";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Gallery item detail page — server component.
 *
 * If FOTO: full-size image.
 * If VIDEO: embedded player.
 * Shows titulo, descripcion, and delete button.
 */

export default async function GaleriaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await prisma.galleryItem.findUnique({
    where: { id },
  });

  if (!item) {
    notFound();
  }

  const admin = await isAdmin();

  async function handleDelete() {
    "use server";
    const result = await deleteGalleryItem(id);
    if (result.success) {
      redirect("/galeria");
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/galeria"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-purple-500 transition-colors hover:text-purple-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Galería
        </Link>

        {item.tipo === "FOTO" ? (
          <div className="mb-8 overflow-hidden rounded-2xl">
            <img
              src={item.url}
              alt={item.titulo ?? "Foto de galería"}
              className="w-full object-contain"
            />
          </div>
        ) : (
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-2xl">
            <iframe
              src={item.embedUrl ?? item.url}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={item.titulo ?? "Video de galería"}
            />
          </div>
        )}

        {(item.titulo || item.descripcion) && (
          <div className="mb-8">
            {item.titulo && (
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {item.titulo}
              </h1>
            )}
            {item.descripcion && (
              <p className="text-lg text-zinc-400">{item.descripcion}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span className="rounded-full bg-white/10 px-3 py-1">
            {item.tipo === "FOTO" ? "Foto" : "Video"}
          </span>
          <span>
            Agregado{" "}
            {new Intl.DateTimeFormat("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(item.createdAt)}
          </span>
        </div>

        {admin && (
          <div className="mt-8">
            <form action={handleDelete}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
