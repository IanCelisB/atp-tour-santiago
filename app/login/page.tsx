import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "./form";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session.userId) {
    redirect("/");
  }
  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-24 font-sans text-zinc-50">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          Iniciar Sesión
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
