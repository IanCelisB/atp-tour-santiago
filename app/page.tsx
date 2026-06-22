import { HomeMenu } from "@/components/HomeMenu";
import { CampeonatoTimeline } from "@/components/CampeonatoTimeline";

/**
 * Homepage — Linear.app inspired redesign.
 *
 * Sections:
 *  1. Hero — gradient title + subtitle
 *  2. Nav grid — existing HomeMenu cards
 *  3. Timeline — last 5 completed campeonatos with winners
 *
 * The H1 "ATP Tour Santiago" is preserved for the E2E smoke test
 * (e2e/smoke.spec.ts) which asserts it is visible.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="flex w-full max-w-5xl flex-col items-center gap-16">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Temporada 2026
          </div>

          <h1 className="bg-gradient-to-br from-white via-white to-zinc-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
            ATP Tour Santiago
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-zinc-400">
            El punto de encuentro digital del tenis profesional chileno.
            Campeonatos, jugadores, partidos y noticias — todo en un solo
            lugar.
          </p>
        </section>

        {/* ── Navigation Grid ───────────────────────────────────── */}
        <section className="w-full">
          <HomeMenu />
        </section>

        {/* ── Timeline ──────────────────────────────────────────── */}
        <CampeonatoTimeline />
      </div>
    </main>
  );
}
