import Link from "next/link";

/**
 * Placeholder route for the Partidos (Partido Status) section.
 *
 * Created as part of the homepage navigation feature so each menu card
 * resolves to a real (not 404) page. The full feature implementation
 * (timeline, status updates, brackets) lands in a follow-up change.
 */
export default function PartidosPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="flex max-w-xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Partido Status
        </h1>
        <p className="text-lg leading-8 text-zinc-400">
          Partido Status — Próximamente.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-green-500 transition-colors hover:text-green-400"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}