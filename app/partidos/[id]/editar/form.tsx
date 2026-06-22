"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePartido } from "../../actions";
import {
  PARTIDO_RONDAS,
  PARTIDO_STATUSES,
} from "@/lib/validators/partido";

interface PartidoData {
  id: string;
  campeonatoId: string;
  jugador1Id: string;
  jugador2Id: string;
  ganadorId: string | null;
  marcador: string | null;
  bracketPosition: number;
  ronda: string;
  status: string;
  fecha: Date | null;
}

interface JugadorOption {
  id: string;
  nombre: string;
  apellido: string;
}

/**
 * Edit Partido form — client component.
 *
 * Pre-filled with existing values. When status is COMPLETED, shows a
 * ganadorId select limited to jugador1/jugador2.
 */
export default function EditarPartidoForm({
  partido,
  jugadores,
}: {
  partido: PartidoData;
  jugadores: JugadorOption[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(partido.status);

  function toDateString(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updatePartido(partido.id, formData);

    if (result.success) {
      router.push(`/partidos/${partido.id}`);
    } else {
      setIsSubmitting(false);
      setError(result.error);
    }
  }

  const jugador1 = jugadores.find((j) => j.id === partido.jugador1Id);
  const jugador2 = jugadores.find((j) => j.id === partido.jugador2Id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

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
            defaultValue={partido.ronda}
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
            defaultValue={partido.bracketPosition}
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
            defaultValue={partido.fecha ? toDateString(partido.fecha) : ""}
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
            defaultValue={partido.status}
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
          defaultValue={partido.marcador ?? ""}
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
            Ganador *
          </label>
          <select
            id="ganadorId"
            name="ganadorId"
            required
            defaultValue={partido.ganadorId ?? ""}
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

      {/* Hidden fields to preserve FK values */}
      <input type="hidden" name="campeonatoId" value={partido.campeonatoId} />
      <input type="hidden" name="jugador1Id" value={partido.jugador1Id} />
      <input type="hidden" name="jugador2Id" value={partido.jugador2Id} />

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
