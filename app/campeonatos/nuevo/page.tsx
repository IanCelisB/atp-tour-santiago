"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCampeonato } from "../actions";
import { CAMPEONATO_ESTADOS } from "@/lib/validators/campeonato";

/**
 * Create new Campeonato form — client component.
 */
export default function NuevoCampeonatoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createCampeonato(formData);

    if (result.success) {
      router.push(`/campeonatos/${result.data.id}`);
    } else {
      setIsSubmitting(false);
      setError(result.error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/campeonatos"
          className="mb-8 inline-block text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          ← Volver a Campeonatos
        </Link>

        <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          Nuevo Campeonato
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="nombre"
              className="mb-1 block text-sm text-zinc-400"
            >
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
              placeholder="ATP Santiago Open 2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fechaInicio"
                className="mb-1 block text-sm text-zinc-400"
              >
                Fecha de inicio *
              </label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="fechaFin"
                className="mb-1 block text-sm text-zinc-400"
              >
                Fecha de fin *
              </label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="sede"
              className="mb-1 block text-sm text-zinc-400"
            >
              Sede *
            </label>
            <input
              type="text"
              id="sede"
              name="sede"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
              placeholder="Santiago, Chile"
            />
          </div>

          <div>
            <label
              htmlFor="categoria"
              className="mb-1 block text-sm text-zinc-400"
            >
              Categoría *
            </label>
            <input
              type="text"
              id="categoria"
              name="categoria"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
              placeholder="ATP 250"
            />
          </div>

          <div>
            <label
              htmlFor="puntosTotales"
              className="mb-1 block text-sm text-zinc-400"
            >
              Puntos Totales a Repartir *
            </label>
            <input
              type="number"
              id="puntosTotales"
              name="puntosTotales"
              required
              min="0"
              defaultValue="250"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Se distribuyen entre los 3 primeros: 100% campeón, 60% finalista, 36% cada semifinalista.
            </p>
          </div>

          <div>
            <label
              htmlFor="estado"
              className="mb-1 block text-sm text-zinc-400"
            >
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-colors focus:border-blue-500 focus:outline-none"
            >
              {CAMPEONATO_ESTADOS.map((e) => (
                <option key={e} value={e} className="text-black">
                  {e.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Creando..." : "Crear Campeonato"}
          </button>
        </form>
      </div>
    </main>
  );
}
