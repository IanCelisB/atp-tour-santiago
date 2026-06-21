"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RadarChart } from "@/components/RadarChart";
import { createJugador } from "../actions";

/**
 * Create new Jugador form — client component.
 *
 * Features live-preview radar chart that updates as stat sliders move.
 */
export default function NuevoJugadorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    resistencia: 50,
    velocidad: 50,
    derecho: 50,
    reves: 50,
    estatura: 170,
    poder: 50,
  });

  const radarStats = [
    { label: "RES", value: stats.resistencia },
    { label: "VEL", value: stats.velocidad },
    { label: "DER", value: stats.derecho },
    { label: "REV", value: stats.reves },
    { label: "EST", value: Math.round(((stats.estatura - 100) / 150) * 100) },
    { label: "POW", value: stats.poder },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createJugador(formData);

    if (result.success) {
      router.push(`/jugadores/${result.data.id}`);
    } else {
      setIsSubmitting(false);
      alert(result.error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/jugadores"
          className="mb-8 inline-block text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          ← Volver a Jugadores
        </Link>

        <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          Nuevo Jugador
        </h1>

        <div className="grid gap-10 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Información básica</h2>

              <div>
                <label htmlFor="nombre" className="mb-1 block text-sm text-zinc-400">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
                  placeholder="Nicolás"
                />
              </div>

              <div>
                <label htmlFor="apellido" className="mb-1 block text-sm text-zinc-400">
                  Apellido *
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
                  placeholder="Jarry"
                />
              </div>

              <div>
                <label htmlFor="pais" className="mb-1 block text-sm text-zinc-400">
                  País *
                </label>
                <input
                  type="text"
                  id="pais"
                  name="pais"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
                  placeholder="CL"
                />
              </div>

              <div>
                <label htmlFor="ranking" className="mb-1 block text-sm text-zinc-400">
                  Ranking (opcional)
                </label>
                <input
                  type="number"
                  id="ranking"
                  name="ranking"
                  min="1"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
                  placeholder="42"
                />
              </div>

              <div>
                <label htmlFor="bio" className="mb-1 block text-sm text-zinc-400">
                  Biografía (opcional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
                  placeholder="Jugador profesional de tenis..."
                />
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Estadísticas</h2>

              {[
                { key: "resistencia", label: "Resistencia", min: 0, max: 100 },
                { key: "velocidad", label: "Velocidad", min: 0, max: 100 },
                { key: "derecho", label: "Derecho", min: 0, max: 100 },
                { key: "reves", label: "Revés", min: 0, max: 100 },
                { key: "poder", label: "Poder", min: 0, max: 100 },
              ].map(({ key, label, min, max }) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <label htmlFor={key} className="text-zinc-400">
                      {label}
                    </label>
                    <span className="font-medium text-white">
                      {stats[key as keyof typeof stats]}
                    </span>
                  </div>
                  <input
                    type="range"
                    id={key}
                    name={key}
                    min={min}
                    max={max}
                    value={stats[key as keyof typeof stats]}
                    onChange={(e) =>
                      setStats((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
              ))}

              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <label htmlFor="estatura" className="text-zinc-400">
                    Estatura (cm)
                  </label>
                  <span className="font-medium text-white">{stats.estatura} cm</span>
                </div>
                <input
                  type="range"
                  id="estatura"
                  name="estatura"
                  min={100}
                  max={250}
                  value={stats.estatura}
                  onChange={(e) =>
                    setStats((prev) => ({
                      ...prev,
                      estatura: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creando..." : "Crear Jugador"}
            </button>
          </form>

          {/* Live Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <RadarChart stats={radarStats} size={300} color="#3b82f6" />
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Vista previa del radar de habilidades
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
