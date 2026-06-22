import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteNoticia } from "../actions";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Noticia detail page — server component.
 *
 * Shows full article with titulo, imagen, contenido, autor, fecha.
 * Includes Edit and Delete buttons.
 */

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function NoticiaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const noticia = await prisma.noticia.findUnique({
    where: { id },
  });

  if (!noticia) {
    notFound();
  }

  async function handleDelete() {
    "use server";
    const result = await deleteNoticia(id);
    if (result.success) {
      redirect("/noticias");
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/noticias"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-purple-500 transition-colors hover:text-purple-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Noticias
        </Link>

        <article>
          {noticia.imagenUrl && (
            <div className="mb-8 overflow-hidden rounded-2xl">
              <img
                src={noticia.imagenUrl}
                alt={noticia.titulo}
                className="w-full object-cover"
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3">
            {noticia.destacado && (
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
                Destacado
              </span>
            )}
            <span className="text-sm text-zinc-500">
              {formatDate(noticia.fechaPublicacion)}
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {noticia.titulo}
          </h1>

          <p className="mb-8 text-lg text-zinc-400">{noticia.resumen}</p>

          <div className="prose prose-invert max-w-none">
            <div
              className="text-zinc-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: noticia.contenido }}
            />
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-sm text-zinc-500">
              Por <span className="text-zinc-300">{noticia.autor}</span>
            </p>
          </div>
        </article>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Link
            href={`/noticias/${id}/editar`}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
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
      </div>
    </main>
  );
}
