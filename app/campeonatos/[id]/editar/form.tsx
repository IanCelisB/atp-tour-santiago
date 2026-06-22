"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCampeonato } from "../../actions";
import { CAMPEONATO_ESTADOS } from "@/lib/validators/campeonato";

interface JugadorOption {
  id: string;
  nombre: string;
  apellido: string;
}

interface CampeonatoData {
  id: string;
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date | null;
  sede: string;
  categoria: string;
  estado: string;
  puntosTotales: number;
  ganadorId: string | null;
}

/**
 * Edit Campeonato form — client component.
 *
 * Pre-filled with existing values, same layout as create form.
 */
export default function EditarCampeonatoForm({
  campeonato,
  jugadores,
}: {
  campeonato: CampeonatoData;
  jugadores: JugadorOption[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEstado, setSelectedEstado] = useState(campeonato.estado);

  const showGanador = selectedEstado === "FINALIZADO";

  function toDateString(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateCampeonato(campeonato.id, formData);

    if (result.success) {
      router.push(`/campeonatos/${campeonato.id}`);
    } else {
      setIsSubmitting(false);
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm text-zinc-400">
          Nombre *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          required
          defaultValue={campeonato.nombre}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
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
            defaultValue={toDateString(campeonato.fechaInicio)}
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
            defaultValue={
              campeonato.fechaFin ? toDateString(campeonato.fechaFin) : ""
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="sede" className="mb-1 block text-sm text-zinc-400">
          Sede *
        </label>
        <input
          type="text"
          id="sede"
          name="sede"
          required
          defaultValue={campeonato.sede}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
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
          defaultValue={campeonato.categoria}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
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
          defaultValue={campeonato.puntosTotales}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Se distribuyen entre los 3 primeros: 100% campeón, 60% finalista, 36% cada semifinalista.
        </p>
      </div>

      <div>
        <label htmlFor="estado" className="mb-1 block text-sm text-zinc-400">
          Estado
        </label>
        <select
          id="estado"
          name="estado"
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-colors focus:border-blue-500 focus:outline-none"
        >
          {CAMPEONATO_ESTADOS.map((e) => (
            <option key={e} value={e} className="text-black">
              {e.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {showGanador && (
        <div>
          <label
            htmlFor="ganadorId"
            className="mb-1 block text-sm text-zinc-400"
          >
            Ganador del Campeonato *
          </label>
          <select
            id="ganadorId"
            name="ganadorId"
            defaultValue={campeonato.ganadorId ?? ""}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-colors focus:border-blue-500 focus:outline-none"
          >
            <option value="" className="text-black">
              Seleccionar ganador
            </option>
            {jugadores.map((j) => (
              <option key={j.id} value={j.id} className="text-black">
                {j.nombre} {j.apellido}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}
