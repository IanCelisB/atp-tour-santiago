export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-24 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">ATP Tour Santiago</h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Campeonato de tenis en Santiago: campeonatos, jugadores, brackets y timeline de partidos.
          Próximamente.
        </p>
      </div>
    </main>
  );
}
