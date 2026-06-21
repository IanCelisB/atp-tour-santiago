import Link from "next/link";

/**
 * Placeholder route for the Noticias section.
 *
 * Created as part of the homepage navigation feature so each menu card
 * resolves to a real (not 404) page. The full feature implementation
 * (article list, detail, RSS) lands in a follow-up change.
 */
export default function NoticiasPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="flex max-w-xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Noticias
        </h1>
        <p className="text-lg leading-8 text-zinc-400">
          Noticias — Próximamente.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-purple-500 transition-colors hover:text-purple-400"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}