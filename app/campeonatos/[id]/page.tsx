import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteCampeonato } from "../actions";
import { CampeonatoBracket } from "@/components/CampeonatoBracket";

export const dynamic = "force-dynamic";

/**
 * Campeonato detail page — server component.
 *
 * Shows all campeonato fields with Edit and Delete buttons.
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
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function CampeonatoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const campeonato = await prisma.campeonato.findUnique({
    where: { id },
    include: { ganador: { select: { nombre: true, apellido: true } } },
  });

  if (!campeonato) {
    notFound();
  }

  async function handleDelete() {
    "use server";
    const result = await deleteCampeonato(id);
    if (result.success) {
      redirect("/campeonatos");
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/campeonatos"
          className="mb-8 inline-block text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          ← Volver a Campeonatos
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {campeonato.nombre}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${ESTADO_COLORS[campeonato.estado] ?? "bg-zinc-500/20 text-zinc-400"}`}
            >
              {campeonato.estado.replace("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">/{campeonato.slug}</p>
        </div>

        {campeonato.ganador && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <span className="text-2xl">🏆</span>
            <span className="text-lg font-semibold text-amber-300">
              {campeonato.ganador.nombre} {campeonato.ganador.apellido}
            </span>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Información
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-zinc-400">Sede</dt>
                  <dd className="text-white">{campeonato.sede}</dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-400">Categoría</dt>
                  <dd className="text-white">{campeonato.categoria}</dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-400">Puntos a repartir</dt>
                  <dd className="font-mono text-white">{campeonato.puntosTotales}</dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-400">Fecha de inicio</dt>
                  <dd className="text-white">
                    {formatDate(campeonato.fechaInicio)}
                  </dd>
                </div>
                {campeonato.fechaFin && (
                  <div>
                    <dt className="text-sm text-zinc-400">Fecha de fin</dt>
                    <dd className="text-white">
                      {formatDate(campeonato.fechaFin)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link
                href={`/campeonatos/${id}/editar`}
                className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                Editar
              </Link>
              <form action={handleDelete}>
                <button
                  type="submit"
                  className="rounded-xl bg-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
                >
                  Eliminar
                </button>
              </form>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Metadatos
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-zinc-400">ID</dt>
                <dd className="font-mono text-xs text-zinc-300">
                  {campeonato.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-400">Creado</dt>
                <dd className="text-white">
                  {formatDate(campeonato.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-400">Actualizado</dt>
                <dd className="text-white">
                  {formatDate(campeonato.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <CampeonatoBracket campeonatoId={id} estado={campeonato.estado} />

        <div className="mt-10">
          <Link
            href="/campeonatos"
            className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
          >
            ← Volver a Campeonatos
          </Link>
        </div>
      </div>
    </main>
  );
}
