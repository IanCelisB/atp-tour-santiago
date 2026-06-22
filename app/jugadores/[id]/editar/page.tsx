import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import EditarJugadorForm from "./form";

export const dynamic = "force-dynamic";

/**
 * Edit Jugador page — server component.
 *
 * Fetches the jugador data and passes it to the client form.
 */
export default async function EditarJugadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const jugador = await prisma.jugador.findUnique({
    where: { id },
  });

  if (!jugador) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href={`/jugadores/${id}`}
          className="mb-8 inline-block text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          ← Volver al perfil
        </Link>

        <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          Editar Jugador
        </h1>

        <EditarJugadorForm
          jugador={{
            id: jugador.id,
            nombre: jugador.nombre,
            apellido: jugador.apellido,
            pais: jugador.pais,
            ranking: jugador.ranking,
            bio: jugador.bio,
            fotoUrl: jugador.fotoUrl,
            resistencia: jugador.resistencia,
            velocidad: jugador.velocidad,
            derecho: jugador.derecho,
            reves: jugador.reves,
            estatura: jugador.estatura,
            poder: jugador.poder,
          }}
        />
      </div>
    </main>
  );
}
