import { HomeMenu } from "@/components/HomeMenu";

/**
 * Homepage — dark hero with a 2x2 navigation grid.
 *
 * The H1 "ATP Tour Santiago" is intentionally preserved here because the
 * E2E smoke test (e2e/smoke.spec.ts) asserts it is visible; renaming it
 * or restyling it would break that contract.
 *
 * The body of the page delegates the navigation cards to
 * `components/HomeMenu.tsx`, which reads from `lib/menu-config.ts` —
 * that trio is the single source of truth for which sections exist.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="flex w-full max-w-5xl flex-col items-center gap-10 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            ATP Tour Santiago
          </h1>
        </div>

        {/* Descripción */}
        <section className="mt-8 max-w-3xl text-left">
          <h2 className="mb-4 text-2xl font-semibold text-white">
            ¿Qué es ATP Tour Santiago?
          </h2>
          <div className="space-y-4 text-base leading-7 text-zinc-300">
            <p>
              <strong className="text-white">ATP Tour Santiago</strong> es el
              punto de encuentro digital del tenis profesional chileno.
              Acá vas a encontrar toda la información sobre los campeonatos
              que se disputan en Santiago, los jugadores que compiten, el
              estado de cada partido y las últimas noticias del circuito.
            </p>
            <p>
              Un <strong className="text-amber-400">campeonato</strong> es un
              torneo de tenis donde los jugadores se enfrentan en un bracket
              de eliminación directa. Desde la primera ronda hasta la final,
              cada partido cuenta, y el que pierde queda fuera. Así se
              coronan los campeones.
            </p>
            <p>
              Explorá las secciones para conocer a los jugadores, seguir los
              partidos en vivo, enterarte de los próximos torneos y mantenerte
              al día con todo lo que pasa en el ATP Tour Santiago.
            </p>
          </div>
        </section>
        <HomeMenu />
      </div>
    </main>
  );
}