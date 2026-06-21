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
          <p className="text-lg leading-8 text-zinc-400">
            Elegí una sección para comenzar.
          </p>
        </div>
        <HomeMenu />
      </div>
    </main>
  );
}