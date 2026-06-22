import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/app/login/actions";

export async function Footer() {
  const session = await getSession();
  const isLoggedIn = !!session.userId;
  const isAdminUser = session.role === "admin";

  return (
    <footer className="border-t border-white/10 bg-black/40 px-6 py-6 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between text-sm text-zinc-500">
        <p>© 2026 ATP Tour Santiago</p>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="flex items-center gap-2 text-zinc-400">
                {session.email}
                {isAdminUser && (
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-300">
                    ADMIN
                  </span>
                )}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Salir
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
              title="Iniciar sesión"
            >
              <LogIn className="h-4 w-4" strokeWidth={1.5} />
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
