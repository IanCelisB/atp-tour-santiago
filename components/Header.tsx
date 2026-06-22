"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, Trophy, Users, Activity, Newspaper, TrendingUp, Image } from "lucide-react";
import { logoutAction } from "@/app/login/actions";

const NAV_LINKS = [
  { href: "/campeonatos", label: "Campeonatos", icon: Trophy },
  { href: "/jugadores", label: "Jugadores", icon: Users },
  { href: "/partidos", label: "Partidos", icon: Activity },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/ranking", label: "Ranking", icon: TrendingUp },
  { href: "/galeria", label: "Galería", icon: Image },
] as const;

export interface HeaderUser {
  email: string;
  role: "admin" | "view";
}

export function Header({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-white transition-colors duration-200 hover:text-zinc-300"
        >
          ATP Tour Santiago
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 sm:flex">
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

        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 text-sm md:flex">
                <span className="text-zinc-400">{user.email}</span>
                {user.role === "admin" && (
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-300">
                    ADMIN
                  </span>
                )}
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/50"
              title="Iniciar sesión"
            >
              <LogIn className="h-4 w-4" strokeWidth={2} />
              <span>Iniciar sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
