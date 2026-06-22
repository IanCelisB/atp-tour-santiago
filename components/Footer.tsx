import { Mail, Phone } from "lucide-react";

/**
 * Site footer — static, no auth logic.
 *
 * Contact info on the right, copyright on the left.
 */
export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40 px-6 py-8 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 ATP Tour Santiago</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <a
            href="tel:+56993179468"
            className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
          >
            <Phone className="h-4 w-4" strokeWidth={1.5} />
            <span>+56 9 9317 9468</span>
          </a>
          <a
            href="mailto:Jonex.3@gmail.com"
            className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            <span>Jonex.3@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
