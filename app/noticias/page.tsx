import Link from "next/link";
import type { Noticia } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Newspaper } from "lucide-react";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Noticias list page — server component.
 *
 * Fetches all noticias from the database and renders them in a responsive
 * grid. Featured article (destacado) renders as a large card first.
 */

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function NoticiasPage() {
  const [noticias, admin] = await Promise.all([
    prisma.noticia.findMany({
      orderBy: { fechaPublicacion: "desc" },
    }),
    isAdmin(),
  ]);

  const destacada = noticias.find((n) => n.destacado);
  const restantes = noticias.filter((n) => n.id !== destacada?.id);

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Noticias
          </h1>
          {admin && (
            <Link
              href="/noticias/nuevo"
              className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
            >
              + Nueva Noticia
            </Link>
          )}
        </div>

        {noticias.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <Newspaper className="h-12 w-12 text-zinc-600" />
            <p className="text-lg text-zinc-400">
              No hay noticias registradas.
            </p>
            {admin && (
              <Link
                href="/noticias/nuevo"
                className="text-sm font-medium text-purple-500 transition-colors hover:text-purple-400"
              >
                Crear la primera →
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Featured article */}
            {destacada && (
              <Link
                href={`/noticias/${destacada.id}`}
                className="group mb-8 block"
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/25">
                  {destacada.imagenUrl ? (
                    <div className="aspect-[21/9] w-full overflow-hidden">
                      <img
                        src={destacada.imagenUrl}
                        alt={destacada.titulo}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[21/9] w-full items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-900/20">
                      <Newspaper className="h-20 w-20 text-purple-400/40" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
                        Destacado
                      </span>
                      <span className="text-sm text-zinc-500">
                        {formatDate(destacada.fechaPublicacion)}
                      </span>
                    </div>
                    <h2 className="mb-2 text-2xl font-semibold text-white">
                      {destacada.titulo}
                    </h2>
                    <p className="text-zinc-400">{destacada.resumen}</p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Por {destacada.autor}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of remaining articles */}
            {restantes.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {restantes.map((n: Noticia) => (
                  <Link
                    key={n.id}
                    href={`/noticias/${n.id}`}
                    className="group block"
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/25">
                      {n.imagenUrl ? (
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={n.imagenUrl}
                            alt={n.titulo}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-purple-500/10 to-purple-900/10">
                          <Newspaper className="h-10 w-10 text-purple-400/30" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                          <span>{formatDate(n.fechaPublicacion)}</span>
                          <span>·</span>
                          <span>{n.autor}</span>
                        </div>
                        <h3 className="mb-1 text-lg font-semibold text-white line-clamp-2">
                          {n.titulo}
                        </h3>
                        <p className="text-sm text-zinc-400 line-clamp-2">
                          {n.resumen}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors group-hover:text-white">
                          <span>Leer más</span>
                          <span className="transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
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
