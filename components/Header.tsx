"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Users, Activity, Newspaper, TrendingUp, Image } from "lucide-react";

const NAV_LINKS = [
  { href: "/campeonatos", label: "Campeonatos", icon: Trophy },
  { href: "/jugadores", label: "Jugadores", icon: Users },
  { href: "/partidos", label: "Partidos", icon: Activity },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/ranking", label: "Ranking", icon: TrendingUp },
  { href: "/galeria", label: "Galería", icon: Image },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-white transition-colors duration-200 hover:text-zinc-300"
        >
          ATP Tour Santiago
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
