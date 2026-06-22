"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { loginAction as loginDomainAction } from "@/lib/actions/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await loginDomainAction(prisma, email, password);

  if (!result.success) {
    return result;
  }

  const session = await getSession();
  session.email = result.data.email;
  session.role = result.data.role as "admin" | "view";

  // Fetch the real userId for the session
  const user = await prisma.user.findUnique({
    where: { email: result.data.email },
    select: { id: true },
  });
  session.userId = user?.id ?? result.data.email;

  await session.save();

  // Server-side redirect to the homepage. redirect() throws NEXT_REDIRECT
  // which Next.js catches and turns into a 307 — control never returns here.
  redirect("/");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
}
