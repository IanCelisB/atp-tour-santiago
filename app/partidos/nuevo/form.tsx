"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPartido } from "../actions";
import {
  PARTIDO_RONDAS,
  PARTIDO_STATUSES,
} from "@/lib/validators/partido";

/**
 * Create new Partido form — client component.
 */

interface CampeonatoOption {
  id: string;
  nombre: string;
}

interface JugadorOption {
  id: string;
  nombre: string;
  apellido: string;
}

export default function NuevoPartidoForm({
  campeonatos,
  jugadores,
}: {
  campeonatos: CampeonatoOption[];
  jugadores: JugadorOption[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("PROGRAMADO");
  const [jugador1Id, setJugador1Id] = useState<string>("");
  const [jugador2Id, setJugador2Id] = useState<string>("");

  const jugador1 = jugadores.find((j) => j.id === jugador1Id);
  const jugador2 = jugadores.find((j) => j.id === jugador2Id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createPartido(formData);

    if (result.success) {
      router.push(`/partidos/${result.data.id}`);
    } else {
      setIsSubmitting(false);
      setError(result.error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/partidos"
          className="mb-8 inline-block text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          ← Volver a Partidos
        </Link>

        <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          Nuevo Partido
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="campeonatoId"
              className="mb-1 block text-sm text-zinc-400"
            >
              Campeonato *
            </label>
            <select
              id="campeonatoId"
              name="campeonatoId"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-colors focus:border-blue-500 focus:outline-none"
            >
              <option value="" className="text-black">
                Seleccionar campeonato
              </option>
              {campeonatos.map((c) => (
                <option key={c.id} value={c.id} className="text-black">
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="jugador1Id"
                className="mb-1 block text-sm text-zinc-400"
              >
                Jugador 1 *
              </label>
              <select
                id="jugador1Id"
                name="jugador1Id"
                required
                value={jugador1Id}
                onChange={(e) => setJugador1Id(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-colors focus:border-blue-500 focus:outline-none"
              >
                <option value="" className="text-black">
                  Seleccionar jugador
                </option>
                {jugadores.map((j) => (
                  <option key={j.id} value={j.id} className="text-black">
                    {j.nombre} {j.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="jugador2Id"
                className="mb-1 block text-sm text-zinc-400"
              >
                Jugador 2 *
              </label>
              <select
                id="jugador2Id"
                name="jugador2Id"
                required
                value={jugador2Id}
                onChange={(e) => setJugador2Id(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-colors focus:border-blue-500 focus:outline-none"
              >
                <option value="" className="text-black">
                  Seleccionar jugador
                </option>
                {jugadores.map((j) => (
                  <option key={j.id} value={j.id} className="text-black">
                    {j.nombre} {j.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="ronda"
                className="mb-1 block text-sm text-zinc-400"
              >
                Ronda *
              </label>
              <select
                id="ronda"
                name="ronda"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-colors focus:border-blue-500 focus:outline-none"
              >
                {PARTIDO_RONDAS.map((r) => (
                  <option key={r} value={r} className="text-black">
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="bracketPosition"
                className="mb-1 block text-sm text-zinc-400"
              >
                Posición en bracket *
              </label>
              <input
                type="number"
                id="bracketPosition"
                name="bracketPosition"
                required
                min="0"
                defaultValue="0"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fecha"
                className="mb-1 block text-sm text-zinc-400"
              >
                Fecha
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-sm text-zinc-400"
              >
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-colors focus:border-blue-500 focus:outline-none"
              >
                {PARTIDO_STATUSES.map((s) => (
                  <option key={s} value={s} className="text-black">
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="marcador"
              className="mb-1 block text-sm text-zinc-400"
            >
              Marcador
            </label>
            <input
              type="text"
              id="marcador"
              name="marcador"
              placeholder="6-4 6-3 7-5"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
            />
          </div>

          {status === "FINALIZADO" && (
            <div>
              <label
                htmlFor="ganadorId"
                className="mb-1 block text-sm text-zinc-400"
              >
                Asigna Jugador Ganador *
              </label>
              <select
                id="ganadorId"
                name="ganadorId"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-colors focus:border-blue-500 focus:outline-none"
              >
                <option value="" className="text-black">
                  Seleccionar ganador
                </option>
                {jugador1 && (
                  <option value={jugador1.id} className="text-black">
                    {jugador1.nombre} {jugador1.apellido}
                  </option>
                )}
                {jugador2 && (
                  <option value={jugador2.id} className="text-black">
                    {jugador2.nombre} {jugador2.apellido}
                  </option>
                )}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Creando..." : "Crear Partido"}
          </button>
        </form>
      </div>
    </main>
  );
}
