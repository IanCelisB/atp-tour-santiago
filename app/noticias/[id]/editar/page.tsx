import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import EditarNoticiaForm from "./form";

export const dynamic = "force-dynamic";

/**
 * Edit Noticia page — server component.
 *
 * Fetches the noticia data and passes it to the client form.
 */
export default async function EditarNoticiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const noticia = await prisma.noticia.findUnique({
    where: { id },
  });

  if (!noticia) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href={`/noticias/${id}`}
          className="mb-8 inline-block text-sm font-medium text-purple-500 transition-colors hover:text-purple-400"
        >
          ← Volver al detalle
        </Link>

        <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          Editar Noticia
        </h1>

        <EditarNoticiaForm
          noticia={{
            id: noticia.id,
            titulo: noticia.titulo,
            resumen: noticia.resumen,
            contenido: noticia.contenido,
            imagenUrl: noticia.imagenUrl,
            autor: noticia.autor,
            destacado: noticia.destacado,
          }}
        />
      </div>
    </main>
  );
}
