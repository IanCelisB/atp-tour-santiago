"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RadarChart } from "@/components/RadarChart";
import { updateJugador } from "../../actions";

interface JugadorData {
  id: string;
  nombre: string;
  apellido: string;
  pais: string;
  ranking: number | null;
  bio: string | null;
  resistencia: number;
  velocidad: number;
  derecho: number;
  reves: number;
  estatura: number;
  poder: number;
}

/**
 * Edit Jugador form — client component.
 *
 * Pre-filled with existing values, same layout as create form.
 */
export default function EditarJugadorForm({ jugador }: { jugador: JugadorData }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    resistencia: jugador.resistencia,
    velocidad: jugador.velocidad,
    derecho: jugador.derecho,
    reves: jugador.reves,
    estatura: jugador.estatura,
    poder: jugador.poder,
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
    const result = await updateJugador(jugador.id, formData);

    if (result.success) {
      router.push(`/jugadores/${jugador.id}`);
    } else {
      setIsSubmitting(false);
      alert(result.error);
    }
  }

  return (
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
              defaultValue={jugador.nombre}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
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
              defaultValue={jugador.apellido}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
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
              defaultValue={jugador.pais}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
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
              defaultValue={jugador.ranking ?? ""}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
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
              defaultValue={jugador.bio ?? ""}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
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
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
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
  );
}
