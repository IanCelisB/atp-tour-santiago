import Link from "next/link";
import type { Campeonato } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Campeonatos list page — server component.
 *
 * Fetches all campeonatos from the database and renders them in a responsive
 * grid. Each card links to the campeonato detail page.
 */

const ESTADO_COLORS: Record<string, string> = {
  PROGRAMADO: "bg-blue-400/80 text-black",
  EN_CURSO: "bg-green-400/80 text-black font-semibold ring-1 ring-green-300/70",
  FINALIZADO: "bg-zinc-400/50 text-black",
  CANCELADO: "bg-red-400/70 text-black",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function CampeonatosPage() {
  const [campeonatos, admin] = await Promise.all([
    prisma.campeonato.findMany({
      orderBy: { fechaInicio: "desc" },
    }),
    isAdmin(),
  ]);

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Campeonatos
          </h1>
          {admin && (
            <Link
              href="/campeonatos/nuevo"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              + Nuevo Campeonato
            </Link>
          )}
        </div>

        {campeonatos.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <p className="text-lg text-zinc-400">
              No hay campeonatos registrados.
            </p>
            {admin && (
              <Link
                href="/campeonatos/nuevo"
                className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
              >
                Crear el primero →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campeonatos.map((c: Campeonato) => (
              <Link
                key={c.id}
                href={`/campeonatos/${c.id}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/25">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                      {c.nombre}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_COLORS[c.estado] ?? "bg-zinc-500/20 text-zinc-400"}`}
                    >
                      {c.estado.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">{c.sede}</p>
                  <p className="mt-1 text-sm text-zinc-500">{c.categoria}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{formatDate(c.fechaInicio)}</span>
                    {c.fechaFin && (
                      <>
                        <span>→</span>
                        <span>{formatDate(c.fechaFin)}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors group-hover:text-white">
                    <span>Ver detalle</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/"
            className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
