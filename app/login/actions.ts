"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { loginAction as loginDomainAction } from "@/lib/actions/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await loginDomainAction(prisma, email, password);

  if (result.success) {
    const session = await getSession();
    session.userId = result.data.email; // will be replaced with real userId below
    session.email = result.data.email;
    session.role = result.data.role as "admin" | "view";

    // Fetch the real userId for the session
    const user = await prisma.user.findUnique({
      where: { email: result.data.email },
      select: { id: true },
    });
    if (user) {
      session.userId = user.id;
    }

    await session.save();
  }

  return result;
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
}
