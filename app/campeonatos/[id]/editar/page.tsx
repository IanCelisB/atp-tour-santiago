import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import EditarCampeonatoForm from "./form";

export const dynamic = "force-dynamic";

/**
 * Edit Campeonato page — server component.
 *
 * Fetches the campeonato data and passes it to the client form.
 */
export default async function EditarCampeonatoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const campeonato = await prisma.campeonato.findUnique({
    where: { id },
  });

  if (!campeonato) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href={`/campeonatos/${id}`}
          className="mb-8 inline-block text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          ← Volver al detalle
        </Link>

        <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          Editar Campeonato
        </h1>

        <EditarCampeonatoForm
          campeonato={{
            id: campeonato.id,
            nombre: campeonato.nombre,
            fechaInicio: campeonato.fechaInicio,
            fechaFin: campeonato.fechaFin,
            sede: campeonato.sede,
            categoria: campeonato.categoria,
            estado: campeonato.estado,
          }}
        />
      </div>
    </main>
  );
}
